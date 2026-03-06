import React, { useState, useRef, useEffect } from 'react';
import '../styles/Chatbot.css';
import { FiSend } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../api';

function Chatbot({ analysisContext }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize messages based on whether analysis context is available
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage = analysisContext
        ? {
            id: 1,
            text: "Hi! 👋 I'm your **AI Career Assistant**. I've analyzed your resume against the job description. Ask me anything like:\n\n- \"What skills am I missing?\"\n- \"How can I improve my React skills?\"\n- \"Rewrite my summary section\"\n- \"Why don't I match this role?\"\n- \"What should I focus on learning first?\"\n\nLet's work together to land your dream job!",
            sender: 'bot',
            timestamp: new Date(),
          }
        : {
            id: 1,
            text: "Hi! 👋 I'm your **AI Career Assistant**. Upload a resume and job description to get personalized recommendations. Or ask me general questions about skills, learning paths, and career development!",
            sender: 'bot',
            timestamp: new Date(),
          };
      setMessages([initialMessage]);
    }
  }, [analysisContext, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const contextString = analysisContext
        ? JSON.stringify(analysisContext)
        : '';

      const response = await sendChatMessage(inputValue, contextString);

      const botMessage = {
        id: messages.length + 2,
        text: response.response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <h3>AI Assistant</h3>
        <p>Ask me anything about your skills analysis</p>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              {message.sender === 'bot' ? (
                <ReactMarkdown className="markdown-content">
                  {message.text}
                </ReactMarkdown>
              ) : (
                <p>{message.text}</p>
              )}
              <span className="message-time">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-content">
              <div className="typing-animation">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me a question..."
          rows="2"
          className="chat-input"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="send-button"
        >
          <FiSend />
        </button>
      </div>

      {/* Suggested Questions */}
      {analysisContext && messages.length <= 1 && (
        <div className="suggested-questions">
          <p className="suggestions-label">💡 Try asking:</p>
          <div className="suggestions-grid">
            <button
              onClick={() => {
                setInputValue("What skills am I missing for this role?");
              }}
              className="suggestion-btn"
            >
              "What skills am I missing?"
            </button>
            <button
              onClick={() => {
                setInputValue("How can I improve my most important missing skill?");
              }}
              className="suggestion-btn"
            >
              "How do I improve key skills?"
            </button>
            <button
              onClick={() => {
                setInputValue("Help me rewrite my professional summary");
              }}
              className="suggestion-btn"
            >
              "Rewrite my summary"
            </button>
            <button
              onClick={() => {
                setInputValue("What should I focus on learning first?");
              }}
              className="suggestion-btn"
            >
              "What to learn first?"
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
