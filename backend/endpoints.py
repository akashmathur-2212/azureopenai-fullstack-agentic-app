from fastapi import APIRouter, UploadFile, Form, Request
from document_service import process_upload
from query_service import handle_query

router = APIRouter()


@router.get("/")
async def home():
    return {"message": "Welcome! Use /upload to upload PDF or /query to run queries."}


@router.post("/upload")
async def upload_document(request: Request, file: UploadFile):
    llm = request.app.state.llm
    result = await process_upload(file)
    return result


@router.post("/query")
async def query_document(
    request: Request,
    session_id: str = Form(...),
    query: str = Form(...),
):
    llm = request.app.state.llm
    result = handle_query(session_id, query, llm)
    return result
