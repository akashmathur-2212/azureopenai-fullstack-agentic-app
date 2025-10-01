from llama_index.core.tools import FunctionTool
from llama_index.agent.openai import OpenAIAgent
from llama_index.core.memory import ChatMemoryBuffer
from prompts import SYSTEM_PROMPT
from config import MEMORY_TOKEN_LIMIT

shared_memory = ChatMemoryBuffer.from_defaults(token_limit=MEMORY_TOKEN_LIMIT)


def extract_comprehensive_requirements(query, llm, requirements_query_engine):
    req_nodes = requirements_query_engine.query(query).source_nodes
    requirements_text = "\n\n".join([n.node.get_content() for n in req_nodes])

    extraction_prompt = f"""
    You are an expert in analyzing engineering RFQs (Requests for Quotation) and historical project documentation, with deep domain knowledge in mechanical engineering for the oil and gas industry.

    You support the business development function of your company by extracting, comparing, and organizing technical and commercial requirements from RFQs and aligning them with past project responses. 
    
    Your insights directly inform bid/no-bid decisions, proposal strategies, and response quality.

    Below is a set of extracted requirements related to a user query:
    -----------------------------
    {requirements_text}

    # Instructions
    - Generate a **detailed summary** AND **list of requirements** related to that topic.
    - Generate requirements only based on the context, **Don't** repeat any requirements.
    - Answer using HTML formatting. Use <h1>, <h2>, <h3> for section heading 1,2,3 and so on, and <ul><li> for bullet points.
    - **Strictly** format the response using the below HTML convention, keep the headings like **Summary** and **Requirements** as it is.

    # Response Format
    <answer>
    <h2>Summary</h2>
    <p>Write a brief but comprehensive summary of the requirements for this topic</p>

    <h2>Requirements</h2>
    <ul>
        <li>First requirement</li>
        <li>Second requirement</li>
        <li>...</li>
    </ul>
    </answer>

    Do not generate unnecessary output.
    """

    response = llm.complete(extraction_prompt)
    return response.text


def compare_rfq_with_history(
    query, llm, requirements_query_engine, history_query_engine
):

    req_nodes = requirements_query_engine.query(query).source_nodes
    hist_nodes = history_query_engine.query(query).source_nodes

    requirements_text = "\n\n".join([n.node.get_content() for n in req_nodes])
    history_text = "\n\n".join([n.node.get_content() for n in hist_nodes])

    comparison_prompt = f"""
    You are an expert in analyzing engineering RFQs (Requests for Quotation) and historical project documentation, with deep domain knowledge in mechanical engineering for the oil and gas industry.

    You support the business development function of your company by extracting, comparing, and organizing technical and commercial requirements from RFQs and aligning them with past project responses. 
    
    Your insights directly inform bid/no-bid decisions, proposal strategies, and response quality.

    Below are two sections of text:

    1. **RFQ Requirements**: These are requirements from a COMPANY asking for a Single Point Mooring system.
    -----------------------------
    {requirements_text}

    2. **Historical Responses**: These are Bluewater's past submissions or implementations for similar requests.
    -----------------------------
    {history_text}

    # Instructions
    - Compare the RFQ Requirements with the Historical Responses.
    - List what requirements from the RFQ are **already covered in the historical responses** (clearly mention which ones and the Source).
    - Always include all three sources in your response and ensure that each requirement is covered.
    - **Avoid** repeating the same requirement across multiple sources.
    - List the **new requirements from the RFQ that are not found in the historical responses**.
    - Be specific and use bullet points for clarity.

    # Guidelines:
    - **Strictly** format the output using the below HTML convention, keep the headings like **Historical Response Coverage** and **Uncovered Requirements** as it is.
    - When generating historical coverage grouped by project (e.g., BENIN, SUPSA, CPC), ensure each project name appears only once in the response. 
    - Don't repeat the same Source twice.
    - **Strictly** use the emoji 🔗 with every bullet under the Source (e.g. BENIN, SUPSA, CPC). Don't use any other emoji.
    - Don't mention any Source in **Uncovered Requirements**
    
    # Response Format
    <answer>
    <h1>Historical Response Coverage</h1>
    
    <h2>Source</h2>
    <ul>
        <li>🔗...</li>
        <li>🔗...</li>
        <li>🔗...</li>
    </ul>

    <h2>Source</h2>
    <ul>
        <li>🔗...</li>
        <li>🔗...</li>
        <li>🔗...</li>
    </ul>

    <h1>Uncovered Requirements</h1>
    <ul>
        <li>...</li>
        <li>...</li>
        <li>...</li>
    </ul>
    </answer>

    """

    response = llm.complete(comparison_prompt)

    return response.text


def create_unified_chat_engine(llm, requirements_query_engine, history_query_engine):

    extract_tool = FunctionTool.from_defaults(
        name="ComprehensiveRequirements",
        fn=lambda query: extract_comprehensive_requirements(
            query, llm=llm, requirements_query_engine=requirements_query_engine
        ),
        description="Extract a detailed list of requirements grouped by topics (e.g., Welding, Coating, Safety).",
    )

    comparison_tool = FunctionTool.from_defaults(
        name="CompareRequirementsWithHistory",
        fn=lambda query: compare_rfq_with_history(
            query,
            llm=llm,
            requirements_query_engine=requirements_query_engine,
            history_query_engine=history_query_engine,
        ),
        description="Compare RFQ requirements with historical, past, previous, or prior responses, submissions, answers, documentation or records to identify covered and missing items.",
    )

    chat_engine = OpenAIAgent.from_tools(
        tools=[extract_tool, comparison_tool],
        system_prompt=SYSTEM_PROMPT,
        memory=shared_memory,
        verbose=True,
    )

    return chat_engine
