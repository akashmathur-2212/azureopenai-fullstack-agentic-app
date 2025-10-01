import React, { useState } from "react";
import "./ChatInterface.css";
import logo from "../assets/BlueGEN.jpg";
import DOMPurify from 'dompurify';
import { intelligentFormatToHTML } from '../utils/formatter';

const ChatInterface = () => {
  const [file, setFile] = useState(null);
  const [toc, setToc] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [query, setQuery] = useState("");
  const [responses, setResponses] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setToc(data.table_of_contents);
      setSessionId(data.session_id);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const handleQuery = async () => {
    if (!query.trim() || !sessionId) return;

    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("query", query);

    try {
      const res = await fetch("http://localhost:8000/query", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResponses((prev) => [...prev, { query, response: data.response }]);
      setQuery("");
    } catch (err) {
      console.error("Query failed:", err);
    }
  };

  return (
    <div className="chat-container">
      <button className="left-toggle-button" onClick={() => setSidebarOpen((prev) => !prev)}>
        {sidebarOpen ? "✖" : "☰"}
      </button>

      {sidebarOpen && (
        <div className="sidebar left-sidebar">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={handleUpload}>Upload</button>

          {toc && (
            <div className="toc">
              <h3>Table of Contents</h3>
              <ul>
                {toc.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="center-and-right">
        {!toc ? (
          <div className="main-content">
            <div className="welcome-message">
              <h2>👋 Welcome! I'm your AI-powered RFQ Assistant.</h2>
              <p>I can help you to:</p>
              <ul>
                <li>Extract and summarize technical and commercial requirements from RFQs</li>
                <li>Compare requirements with previous project submissions and responses</li>
                <li>Highlight overlaps, coverage, and new or missing requirements for bid teams</li>
              </ul>
              <p>Tell me what you are looking for, and I'll help you!</p>
              <strong>Example Prompts:</strong>
              <ul>
                <li>Can you tell me the requirements related to &lt;topic&gt;?</li>
                <li>Can you list down all the requirements related to &lt;topic&gt;?</li>
                <li>Can you tell me the requirements related to &lt;topic&gt; and compare it with the history submissions?</li>
                <li>Can you list down all the requirements related to &lt;topic&gt; and compare it with the previous responses?</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="chat-history">
              {responses.map((res, idx) => (
                <div key={idx} className="chat-response">
                  <div className="message user-message">
                    <span className="message-icon">🧑</span>
                    <span className="message-text">{res.query}</span>
                  </div>
                  <div className="message ai-message">
                    <span className="message-icon">🤖</span>
                    <div
                      className="message-text"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(intelligentFormatToHTML(res.response))
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <form
              className="chat-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleQuery();
              }}
            >
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question..."
                  className="chat-input-field"
                />
                <button type="submit" className="send-button">
                  ➤
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {toc && rightSidebarOpen && (
        <div className="right-sidebar">
          <button className="right-toggle-button" onClick={() => setRightSidebarOpen(false)}>
            ✖
          </button>
          <div className="welcome-message">
            <h2>👋 Instructions</h2>
            <p>I can help you to:</p>
            <ul>
              <li>Extract and summarize technical and commercial requirements from RFQs</li>
              <li>Compare requirements with previous project submissions and responses</li>
              <li>Highlight overlaps, coverage, and new or missing requirements for bid teams</li>
            </ul>
            <strong>Example Prompts:</strong>
            <ul>
              <li>Can you tell me the requirements related to &lt;topic&gt;?</li>
              <li>Can you list down all the requirements related to &lt;topic&gt;?</li>
              <li>Can you tell me the requirements related to &lt;topic&gt; and compare it with the history submissions?</li>
              <li>Can you list down all the requirements related to &lt;topic&gt; and compare it with the previous responses?</li>
            </ul>
          </div>
        </div>
      )}

      {toc && !rightSidebarOpen && (
        <button className="right-toggle-open" onClick={() => setRightSidebarOpen(true)}>
          ☰
        </button>
      )}
    </div>
  );
};

export default ChatInterface;
