from pydantic import BaseModel

class TextQueryRequest(BaseModel):
    model: str
    metric: str
    topK: int
    queryText: str

class OcrQueryRequest(BaseModel):
    model: str
    metric: str
    topK: int
    queryText: str
    
class SpeechQueryRequest(BaseModel):
    model: str
    metric: str
    topK: int
    queryText: str

class FrameIdxQueryRequest(BaseModel):
    video_name: str
    frame_idx: int
    range: int

class TextListQueryRequest(BaseModel):
    model: str
    metric: str
    topK: int
    queryTextList: list[str]