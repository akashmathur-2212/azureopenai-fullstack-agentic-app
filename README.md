# 🚀 AzureOpenAI Fullstack LlamaIndex-powered Agent

[![React](https://img.shields.io/badge/frontend-React-61DAFB?logo=react\&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688?logo=fastapi\&logoColor=white)](#)
[![LlamaIndex](https://img.shields.io/badge/RAG-LlamaIndex-6C5CE7)](#)
[![Azure OpenAI](https://img.shields.io/badge/LLM-Azure%20OpenAI-0078D4?logo=microsoftazure\&logoColor=white)](#)

---

## 📖 Overview

This project demonstrates a **full-stack agentic AI system** using:

* **React frontend** for interactive user experience.
* **Python (FastAPI) backend** hosting a LlamaIndex-powered intelligent agent.
* **Retrieval-Augmented Generation (RAG)** for grounding responses in enterprise data.
* **Dual memory architecture**: short-term (contextual) + long-term (document-driven).

⚡It simulates human-like dialogue by remembering past interactions while referencing structured knowledge sources. This makes conversations **context-aware, coherent, and factually accurate**.

---

## 🏗️ System Architecture

The architecture follows a **layered design**:

1. **Frontend (React)**

   * Captures user queries.
   * Displays streaming AI responses in real time.

2. **Backend (FastAPI)**

   * Generate model output token-by-token for responsiveness.
   * Manages conversation history and document retrieval.
   * Hosts the **agent** for memory, prompt assembly, and model inference.

---

## 🧠 Memory Systems

* **Short-Term Memory**

  * Maintains active dialogue context across turns.
  * Implemented via in-memory buffers tracking recent user + agent messages.

* **Long-Term Memory (RAG)**

  * Stores knowledge extracted from RFQs, reports, and documents.
  * Backed by a **custom semantic search pipeline** for factual retrieval.
  * Significantly reduces hallucinations and ensures grounded responses.

---

## 📚 RAG Pipeline & Document Processing

1. **Ingestion**: PDFs/DOCX → parsed with tools like `docling` (preserving structure & headings).
2. **Preprocessing**: Clean, normalize, and split into semantically meaningful chunks.
3. **Embedding**: Encode chunks via **OpenAI embeddings**.
4. **Vector Store**: Store vectors + metadata in a searchable DB.
5. **Retrieval**: At query time, retrieve top-ranked chunks.
6. **Prompt Assembly**: Combine retrieved knowledge + short-term memory → send to LLM.

---

## 🤖 Agent Logic & Prompt Engineering

* Orchestrates **context gathering** from both memory systems.
* Uses **prompt templates** to:

  * Define assistant persona & tone.
  * Enforce formatted outputs (HTML Headings, bullet points etc.).
  * Guide tasks such as requirement extraction, comparison, or gap analysis.

---

## 🎥 Demo

👉 [Watch the demo video](https://github.com/user-attachments/assets/27760040-4424-4adb-93c1-9c4da8bc89d4)

---

## ⚙️ Getting Started

### 1️⃣ Clone the repo

```bash
git clone https://github.com/akashmathur-2212/azureopenai-fullstack-agentic-app.git
cd azureopenai-fullstack-agentic-app
```

---

### 2️⃣ Backend Setup (FastAPI + LlamaIndex)

```bash
cd backend

# (Recommended) Create virtual environment
python -m venv venv
source venv/bin/activate   # On Mac/Linux
venv\Scripts\activate      # On Windows

# Install dependencies
pip install -r requirements.txt
```

Add your environment variables (create a `.env` file inside `backend/`):

```
api_key = your_azure_openai_key
endpoint = your_azure_endpoint
api_version = your_azure_api_version
model_name = your_azure_model_name
deployment = your_deployment_name
```

Run the backend:

```bash
python run main.py
```

(Default runs at `http://localhost:8000`)

---

### 3️⃣ Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm start
```

(Default runs at `http://localhost:3000`)

---

## 👨‍💻 Author

**Akash Mathur**  
Senior Machine Learning Engineer, Amsterdam, Netherlands  
Building secure, scalable, and intelligent systems.

[LinkedIn](https://www.linkedin.com/in/akashmathur22/) • [GitHub](https://github.com/akashmathur-2212)

---

Feel free to explore, fork, and contribute!