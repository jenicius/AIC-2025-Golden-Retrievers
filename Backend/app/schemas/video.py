from pydantic import BaseModel
from typing import List

class VideoItem(BaseModel):
    id: int
    video_name: str
    youtube_id: str
    start_time: int
    frame_idx: int

class SearchResponse(BaseModel):
    results: List[VideoItem]