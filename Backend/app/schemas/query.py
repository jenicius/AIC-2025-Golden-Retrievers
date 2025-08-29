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

class FrameIdxQueryRequest(BaseModel):
    video_name: str
    frame_idx: int
    range: int

class FrameRowQueryRequest(BaseModel):
    video_name: str
    frame_row: int
    range: int