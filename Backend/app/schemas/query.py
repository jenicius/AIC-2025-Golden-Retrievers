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