import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const chatContainer = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message, chatLog } = useChat();
  const [currentCaption, setCurrentCaption] = useState(null);

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message) {
      chat(text);
      input.current.value = "";
    }
  };

  useEffect(() => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  }, [chatLog]);

  // NEW: Effect to handle the line-by-line caption animation
  useEffect(() => {
    if (message) {
      const lines = message.text.split('\n');
      let currentLineIndex = 0;
      let interval;

      // Immediately show the first line
      setCurrentCaption(lines[currentLineIndex]);

      // Function to advance to the next line
     const nextLine = () => {
        currentLineIndex++;
        if (currentLineIndex < lines.length) {
          setCurrentCaption(lines[currentLineIndex]);
        } else {
          // All lines shown, clear the interval and set a timer to hide the caption
          clearInterval(interval);
          setTimeout(() => {
            setCurrentCaption(null);
          }, 1000); // Hide caption 1 second after the last line
        }
      };

      // If there's more than one line, start the interval to show subsequent lines
      if (lines.length > 1) {
        // CHANGED: Delay is now 1 minute (60000 ms)
        interval = setInterval(nextLine, 60000); 
      } else {
        // If only one line, just set a timer to hide it
        // CHANGED: Delay is now 1 minute (60000 ms)
        setTimeout(() => {
          setCurrentCaption(null);
        }, 60000); 
      }


      // Cleanup function to clear timers if the message changes mid-animation
      return () => {
        clearInterval(interval);
      };
    } else {
      // If there is no message, ensure the caption is cleared.
      setCurrentCaption(null);
    }
  }, [message]);

  const handleDownload = () => {
    if (chatLog.length === 0) return;
    const formattedLog = chatLog.map(log => `${log.from === "user" ? "You" : "AI"}: ${log.text}`).join("\n\n");
    const blob = new Blob([formattedLog], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orflax-chat-log.txt";
    document.body.appendChild(a);
a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (hidden) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 pointer-events-none">
      
      {/* LEFT SIDEBAR */}
      <div className="absolute top-0 left-0 bottom-0 w-full max-w-sm flex flex-col p-4 gap-4 pointer-events-auto">
        <div className="backdrop-blur-md bg-yellow-100 bg-opacity-80 p-4 rounded-lg shadow-md border border-yellow-300">
          <h1 className="font-black text-xl text-gray-800">AskOrflax</h1>
          <p className="text-gray-700">Wired to Answer, Powered by Orflax. 😊</p>
        </div>
        <div
          ref={chatContainer}
          className="flex-grow p-4 bg-white/20 backdrop-blur-md rounded-lg overflow-y-auto"
        >
          <div className="flex flex-col gap-4">
            {chatLog.map((log, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg shadow-md max-w-xs break-words ${
                  log.from === "user"
                    ? "bg-white self-end text-right"
                    : "bg-yellow-100 self-start text-left"
                }`}
              >
                {log.text.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">
                    {line || '\u00A0'}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="w-full placeholder:text-gray-700 placeholder:italic p-4 rounded-md bg-opacity-70 bg-yellow-100 backdrop-blur-md text-gray-800"
            placeholder="Type a message..."
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            disabled={loading || message}
            onClick={sendMessage}
            className={`bg-yellow-500 hover:bg-yellow-600 text-gray-900 p-4 px-10 font-semibold uppercase rounded-md shadow ${
              loading || message ? "cursor-not-allowed opacity-40" : ""
            }`}
          >
            Send
          </button>
        </div>
      </div>

      {/* RIGHT CONTROLS */}
      <div className="absolute top-0 right-0 p-4 flex flex-col gap-4 pointer-events-auto">
        <button
          onClick={() => setCameraZoomed(!cameraZoomed)}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 p-4 rounded-md shadow"
        >
          {cameraZoomed ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
            </svg>
          )}
        </button>
        <button
          onClick={() => {
            document.querySelector("body").classList.toggle("greenScreen");
          }}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 p-4 rounded-md shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </button>
        <button
          onClick={handleDownload}
          disabled={chatLog.length === 0}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 p-4 rounded-md shadow disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </button>
      </div>

      {/* CENTERED CAPTION CONTAINER */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-auto">
        {currentCaption && (
          <div className="max-w-screen-sm bg-black bg-opacity-60 text-white p-3 rounded-lg text-center shadow-lg">
            {currentCaption}
          </div>
        )}
      </div>
    </div>
  );
};