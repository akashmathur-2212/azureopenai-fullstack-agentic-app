from llama_index.embeddings.azure_openai import AzureOpenAIEmbedding
from llama_index.llms.azure_openai import AzureOpenAI
from llama_index.core import Settings
from dotenv import load_dotenv
import os

load_dotenv()


def setup_models():

    api_key = os.getenv("api_key")
    endpoint = os.getenv("endpoint")
    api_version = os.getenv("api_version")
    model_name = os.getenv("model_name")
    deployment = os.getenv("deployment")
    embed_name = os.getenv("embed_name")
    embed_deployment = os.getenv("embed_deployment")

    llm = AzureOpenAI(
        model=model_name,
        deployment_name=deployment,
        api_key=api_key,
        azure_endpoint=endpoint,
        api_version=api_version,
        temperature=0,
        streaming=True,
    )

    # You need to deploy your own embedding model as well as your own chat completion model
    embed_model = AzureOpenAIEmbedding(
        model=embed_name,
        deployment_name=embed_deployment,
        api_key=api_key,
        azure_endpoint=endpoint,
        api_version=api_version,
    )

    Settings.llm = llm
    Settings.embed_model = embed_model

    return llm, embed_model
