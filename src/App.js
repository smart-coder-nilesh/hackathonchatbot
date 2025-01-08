import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const chatWindowRef = useRef(null); // Ref for the chat window

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom(); // Automatically scroll down when messages change
  }, [messages]);

  const sendMessage = async () => {
    if (userMessage.trim() === "") return;

    // Add the user's message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: userMessage },
    ]);

    setUserMessage("");
    setIsProcessing(true);

    try {

      // Make the API call to the backend
      let response = await fetch("https://mevpskgvab.execute-api.ap-south-1.amazonaws.com/prod/getlambdaresponse", {
        method: "POST",
        headers: {
           "Content-Type": "application/json"},
        body: JSON.stringify({ messagefrombody: userMessage.toString() }),
      });
      
      if (!response.ok) {
        throw new Error("API call failed");
      }

      const responseData = await response.json();
      console.log(responseData.message);
      // Add the bot's response to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: responseData.message },
      ]);
    } catch (error) {
      // Handle API error
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Oops! Something went wrong. Please try again." },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Langflow Chat</h1>
      </div>
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            <span className="message-text">{msg.text}</span>
          </div>
        ))}
        {isProcessing && (
          <div className="chat-message bot">
            <span className="message-text">Typing...</span>
            <div className="dot-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={sendMessage} disabled={isProcessing}>
          {isProcessing ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
