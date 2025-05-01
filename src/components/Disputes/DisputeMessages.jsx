import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FiSend, FiPaperclip } from 'react-icons/fi';

const DisputeMessages = ({ disputeId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const messagesRef = collection(db, 'disputes', disputeId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesList);
      setLoading(false);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [disputeId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messagesRef = collection(db, 'disputes', disputeId, 'messages');
      await addDoc(messagesRef, {
        content: newMessage,
        senderId: user.uid,
        senderName: user.displayName,
        senderAvatar: user.photoURL,
        createdAt: new Date().toISOString()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Messages Container */}
      <div className="h-96 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-4 ${message.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start max-w-[70%] ${message.senderId === user.uid ? 'flex-row-reverse' : ''}`}>
                  <img
                    src={message.senderAvatar || '/default-avatar.png'}
                    alt={message.senderName}
                    className="w-8 h-8 rounded-full mx-2"
                  />
                  <div>
                    <div className={`rounded-lg p-3 ${
                      message.senderId === user.uid
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p>{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default DisputeMessages; 