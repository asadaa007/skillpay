import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, onSnapshot, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ChatWindow = ({ recipientId, recipientName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user || !recipientId) return;

    const initializeChat = async () => {
      try {
        const chatId = [user.uid, recipientId].sort().join('_');
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);
        
        if (!chatDoc.exists()) {
          const chatData = {
            participants: [user.uid, recipientId],
            createdAt: serverTimestamp(),
            lastMessage: null,
            lastMessageTime: serverTimestamp(),
            updatedAt: serverTimestamp(),
            unreadCount: {
              [user.uid]: 0,
              [recipientId]: 0
            }
          };
          
          await setDoc(chatRef, chatData);
          
          const messagesRef = collection(db, 'chats', chatId, 'messages');
          await addDoc(messagesRef, {
            text: 'Chat started',
            senderId: 'system',
            timestamp: serverTimestamp(),
            type: 'system'
          });
        } else {
          // Reset unread count for current user when opening chat
          await updateDoc(chatRef, {
            [`unreadCount.${user.uid}`]: 0
          });
        }

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const messagesQuery = query(
          messagesRef,
          orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const newMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(newMessages);
          scrollToBottom();
          setLoading(false);
        }, (error) => {
          console.error('Error in messages listener:', error);
          toast.error('Failed to load messages');
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error('Failed to initialize chat');
        setLoading(false);
      }
    };

    initializeChat();
  }, [user, recipientId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !recipientId) return;

    const chatId = [user.uid, recipientId].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const chatRef = doc(db, 'chats', chatId);

    try {
      const messageData = {
        text: newMessage.trim(),
        senderId: user.uid,
        recipientId: recipientId,
        timestamp: serverTimestamp(),
        type: 'text',
        read: false
      };

      await addDoc(messagesRef, messageData);

      // Update chat document with last message and increment unread count
      const chatDoc = await getDoc(chatRef);
      const currentUnreadCount = chatDoc.data()?.unreadCount?.[recipientId] || 0;

      await updateDoc(chatRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        [`unreadCount.${recipientId}`]: currentUnreadCount + 1
      });

      // Create notification for recipient
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        userId: recipientId,
        type: 'message',
        chatId: chatId,
        senderId: user.uid,
        senderName: user.displayName || 'User',
        senderEmail: user.email,
        message: `New message: ${newMessage.trim()}`,
        timestamp: serverTimestamp(),
        read: false
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b px-4 py-3">
        <h3 className="text-lg font-medium text-gray-900">{recipientName}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === user.uid ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.senderId === user.uid
                  ? 'bg-primary text-white'
                  : message.senderId === 'system'
                  ? 'bg-gray-200 text-gray-600 text-center w-full'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              {message.type !== 'system' && (
                <span className="text-xs opacity-75 mt-1 block">
                  {message.timestamp?.toDate().toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow; 