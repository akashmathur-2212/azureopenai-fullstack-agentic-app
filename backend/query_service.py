from rag_pipeline import create_query_engines, load_history_index
from agent import create_unified_chat_engine
from document_service import session_cache


def handle_query(session_id, query, llm):

    if session_id not in session_cache:
        return {"error": "Invalid session ID or session expired."}

    req_index = session_cache[session_id]["req_index"]
    history_index = load_history_index()

    requirements_qe, history_qe = create_query_engines(req_index, history_index)

    chat_engine = create_unified_chat_engine(llm, requirements_qe, history_qe)

    try:
        response = chat_engine.chat(query)

        if len(response.sources) > 0:
            response_text = response.sources[0].raw_output
        else:
            response_text = response.response

    except Exception as e:
        return {"error": "LLM query failed", "details": str(e)}

    print("Sending response to frontend:", response_text)

    return {"response": response_text}
