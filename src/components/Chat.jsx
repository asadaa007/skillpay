import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

const Chat = ({ recipientId, recipientName, recipientPhoto, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user || !recipientId) return;

    const initializeChat = async () => {
      try {
        // Check if chat already exists
        const chatsQuery = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', user.uid)
        );
        const chatsSnapshot = await getDocs(chatsQuery);
        
        let existingChat = null;
        chatsSnapshot.forEach(doc => {
          const chatData = doc.data();
          if (chatData.participants.includes(recipientId)) {
            existingChat = { id: doc.id, ...chatData };
          }
        });

        if (existingChat) {
          setChatId(existingChat.id);
        } else {
          // Create new chat
          const newChatRef = await addDoc(collection(db, 'chats'), {
            participants: [user.uid, recipientId],
            createdAt: serverTimestamp(),
            lastMessage: null,
            lastMessageTime: serverTimestamp()
          });
          setChatId(newChatRef.id);

          // Create notification for recipient
          await addDoc(collection(db, 'notifications'), {
            userId: recipientId,
            type: 'new_chat',
            title: 'New Chat Started',
            message: `${user.displayName} has started a chat with you`,
            read: false,
            createdAt: serverTimestamp(),
            chatId: newChatRef.id,
            data: {
              senderName: user.displayName,
              senderPhoto: user.photoURL
            }
          });
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error('Failed to initialize chat');
      }
    };

    initializeChat();
  }, [user, recipientId]);

  useEffect(() => {
    if (!chatId) return;

    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    try {
      const messageData = {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName,
        senderPhoto: user.photoURL,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

      // Update chat's last message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp()
      });

      // Create notification for recipient
      await addDoc(collection(db, 'notifications'), {
        userId: recipientId,
        type: 'new_message',
        title: 'New Message',
        message: `${user.displayName}: ${newMessage}`,
        read: false,
        createdAt: serverTimestamp(),
        chatId: chatId,
        data: {
          senderName: user.displayName,
          senderPhoto: user.photoURL
        }
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src={recipientPhoto || '/default-avatar.png'}
              alt={recipientName}
              className="h-10 w-10 rounded-full"
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900">{recipientName}</h3>
              <p className="text-sm text-gray-500">Chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === user.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[70%] ${
                  message.senderId === user.uid ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <img
                  src={message.senderPhoto || '/default-avatar.png'}
                  alt={message.senderName}
                  className="h-8 w-8 rounded-full"
                />
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.senderId === user.uid
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {message.createdAt?.toDate().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat; 