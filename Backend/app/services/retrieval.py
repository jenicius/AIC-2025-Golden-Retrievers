# backend/app/services/golden_retriever.py

import json
import io
import torch
import open_clip
import pandas as pd
from faiss import read_index
from PIL import Image
from app.core.config import settings
from app.schemas.video import VideoItem

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
        
        print("Initialization complete.")


    def load_model(self, model_name: str):
        if self.current_model == model_name:
            return 
            
        if model_name not in [m[0] for m in self.available_models]:
            raise ValueError(f"Model {model_name} not available.")
        
        pretrained = self.available_models[[m[0] for m in self.available_models].index(model_name)][1]
        
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            model_name=model_name,
            pretrained=pretrained
        )
        self.model.to(self.device).eval()
        self.tokenizer = open_clip.get_tokenizer(model_name)
        
        index_path = f'{settings.DATA_PATH}/{model_name}_{pretrained}/faiss.index'
        self.index = read_index(index_path)
        self.current_model = model_name


    def _format_results(self, indices) -> list[VideoItem]:
        results = []
        for i in indices[0]:
            try:
                video_name, frame_n = self.id_to_video[i]
                
                video_csv_path = f'{settings.DATA_PATH}/map-keyframes-aic25-b1/map-keyframes/{video_name}.csv'
                video_csv = pd.read_csv(video_csv_path)
                frame_row = video_csv[video_csv['n'] == frame_n]            
                start_time = frame_row['pts_time'].values[0]
                frame_idx = frame_row['frame_idx'].values[0]

                video_json_path = f'{settings.DATA_PATH}/media-info-aic25-b1/media-info/{video_name}.json'
                video_json = json.load(open(video_json_path, encoding='utf-8'))
                youtube_id = video_json.get('watch_url', '').split('?v=')[-1]

                results.append(
                    VideoItem(
                        id = i,
                        video_name = video_name,
                        youtube_id = youtube_id,
                        start_time = round(start_time),
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

        distances, indices = self.index.search(text_features, topK)
        
        return self._format_results(indices)


    def search_by_image(self, model: str, metric: str, topK: int, image_bytes: bytes) -> list[VideoItem]:
        self.load_model(model)
        
        image_stream = io.BytesIO(image_bytes)
        image = Image.open(image_stream).convert("RGB")
        
        processed_image = self.preprocess(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            image_features = self.model.encode_image(processed_image).float().numpy()

        distances, indices = self.index.search(image_features, topK)
        
        return self._format_results(indices)
    
    
    def search_by_ocr(self, model: str, metric: str, topK: int, queryText: str) -> list[VideoItem]:
        # TODO: Implement OCR search logic
        print("OCR search is not yet implemented.")
        return []
    
    def search_by_frame_idx(self, video_name: str, frame_idx: int, range: int) -> list[VideoItem]:
        video_csv_path = f'{settings.DATA_PATH}/map-keyframes-aic25-b1/map-keyframes/{video_name}.csv'
        video_csv = pd.read_csv(video_csv_path)
        
        if frame_idx not in video_csv['frame_idx'].values:
            raise ValueError(f"Frame index {frame_idx} not found in video {video_name}.")
        
        frame_row = video_csv[video_csv['frame_idx'] >= frame_idx]
        target_n = frame_row['n'].values[0]
        
        lower_bound = max(0, target_n - range)
        upper_bound = target_n + range
        
        relevant_rows = video_csv[(video_csv['n'] >= lower_bound) & (video_csv['n'] <= upper_bound)]
        
        results = []
        for _, row in relevant_rows.iterrows():
            n = row['n']
            frame_idx = row['frame_idx']
            pts_time = row['pts_time']
            
            video_json_path = f'{settings.DATA_PATH}/media-info-aic25-b1/media-info/{video_name}.json'
            video_json = json.load(open(video_json_path, encoding='utf-8'))
            youtube_id = video_json.get('watch_url', '').split('?v=')[-1]
            
            results.append(
                VideoItem(
                    id = self.video_to_id.get((video_name, n), -1),
                    video_name = video_name,
                    youtube_id = youtube_id,
                    start_time = round(pts_time),
                    frame_idx = frame_idx
                )
            )
        
        return results

golden_retriever = GoldenRetriever()