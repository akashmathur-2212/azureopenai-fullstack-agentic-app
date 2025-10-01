import React, { useState, useEffect } from "react";
import "./ChatInterface.css";
import logo from "../assets/BlueGEN.jpg";
import splashLogo from "../assets/logo.jpg";
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
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOutSplash, setFadeOutSplash] = useState(false);
  const [mainFadeIn, setMainFadeIn] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState(""); // Current streaming response
  const [isStreaming, setIsStreaming] = useState(false); // Stream status


  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);  // Start loading

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
    } finally {
      setIsUploading(false); // Stop loading
    }
  };

  const handleQuery = () => {
    if (!query.trim() || !sessionId) return;

    setResponses((prev) => [...prev, { query, response: "" }]);
    setStreamingResponse("");
    setIsStreaming(true);

    const socket = new WebSocket("ws://localhost:8000/ws/chat");

    socket.onopen = () => {
      const message = JSON.stringify({
        session_id: sessionId,
        query: query.trim(),
      });
      socket.send(message);
    };

    socket.onmessage = (event) => {
      if (event.data === "[DONE]") {
        socket.close();
        setIsStreaming(false);

        setResponses((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].response = streamingResponse;
          return updated;
        });

        setQuery("");
        setStreamingResponse("");
      } else {
        setStreamingResponse((prev) => prev + event.data);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      socket.close();
      setIsStreaming(false);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
  };

  useEffect(() => {
    const splashDuration = 2000;
    const fadeDuration = 1000;

    const timer1 = setTimeout(() => setFadeOutSplash(true), splashDuration);
    const timer2 = setTimeout(() => {
      setShowSplash(false);
      setMainFadeIn(true);
    }, splashDuration + fadeDuration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <>
      {showSplash && (
        <div className={`splash-screen ${fadeOutSplash ? "fade-out" : ""}`}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img src={splashLogo} alt="Logo" className="splash-logo" />
            <div className="spinner"></div>
          </div>
        </div>
      )}

      {!showSplash && (
        <div className={`chat-container ${fadeOutSplash ? "fade-in" : ""}`}>
          <button className="left-toggle-button" onClick={() => setSidebarOpen((prev) => !prev)}>
            {sidebarOpen ? "✖" : "☰"}
          </button>

          {sidebarOpen && (
            <div className="sidebar left-sidebar">
              <img src={logo} alt="Logo" className="sidebar-logo" />

              <div
                className={`drag-drop-zone ${isDragOver ? "drag-over" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {file ? (
                  <p><strong>Selected File:</strong> {file.name}</p>
                ) : (
                  <p>Drag and drop a file here, or click to select one</p>
                )}
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                  id="fileInput"
                />
                <label htmlFor="fileInput" className="upload-label">Browse</label>
              </div>

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
            {isUploading ? (
              <div className="main-content">
                <div className="loading-message">
                  <p>📄 Uploading and processing your document...</p>
                  <p>Please wait while I extract and index the data for querying.</p>
                </div>
              </div>
            ) : !toc ? (
              <div className="main-content">
                <div className="welcome-message">
                  <h2>👋 Welcome! I'm your AI-powered RFQ Assistant.</h2>
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
            ) : (
              <>
                <div className="chat-history">
                  {responses.map((res, idx) => (
                    <div key={idx} className="chat-response">
                      <div className="message user-message">
                        <span className="message-icon">👤</span>
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

                  {isStreaming && (
                    <div className="chat-response">
                      <div className="message ai-message">
                        <span className="message-icon">🤖</span>
                        <div
                          className="message-text"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(intelligentFormatToHTML(streamingResponse))
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
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
      )}
    </>
  );
};

export default ChatInterface;
