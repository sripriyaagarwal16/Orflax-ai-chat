import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);

  // NEW: State to store the full conversation history
  const [chatLog, setChatLog] = useState([]);

  const chat = async (message) => {
    setLoading(true);
    // NEW: Add user's message to the chat log immediately
    setChatLog((prev) => [...prev, { from: "user", text: message }]);

    try {
      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      // UPDATED: Handle the new API response structure { userPrompt, aiMessages }
      const data = await response.json();
      const aiMessages = data.aiMessages || [];

      // Add the AI responses to the playback queue
      setMessages((messages) => [...messages, ...aiMessages]);
      // NEW: Add AI responses to the permanent chat log
      setChatLog((prev) => [...prev, ...aiMessages.map(msg => ({ from: "ai", text: msg.text }))]);

    } catch (err) {
      console.error("Error fetching chat response:", err);
      // NEW: Add an error message to the log for visibility
      setChatLog((prev) => [...prev, { from: "ai", text: "Sorry, I couldn't respond." }]);
    } finally {
      setLoading(false);
    }
  };

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        // NEW: Expose the chatLog to components
        chatLog,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};