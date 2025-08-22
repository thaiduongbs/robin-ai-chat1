import React, { useState } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [typingText, setTypingText] = useState('');

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userMessage = { sender: 'user', text: message };
        setChatHistory((prev) => [...prev, userMessage]);
        setMessage('');
        setLoading(true);
        setTypingText('');

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await res.json();
            const fullText = data.reply;

            // Typing effect
            let index = 0;
            const interval = setInterval(() => {
                setTypingText((prev) => prev + fullText[index]);
                index++;
                if (index >= fullText.length) {
                    clearInterval(interval);
                    setChatHistory((prev) => [...prev, { sender: 'ai', text: fullText }]);
                    setTypingText('');
                    setLoading(false);
                }
            }, 30);
        } catch (error) {
            setChatHistory((prev) => [...prev, { sender: 'ai', text: 'Error connecting to Robin AI.' }]);
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <h1>Robin AI Chat</h1>
            <div className="chat-window">
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble ${msg.sender}`}>
                        <div className="avatar">{msg.sender === 'user' ? '🧑' : '🤖'}</div>
                        <div className="text">{msg.text}</div>
                    </div>
                ))}
                {loading && (
                    <div className="chat-bubble ai">
                        <div className="avatar">🤖</div>
                        <div className="text">{typingText}</div>
                    </div>
                )}
            </div>
            <div className="input-area">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') sendMessage();
                    }}
                    placeholder="Type your message..."
                />
                <button onClick={sendMessage} disabled={loading}>
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
}

export default App;
