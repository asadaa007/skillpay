import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import ChatWindow from '../components/Chat/ChatWindow';
import { 
  ChatBubbleLeftIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recipientDetails, setRecipientDetails] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        // Query conversations collection where user is a participant
        const conversationsRef = collection(db, 'conversations');
        const conversationsQuery = query(
          conversationsRef,
          where('participants', 'array-contains', user.uid)
        );
        
        const snapshot = await getDocs(conversationsQuery);
        const conversationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch other user's details for each conversation
        const conversationsWithDetails = await Promise.all(
          conversationsData.map(async (conversation) => {
            const otherUserId = conversation.participants.find(id => id !== user.uid);
            if (!otherUserId) return null;

            try {
              const userDoc = await getDoc(doc(db, 'users', otherUserId));
              const userData = userDoc.data();
              return {
                id: conversation.id,
                lastMessage: conversation.lastMessage || '',
                lastMessageTime: conversation.lastMessageTime,
                participants: conversation.participants,
                otherUser: {
                  id: otherUserId,
                  name: userData?.displayName || 'Unknown User',
                  avatar: userData?.photoURL || null
                }
              };
            } catch (error) {
              console.error(`Error fetching user data for ${otherUserId}:`, error);
              return {
                id: conversation.id,
                lastMessage: conversation.lastMessage || '',
                lastMessageTime: conversation.lastMessageTime,
                participants: conversation.participants,
                otherUser: {
                  id: otherUserId,
                  name: 'Unknown User',
                  avatar: null
                }
              };
            }
          })
        );

        // Filter out null values and sort by lastMessageTime
        const validConversations = conversationsWithDetails.filter(conv => conv !== null);
        validConversations.sort((a, b) => {
          const timeA = a.lastMessageTime?.toDate() || new Date(0);
          const timeB = b.lastMessageTime?.toDate() || new Date(0);
          return timeB - timeA;
        });

        setConversations(validConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      setRecipientDetails({
        id: selectedChat.otherUser.id,
        name: selectedChat.otherUser.name,
      });
    }
  }, [selectedChat]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600">You need to be logged in to view your messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 h-[calc(100vh-12rem)]">
            {/* Conversations List */}
            <div className="col-span-4 border-r">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium text-gray-900">Messages</h2>
              </div>
              <div className="overflow-y-auto h-[calc(100%-4rem)]">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No conversations yet
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedChat(conversation)}
                      className={`w-full p-4 flex items-start space-x-4 hover:bg-gray-50 ${
                        selectedChat?.id === conversation.id ? 'bg-gray-50' : ''
                      }`}
                    >
                      {conversation.otherUser.avatar ? (
                        <img
                          src={conversation.otherUser.avatar}
                          alt={conversation.otherUser.name}
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <UserCircleIcon className="h-12 w-12 text-gray-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.otherUser.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(conversation.lastMessageTime)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className="col-span-8">
              {selectedChat ? (
                <ChatWindow
                  recipientId={recipientDetails.id}
                  recipientName={recipientDetails.name}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <ChatBubbleLeftIcon className="h-12 w-12 mx-auto mb-4" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages; 