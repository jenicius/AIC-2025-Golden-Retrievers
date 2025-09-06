import gc
import os
import json
import io
import torch
import open_clip
import pandas as pd
from faiss import read_index
from PIL import Image
from app.core.config import settings
from app.schemas.video import VideoItem
import unicodedata

#helper
def strip_accents(text: str) -> str:
    """
    Convert Vietnamese (or any accented text) into plain ASCII.
    E.g. 'Việt Nam' -> 'Viet Nam'
    """
    text = unicodedata.normalize('NFD', text)
    text = ''.join(ch for ch in text if unicodedata.category(ch) != 'Mn')
    return text


class GoldenRetriever:
    def __init__(self):
        print("Initializing GoldenRetriever...")
        
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.available_models = [
            ('ViT-L-14', 'datacomp_xl_s13b_b90k'),
            ('ViT-L-14-quickgelu', 'dfn2b'),
            ('ViT-H-14-quickgelu', 'dfn5b'),
            ('PE-Core-L-14-336', 'meta'),
        ]
        
        self.current_model = None
        self.load_model('ViT-L-14') 
        
        mapping_path = f'{settings.DATA_PATH}/file_name_mapping.json'
        self.id_to_video = json.load(open(mapping_path))
        self.video_to_id = {(v[0], v[1]): k for k, v in self.id_to_video.items()}
        self.id_to_video = {int(k): v for k, v in self.id_to_video.items()}
        
        self.full_index = json.load(open(f'{settings.DATA_PATH}/OCR/full_index.json', 'r', encoding='utf-8'))
        self.word_index = json.load(open(f'{settings.DATA_PATH}/OCR/word_index.json', 'r', encoding='utf-8'))
        
        print("Initialization complete.")
        print(self.device)


    def load_model(self, model_name: str):
        if self.current_model == model_name:
            return 
            
        if model_name not in [m[0] for m in self.available_models]:
            raise ValueError(f"Model {model_name} not available.")
        
        if hasattr(self, "model") and self.model is not None:
            del self.model
            del self.index
            torch.cuda.empty_cache()   
            gc.collect()              
        
        pretrained = self.available_models[[m[0] for m in self.available_models].index(model_name)][1]
        
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            model_name=model_name,
            pretrained=pretrained
        )
        self.model.to(self.device).eval()
        self.tokenizer = open_clip.get_tokenizer(model_name)
        
        index_path = f'{settings.DATA_PATH}/Embeddings/{model_name}_{pretrained}/faiss.index'
        self.index = read_index(index_path)
        self.current_model = model_name


    def _format_results(self, ids) -> list[VideoItem]:
        results = []
        for i in ids:
            try:
                video_name, frame_idx = self.id_to_video[i]

                video_json_path = f'{settings.DATA_PATH}/media-info-aic25/{video_name}.json'
                video_json = json.load(open(video_json_path, encoding='utf-8'))
                youtube_id = video_json.get('watch_url', '').split('?v=')[-1]
                fps = video_json.get('fps', 0)  # Default to 30 if not found

                results.append(
                    VideoItem(
                        id = i,
                        video_name = video_name,
                        youtube_id = youtube_id,
                        start_time = round(frame_idx / fps) if fps is not None else 0,
                        frame_idx = frame_idx
                    )
                )
            except (KeyError, FileNotFoundError) as e:
                print(f"Could not process result for index {i}. Error: {e}")
        return results


    def search_by_text(self, model: str, metric: str, topK: int, queryText: str) -> list[VideoItem]:
        self.load_model(model)
        text_tokens = self.tokenizer([queryText]).to(self.device)
        with torch.no_grad():
            text_features = self.model.encode_text(text_tokens).float().cpu().numpy()

        distances, ids = self.index.search(text_features, topK)

        return self._format_results(ids[0])


    def search_by_image(self, model: str, metric: str, topK: int, image_bytes: bytes) -> list[VideoItem]:
        self.load_model(model)
        
        image_stream = io.BytesIO(image_bytes)
        image = Image.open(image_stream).convert("RGB")
        
        processed_image = self.preprocess(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            image_features = self.model.encode_image(processed_image).cpu().float().numpy()

        distances, ids = self.index.search(image_features, topK)
        
        return self._format_results(ids[0])
    

    def search_by_ocr(self, model: str, metric: str, topK: int, queryText: str) -> list[VideoItem]:
        ids = []
        queryText_norm = strip_accents(queryText).lower()

        for text in self.full_index['corpus']:
            text_norm = strip_accents(text).lower()
            if queryText_norm in text_norm:
                ids.extend(self.full_index['inverted_index'][text])
                if len(ids) >= topK:
                    break
        
        if len(ids) > topK:
            ids = ids[:topK]
        else:
            match = {}
            tokens = queryText_norm.split()
            for token in tokens:
                corpus = self.word_index['corpus']
                match[token] = []
                for word in corpus:
                    if token in strip_accents(word):
                        match[token].extend(self.word_index['inverted_index'][word])
                match[token] = list(set(match[token]))
            
            scores = {}
            for token in tokens:
                for video_id in match[token]:
                    if video_id not in scores:
                        scores[video_id] = 0
                    scores[video_id] += 1
            sorted_scores = sorted(scores.items(), key=lambda x: (-x[1], x[0]))[:topK-len(ids)]
            ids.extend([video_id for video_id, _ in sorted_scores])
        
        ids = [int(i) for i in ids]
        return self._format_results(ids)
    
    
    def search_by_frame_idx(self, video_name: str, frame_idx: int, window: int) -> list[VideoItem]:
        video_json_path = f'{settings.DATA_PATH}/media-info-aic25/{video_name}.json'
        if not os.path.exists(video_json_path):
            raise ValueError(f"Video {video_name} not found.")
        
        data = json.load(open(video_json_path, encoding='utf-8'))
        fps = data.get('fps', 30)  # Default to 30 if not found
        keyframes = data.get('keyframes', [])
        if not keyframes:
            raise ValueError(f"No keyframes found for video {video_name}.")
        # Get the index in the array of the closest keyframe at or after the given frame_idx
        choosen_idx = next((i for i, kf in enumerate(keyframes) if kf >= frame_idx), len(keyframes)-1)
        start_idx = max(0, choosen_idx - window)
        end_idx = min(len(keyframes) - 1, choosen_idx + window)
        results = []
        for i in range(start_idx, end_idx + 1):
            frame = keyframes[i]
            id = self.video_to_id.get((video_name, frame))
            results.append(
                VideoItem(
                    id = id,
                    video_name = video_name,
                    youtube_id = data.get('watch_url', '').split('?v=')[-1],
                    start_time = round(frame / fps) if fps is not None else 0,
                    frame_idx = frame
                )
            )
        return results
        
    def search_video_by_text(self, model: str, metric: str, topK: int, queryText: str) -> list[VideoItem]:
        frames = self.search_by_text(model, metric, topK, queryText)
        video = {}

        for frame in frames:
            if video.get(frame.video_name) is None:
                video[frame.video_name] = frame
            # elif frame.frame_idx < video[frame.video_name].frame_idx:
            #     video[frame.video_name] = frame

        return list(video.values())
    
    def search_video_by_text_list(self, model: str, metric: str, topK: int, queryTextList: list[str]) -> list[VideoItem]:
        total_index: dict[str, int] = {}
        video: dict[str,VideoItem] = {}
        
        query_results = [self.search_video_by_text(model, metric, topK, queryText) for queryText in queryTextList]
        video_name_lists = {frame.video_name for result in query_results for frame in result}
        for video_name in video_name_lists:
            frame_idx = 0
            cnt = 0
            sum = 0
            first_result = None
            for result in query_results:
                for (i,frame) in enumerate(result):
                    if frame.video_name == video_name and frame.frame_idx > frame_idx:
                        frame_idx = frame.frame_idx
                        cnt += 1
                        sum += i
                        if first_result is None:
                            first_result = frame
            if first_result is not None:
                video[video_name] = first_result
                total_index[video_name] = sum + topK * (len(query_results) - cnt)
        sorted_videos = sorted(video.values(), key=lambda f: total_index[f.video_name])
        return sorted_videos
    
    def convert_time_to_frame_idx(self, video_name: str, time: float) -> int:
        video_csv_path = f'{settings.DATA_PATH}/media-info-aic25/{video_name}.json'
        with open(video_csv_path, 'r', encoding='utf-8') as f:
            video_json = json.load(f)
            fps = video_json.get('fps')  # Default to 30 if not found
        if fps is not None:
            return int(time * fps)
        else:
            raise ValueError(f"FPS information not found for video {video_name}.")
    
golden_retriever = GoldenRetriever()