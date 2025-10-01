from llama_index.core import VectorStoreIndex, StorageContext, load_index_from_storage
from llama_index.core.postprocessor import SimilarityPostprocessor
from llama_index.core.storage.docstore import SimpleDocumentStore
from llama_index.core.vector_stores import SimpleVectorStore
from config import SIMILARITY_TOP_K, SIMILARITY_CUTOFF, history_persist_dir
import os


def load_history_index():

    context = StorageContext.from_defaults(
        persist_dir="C:/Users/akash.mathur/OneDrive - CGI/Desktop/Akash/Study/GenAI/BlueGen/backend/index/history_storage"
    )
    history_index = load_index_from_storage(context)

    return history_index


def load_requirements_index(nodes, filename):

    persist_dir = f"../index/requirements_storage/{filename}"

    if os.path.exists(persist_dir):
        try:
            storage_context = StorageContext.from_defaults(persist_dir=persist_dir)
            index = load_index_from_storage(storage_context)
            return index
        except Exception as e:
            print(f"Failed to load index from disk: {e}")

    # If index doesn't exist or loading failed, create a new one
    storage_context = StorageContext.from_defaults(
        docstore=SimpleDocumentStore(),
        vector_store=SimpleVectorStore(),
    )

    storage_context.docstore.add_documents(nodes)
    index = VectorStoreIndex(nodes, storage_context=storage_context)
    index.storage_context.persist(persist_dir=persist_dir)

    return index


def create_query_engines(index, history_index):
    postprocessor = SimilarityPostprocessor(similarity_cutoff=SIMILARITY_CUTOFF)

    requirements_query_engine = index.as_query_engine(
        similarity_top_k=SIMILARITY_TOP_K, node_postprocessors=[postprocessor]
    )
    history_query_engine = history_index.as_query_engine(
        similarity_top_k=SIMILARITY_TOP_K, node_postprocessors=[postprocessor]
    )

    return requirements_query_engine, history_query_engine
