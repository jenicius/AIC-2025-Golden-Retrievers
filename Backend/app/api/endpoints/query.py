from fastapi import APIRouter, Form, File, UploadFile
from app.schemas.query import TextQueryRequest, OcrQueryRequest
from app.schemas.video import SearchResponse
from app.services.retrieval import golden_retriever

router = APIRouter()

@router.post("/text", response_model=SearchResponse)
async def query_by_text(query: TextQueryRequest):
    results = golden_retriever.search_by_text(
        model=query.model, metric=query.metric, topK=query.topK, queryText=query.queryText
    )
    return SearchResponse(results=results)

@router.post("/image", response_model=SearchResponse)
async def query_by_image(
    model: str = Form(...),
    metric: str = Form(...),
    topK: int = Form(...),
    image: UploadFile = File(...)
):
    image_bytes = await image.read()
    results = golden_retriever.search_by_image(
        model=model, metric=metric, topK=topK, image_bytes=image_bytes
    )
    return SearchResponse(results=results)

@router.post("/ocr", response_model=SearchResponse)
async def query_by_ocr(query: OcrQueryRequest):
    results = golden_retriever.search_by_ocr(
        model=query.model, metric=query.metric, topK=query.topK, queryText=query.queryText
    )
    return SearchResponse(results=results)

@router.post("/frame-idx", response_model=SearchResponse)
async def query_by_frame_idx(
    video_name: str = Form(...),
    frame_idx: int = Form(...),
    range: int = Form(...)
):
    results = golden_retriever.search_by_frame_idx(
        video_name=video_name, frame_idx=frame_idx, range=range
    )
    return SearchResponse(results=results)