import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';

function ConversationItem({ conv, active, currentUserId, onClick }) {
  const other = conv.participants.find((p) => p._id !== currentUserId) || conv.participants[0];
  const lastMsg = conv.lastMessage;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-800/60 transition-colors ${
        active ? 'bg-gray-800/80 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'
      }`}
    >
      <Avatar src={other?.profilePicture} name={other?.fullName} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{other?.fullName ?? 'Unknown'}</p>
        <p className="text-gray-500 text-xs truncate">
          {lastMsg?.content ?? 'Start a conversation'}
        </p>
      </div>
      <p className="text-gray-700 text-xs flex-shrink-0">
        {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
      </p>
    </button>
  );
}

function MessageBubble({ msg, isOwn }) {
  const status = isOwn ? (msg.read ? 'Seen' : 'Delivered') : null;
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isOwn && (
        <Avatar src={msg.sender?.profilePicture} name={msg.sender?.fullName} size="xs" className="mr-2 mt-1 flex-shrink-0" />
      )}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && (
          <p className="text-gray-500 text-xs mb-1 ml-1">{msg.sender?.fullName}</p>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? 'bg-indigo-600 text-white rounded-br-md'
              : 'bg-gray-800 text-gray-200 rounded-bl-md'
          }`}
        >
          {msg.content}
        </div>
        <div className="flex items-center gap-2 mt-1 px-1">
          <p className="text-gray-700 text-xs">
            {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
          {status && (
            <span className="text-gray-400 text-[10px] uppercase tracking-[0.2em]">
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConvId, setActiveConvId] = useState(searchParams.get('conv') || null);
  const [activeConv, setActiveConv] = useState(null);
  const [input, setInput] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const activeConvIdRef = useRef(activeConvId);
  const lastJoinedConvRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  const fetchMessages = useCallback(async (convId) => {
    if (!convId) return;
    setLoadingMsgs(true);
    try {
      const { data } = await api.get(`/messages/conversations/${convId}/messages`);
      setMessages(data);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  useEffect(() => {
    if (!user) return undefined;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    const socket = io(socketUrl, {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect_error', (error) => {
      console.error('Socket connect error', error);
    });

    socket.on('message:new', (payload) => {
      if (!payload?.conversationId || payload.conversationId !== activeConvIdRef.current) return;
      if (payload.message?.sender?._id === user?._id) return;
      setMessages((prev) => [...prev, payload.message]);
    });

    socket.on('conversation:updated', () => {
      fetchConversations();
      if (activeConvIdRef.current) {
        fetchMessages(activeConvIdRef.current);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, fetchConversations, fetchMessages]);

  useEffect(() => {
    if (!activeConvId || !socketRef.current) return undefined;

    socketRef.current.emit('joinConversation', activeConvId, (response) => {
      if (!response?.success) {
        console.warn('Could not join conversation', response?.message);
      }
    });

    const previousConv = lastJoinedConvRef.current;
    if (previousConv && previousConv !== activeConvId) {
      socketRef.current.emit('leaveConversation', previousConv);
    }
    lastJoinedConvRef.current = activeConvId;

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveConversation', activeConvId);
      }
    };
  }, [activeConvId]);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      const conv = conversations.find((c) => c._id === activeConvId);
      if (conv) setActiveConv(conv);
    }
  }, [activeConvId, conversations, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = (conv) => {
    setActiveConvId(conv._id);
    setActiveConv(conv);
    setSearchParams({ conv: conv._id });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConvId || sending) return;
    setSending(true);
    const content = input.trim();
    setInput('');
    try {
      const { data } = await api.post(`/messages/conversations/${activeConvId}/messages`, { content });
      setMessages((prev) => [...prev, data]);
      fetchConversations();
    } catch {
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const otherParticipant = activeConv?.participants?.find((p) => p._id !== user?._id) || activeConv?.participants?.[0];

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl overflow-hidden border border-gray-800 bg-gray-900">
      {/* Sidebar: conversations list */}
      <div className={`flex-shrink-0 flex flex-col border-r border-gray-800 ${activeConvId ? 'hidden sm:flex w-72' : 'flex w-full sm:w-72'}`}>
        <div className="px-4 py-4 border-b border-gray-800">
          <h2 className="text-cyan-300 font-semibold text-base">Messages</h2>
          <p className="text-gray-500 text-xs mt-0.5">Your conversations</p>
        </div>
        {loadingConvs ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <span className="text-4xl mb-3">💬</span>
            <p className="text-gray-400 text-sm font-medium">No conversations yet</p>
            <p className="text-gray-600 text-xs mt-1">Go to Connect to message someone</p>
            <button
              onClick={() => navigate('/connect')}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Find People
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv._id}
                conv={conv}
                active={conv._id === activeConvId}
                currentUserId={user?._id}
                onClick={() => openConversation(conv)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Message thread */}
      {activeConvId ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Thread header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-800 flex-shrink-0">
            <button
              onClick={() => { setActiveConvId(null); setSearchParams({}); }}
              className="sm:hidden text-gray-400 hover:text-white mr-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {otherParticipant && (
              <>
                <Avatar src={otherParticipant.profilePicture} name={otherParticipant.fullName} size="sm" />
                <div>
                  <p className="text-white font-semibold text-sm">{otherParticipant.fullName}</p>
                  <p className="text-gray-500 text-xs capitalize">{otherParticipant.role}</p>
                </div>
              </>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-full">
                <Spinner />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="text-4xl mb-3">👋</span>
                <p className="text-gray-400 text-sm">Say hello to {otherParticipant?.fullName?.split(' ')[0]}!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg._id} msg={msg} isOwn={msg.sender._id === user?._id || msg.sender === user?._id} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-3 px-4 py-3 border-t border-gray-800 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 items-center justify-center flex-col text-center px-8">
          <span className="text-6xl mb-4">💬</span>
          <p className="text-white font-semibold text-lg">Select a conversation</p>
          <p className="text-gray-500 text-sm mt-1">Choose a chat from the left or go to Connect to message someone new</p>
          <button
            onClick={() => navigate('/connect')}
            className="mt-5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Find People to Connect
          </button>
        </div>
      )}
    </div>
  );
}
