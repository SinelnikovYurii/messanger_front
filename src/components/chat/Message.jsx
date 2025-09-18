import React from 'react';
import './css/Message.css';

const Message = ({ message, isOwnMessage }) => {
    return (
        <div className={`message ${isOwnMessage ? 'message-own' : ''}`}>
            <div className="message-header">
                <span className="message-sender">{message.sender}</span>
                <span className="message-time">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
            </div>
            <div className="message-content">
                {message.content}
            </div>
        </div>
    );
};

export default Message;