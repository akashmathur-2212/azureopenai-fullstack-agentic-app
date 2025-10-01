from utils import (
    get_unique_file_id,
    read_data_and_return_tbc,
    create_data_chunks,
    generate_red_flags,
)
from rag_pipeline import load_requirements_index, load_history_index
import os
import shutil
from fastapi import FastAPI, UploadFile, File

session_cache = {}


async def process_upload(file: UploadFile = File(...)):
    # Create a unique ID and save file locally
    filename = get_unique_file_id(file)

    # Step 1: Save the uploaded file to a temporary path
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, filename)

    # Save the uploaded file locally
    with open(temp_path, "wb") as out_file:
        file_content = await file.read()
        if not file_content:
            raise ValueError("Uploaded file is empty")
        out_file.write(file_content)

    document_text, toc = read_data_and_return_tbc(temp_path)
    nodes = create_data_chunks(document_text)

    # Red Flags DF creation
    red_flags = generate_red_flags(nodes)

    # Index creation
    req_index = load_requirements_index(nodes, filename)
    # history_index = load_history_index()

    # Cache the index for this session
    session_cache[filename] = {
        "req_index": req_index,
    }  # , "history_index": history_index

    print(session_cache)

    return {"session_id": filename, "table_of_contents": toc, "red_flags": red_flags}
