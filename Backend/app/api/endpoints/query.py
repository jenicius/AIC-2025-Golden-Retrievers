from pyexpat import model
from typing import Optional
from fastapi import APIRouter, Form, File, UploadFile
from app.schemas.query import SpeechQueryRequest, TextListQueryRequest, TextQueryRequest, OcrQueryRequest
from app.schemas.video import SearchResponse, TimeToFrameIdxResponse
from app.services.retrieval import golden_retriever
from app.services.readQuery import read_queries_from_folder
from fastapi import Request


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

@router.post("/speech", response_model=SearchResponse)
async def query_by_speech(request: Request):
    body = await request.json()
    print("Raw incoming JSON:", body)   # logs even invalid payload

    # Now try validation manually
    query = SpeechQueryRequest(**body)
    results = golden_retriever.search_by_speech(
        model=query.model,
        metric=query.metric,
        topK=query.topK,
        queryText=query.queryText
    )
    return SearchResponse(results=results)



@router.post("/frame-idx", response_model=SearchResponse)
async def query_by_frame_idx(
    video_name: str = Form(...),
    frame_idx: int = Form(...),
    window: int = Form(...)
):
    results = golden_retriever.search_by_frame_idx(
        video_name=video_name, frame_idx=frame_idx, window=window
    )
    return SearchResponse(results=results)

@router.post("/text-list-video", response_model=SearchResponse)
async def query_by_text_list(
    query: TextListQueryRequest
):
    results = golden_retriever.search_video_by_text_list(
        model=query.model, metric=query.metric, topK=query.topK, queryTextList=query.queryTextList
    )
    return SearchResponse(results=results)

@router.post("/time-to-frame-idx")
async def convert_time_to_frame_idx(
    video_name: str = Form(...),
    time: float = Form(...)
):
    result = golden_retriever.convert_time_to_frame_idx(
        video_name=video_name, time=time
    )
    return TimeToFrameIdxResponse(frame_idx=result)

@router.post("/read_queries")
async def read_queries():
    queries_text, queries_names = read_queries_from_folder()
    return {"queries_text": queries_text, "queries_names": queries_names}

@router.post("/multi-modal", response_model=SearchResponse)
async def query_by_multi_modal(
    model: str = Form(...),
    metric: str = Form(...),
    topK: int = Form(...),
    queryText: Optional[str] = Form(None),
    ocrText: Optional[str] = Form(None),
    speechText: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    image_bytes = await image.read() if image else None
    results = golden_retriever.search_by_multi_modal(
        model=model,
        metric=metric,
        topK=topK,
        text_query=queryText,
        image_bytes=image_bytes,
        ocr_query=ocrText,
        speech_query=speechText
    )
    return SearchResponse(results=results)