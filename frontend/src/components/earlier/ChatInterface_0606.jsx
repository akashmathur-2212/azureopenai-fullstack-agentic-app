import React, { useState, useEffect } from "react";
import "./ChatInterface.css";
// 06-06
import logo from "../assets/RoundedBlueGEN.png";
// 06-06
import splashLogo from "../assets/logo.jpg";
import brandLogo from "../assets/logo.jpg";
import backgroundImg from "../assets/BluewaterWit.jpg";
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


  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
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
      setIsUploading(false);
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
          <button
            className={`left-toggle-button ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            {sidebarOpen ? "⟵" : "⟶"} {/* 06-06 */}
          </button>

          {sidebarOpen && (
            <div className="sidebar left-sidebar">
              <img src={logo} alt="Logo" className="sidebar-logo" />

              <p className="sidebar-description">
                Delivering actionable insights that help engineers and sales teams to quickly understand and respond to client request document requirements. Just tell me what you're looking for!
              </p> {/* 06-06 */}

              <div
                className={`drag-drop-zone ${isDragOver ? "drag-over" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {file ? (
                  <p><strong>Selected File:</strong> {file.name}</p>
                ) : (
                  <p>Drag & drop a file here, or click to select one</p>
                )}
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                  id="fileInput"
                />
                <label htmlFor="fileInput" className="upload-label">BROWSE</label>
              </div>
            
              <div className={`upload-button-wrapper ${file ? "visible" : "hidden"}`}>
                <button onClick={handleUpload} disabled={isUploading}>
                  <span className="upload-button-content">
                    {isUploading ? <div className="spinner upload-spinner"></div> : "UPLOAD"}
                  </span>
                </button>
              </div>

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
              <img src={brandLogo} alt="BrandLogo" className="brand-logo" />
            </div>
          )}

          <div className="center-and-right">
            {!toc ? (
              <div
                className="main-content"
                style={{
                  backgroundImage: `url(${backgroundImg})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                >
                <div className="welcome-message">
                  <div className="welcome-flex">
                    <span className="welcome-icon">🤖</span>
                    <div className="welcome-text">
                      <h2>Welcome! I'm your AI-powered Assistant</h2> {/* 06-06 */}
                      <p>I can help you to:</p>
                      <ul>
                        <li>Extract and summarize technical and commercial requirements from client request documents</li> {/* 06-06 */}
                        <li>Compare requirements with previous project submissions and responses</li>
                        <li>Highlight overlaps, coverage, and new or missing requirements for bid teams</li>
                      </ul>
                      <hr className="prompt-divider" />
                      <p><strong>Example Prompts</strong></p> {/* 06-06 */}
                      <ul>
                        <li>Can you tell me the requirements related to &lt;topic&gt;?</li>
                        <li>Can you list down all the requirements related to &lt;topic&gt;?</li>
                        <li>Can you tell me the requirements related to &lt;topic&gt; and compare it with the history submissions?</li>
                        <li>Can you list down all the requirements related to &lt;topic&gt; and compare it with the previous responses?</li>
                      </ul>
                    </div>
                  </div>
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
                      placeholder="Ask me a question..."
                      className="chat-input-field"
                    /> {/* 06-06 */}
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
                  <li>Extract and summarize technical and commercial requirements from client request documents</li> {/* 06-06 */}
                  <li>Compare requirements with previous project submissions and responses</li>
                  <li>Highlight overlaps, coverage, and new or missing requirements for bid teams</li>
                </ul>
                <strong>Example Prompts</strong> {/* 06-06 */}
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
