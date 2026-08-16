import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  fetchConversations,
  startConversation,
  fetchPrivateMessages,
  loadOlderPrivateMessages,
  sendPrivateMessage,
  deletePrivateMessage,
  setActiveConversation,
  appendRealtimePrivateMessage,
  markPrivateMessageDeleted
} from './privateChatSlice';
import { fetchOrgEmployees } from '../groups/groupsSlice';
import BackButton from '../../components/common/BackButton';
import ShareReportModal from '../../components/common/ShareReportModal';
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  Trash2,
  ArrowDown,
  ArrowLeft,
  User,
  Users,
  Sparkles,
  Shield,
  X,
  Clock,
  CheckCircle2,
  Youtube,
  Github,
  TrendingUp,
  ExternalLink,
  BarChart2,
  Forward,
  AlertCircle,
  ChevronUp
} from 'lucide-react';

export default function MessagesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user: currentUser } = useSelector((state) => state.auth);
  const { orgEmployees } = useSelector((state) => state.groups);
  const {
    conversations,
    activeConversation,
    messages,
    hasMore,
    nextCursor,
    isLoadingConversations,
    isLoadingMessages,
    isLoadingOlder,
    isSending,
    error
  } = useSelector((state) => state.privateChat);

  // Search & Modal States
  const [convSearch, setConvSearch] = useState('');
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
  const [forwardReportData, setForwardReportData] = useState(null);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch conversations list on mount
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Load org employees when New Message modal opens
  useEffect(() => {
    if (isNewMessageModalOpen) {
      dispatch(fetchOrgEmployees());
    }
  }, [dispatch, isNewMessageModalOpen]);

  // Socket.IO real-time connection for active conversation
  useEffect(() => {
    if (!activeConversation?.id) return;

    dispatch(fetchPrivateMessages({ conversationId: activeConversation.id }));

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    const socket = io(backendUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('conversation:join', { conversationId: activeConversation.id });
    });

    socket.on('conversation:message', (newMessage) => {
      if (newMessage && newMessage.conversationId === activeConversation.id) {
        dispatch(appendRealtimePrivateMessage(newMessage));
      }
    });

    socket.on('conversation:message:deleted', (data) => {
      if (data && data.conversationId === activeConversation.id) {
        dispatch(markPrivateMessageDeleted(data));
      }
    });

    return () => {
      if (socket) {
        socket.emit('conversation:leave', { conversationId: activeConversation.id });
        socket.disconnect();
      }
    };
  }, [dispatch, activeConversation?.id]);

  // Scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (messages.length > 0 && !showScrollBottomBtn) {
      scrollToBottom('auto');
    }
  }, [messages.length]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottomBtn(!isAtBottom);
  };

  const handleSelectConversation = (conv) => {
    dispatch(setActiveConversation(conv));
    setMobileView('chat');
  };

  const handleStartNewChat = (recipientId) => {
    dispatch(startConversation({ recipientId })).then((res) => {
      if (!res.error) {
        setIsNewMessageModalOpen(false);
        setMobileView('chat');
      }
    });
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputContent.trim() || isSending || !activeConversation) return;

    const content = inputContent.trim();
    setInputContent('');

    dispatch(sendPrivateMessage({ conversationId: activeConversation.id, content })).then((res) => {
      if (!res.error) {
        setTimeout(() => scrollToBottom('smooth'), 50);
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLoadOlder = () => {
    if (hasMore && nextCursor && activeConversation) {
      dispatch(loadOlderPrivateMessages({ conversationId: activeConversation.id, cursor: nextCursor }));
    }
  };

  const handleDelete = (messageId) => {
    if (window.confirm('Are you sure you want to delete this private message?')) {
      dispatch(deletePrivateMessage({ conversationId: activeConversation.id, messageId }));
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderReportCard = (report) => {
    if (!report) return null;
    const { type, title, subtitle, targetUrl, metrics } = report;

    let badgeBg = 'bg-brand-500/10 border-brand-500/20 text-brand-400';
    let Icon = BarChart2;

    if (type === 'YOUTUBE') {
      badgeBg = 'bg-red-500/10 border-red-500/20 text-red-400';
      Icon = Youtube;
    } else if (type === 'GITHUB') {
      badgeBg = 'bg-slate-200/10 border-slate-200/20 text-slate-200';
      Icon = Github;
    } else if (type === 'TRENDS') {
      badgeBg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      Icon = TrendingUp;
    }

    return (
      <div className="w-full max-w-sm rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3 shadow-xl my-1.5 text-left">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center space-x-1 ${badgeBg}`}>
            <Icon className="w-3 h-3 mr-1" />
            <span>{type} REPORT</span>
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">Interactive Card</span>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h5 className="text-xs font-bold text-white leading-tight">{title}</h5>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Key Metrics Grid */}
        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
            {metrics.map((m, idx) => (
              <div key={idx} className="bg-slate-900/60 p-2 rounded-lg text-[11px]">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">{m.label}</span>
                <span className="font-bold text-white">{m.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons: View Full Report & Forward */}
        <div className="flex space-x-2 mt-2 pt-1">
          {targetUrl && (
            <button
              onClick={() => navigate(targetUrl)}
              className="flex-1 py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glass flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>View Full Report</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setForwardReportData(report)}
            className="py-2 px-3 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
            title="Forward Report"
          >
            <Forward className="w-3.5 h-3.5 text-emerald-400" />
            <span>Forward</span>
          </button>
        </div>
      </div>
    );
  };

  // Filter conversations list
  const filteredConversations = (conversations || []).filter(c =>
    c.otherParticipant?.name?.toLowerCase().includes(convSearch.toLowerCase()) ||
    c.otherParticipant?.email?.toLowerCase().includes(convSearch.toLowerCase())
  );

  // Filter employees for new message modal (exclude current user)
  const filteredEmployees = (orgEmployees || []).filter(emp =>
    emp.id !== currentUser?.id &&
    (emp.name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
     emp.email?.toLowerCase().includes(employeeSearch.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 w-full max-w-[1700px] mx-auto min-h-full bg-white text-slate-900">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-3 sm:space-y-0 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <BackButton fallbackRoute="/" />
          <div>
            <h1 className="text-2xl font-extrabold text-black tracking-tight">
              Private Employee Messaging
            </h1>
            <p className="text-slate-700 text-xs font-bold mt-0.5">Secure 1-to-1 communication for organization employees.</p>
          </div>
        </div>

        <button
          onClick={() => setIsNewMessageModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-pine-500 hover:bg-pine-600 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-2 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Message</span>
        </button>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[650px]">
        {/* LEFT COLUMN: Conversation List */}
        <div
          className={`md:col-span-4 bg-midnight-800 rounded-2xl border border-midnight-700/60 overflow-hidden flex flex-col text-white shadow-sm ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* List Header & Search */}
          <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/60">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand-400" />
                <span>Conversations</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {conversations.length} Active
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-white bg-slate-900/60"
              />
            </div>
          </div>

          {/* Conversations Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 bg-slate-950/20">
            {isLoadingConversations ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <span>Loading conversations...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
                <p>No conversations found.</p>
                <button
                  onClick={() => setIsNewMessageModalOpen(true)}
                  className="text-brand-400 hover:underline font-semibold text-[11px] cursor-pointer"
                >
                  + Start a new chat
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversation?.id === conv.id;
                const other = conv.otherParticipant;

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 transition-all cursor-pointer flex items-center space-x-3 hover:bg-slate-800/40 ${
                      isActive ? 'bg-brand-600/10 border-l-4 border-brand-500' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 font-bold text-slate-200 flex items-center justify-center text-xs shrink-0">
                      {getInitials(other?.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-white truncate">{other?.name}</h4>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {conv.lastMessage
                          ? conv.lastMessage.content
                          : 'No messages yet.'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Thread */}
        <div
          className={`md:col-span-8 bg-midnight-800 rounded-2xl border border-midnight-700/60 overflow-hidden flex flex-col relative text-white shadow-sm ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Active Header Bar */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden text-slate-400 hover:text-white p-1"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                    {getInitials(activeConversation.otherParticipant?.name)}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {activeConversation.otherParticipant?.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {activeConversation.otherParticipant?.email} • {activeConversation.otherParticipant?.role}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
                  Private 1-to-1 Chat
                </span>
              </div>

              {/* Error banner */}
              {error && (
                <div className="p-2.5 bg-coral-500/10 border-b border-coral-500/20 text-coral-400 text-xs text-center font-semibold flex items-center justify-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Messages Area */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 p-6 overflow-y-auto space-y-4 bg-midnight-950/40"
              >
                {/* Load older messages button */}
                {hasMore && (
                  <div className="text-center pb-2">
                    <button
                      onClick={handleLoadOlder}
                      disabled={isLoadingOlder}
                      className="px-3 py-1.5 text-xs font-semibold text-pine-400 bg-pine-500/10 hover:bg-pine-500/20 border border-pine-500/20 rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center mx-auto space-x-1"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>{isLoadingOlder ? 'Loading older messages...' : 'Load older messages'}</span>
                    </button>
                  </div>
                )}

                {isLoadingMessages && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs space-y-2">
                    <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading message thread...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">Private Conversation Started</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Messages exchanged here are private to <strong className="text-white">{currentUser?.name}</strong> and <strong className="text-white">{activeConversation.otherParticipant?.name}</strong>.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUser?.id;
                    const canDelete = isMe; // ONLY original sender can soft-delete private messages!
                    const isReport = msg.messageType === 'REPORT' || !!msg.reportData;

                    return (
                      <div
                        key={msg.id}
                        className={`flex space-x-3 text-xs ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-[11px] select-none ${
                            isMe
                              ? 'bg-brand-600 text-white shadow-glass-indigo'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                          title={msg.senderName}
                        >
                          {getInitials(msg.senderName)}
                        </div>

                        <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`flex items-center space-x-2 text-[10px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span className="font-semibold text-slate-300">
                              {isMe ? 'You' : msg.senderName}
                            </span>
                            <span>•</span>
                            <span>{formatTime(msg.createdAt)}</span>
                          </div>

                          <div className="group relative">
                            <div
                              className={`p-3.5 rounded-2xl break-words whitespace-pre-wrap leading-relaxed shadow-sm transition-all ${
                                msg.isDeleted
                                  ? 'bg-slate-900/60 border border-slate-800 text-slate-500 italic'
                                  : isMe
                                  ? 'bg-brand-600 text-white rounded-tr-xs'
                                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs'
                              }`}
                            >
                              {/* Optional comment text */}
                              {msg.content}

                              {/* Interactive Report Card */}
                              {!msg.isDeleted && isReport && renderReportCard(msg.reportData)}
                            </div>

                            {/* Delete Message Button (Sender ONLY) */}
                            {!msg.isDeleted && canDelete && (
                              <button
                                onClick={() => handleDelete(msg.id)}
                                className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20 text-red-400 cursor-pointer ${
                                  isMe ? '-left-7' : '-right-7'
                                }`}
                                title="Delete message"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Floating "New Messages" button */}
              {showScrollBottomBtn && (
                <button
                  onClick={() => scrollToBottom('smooth')}
                  className="absolute bottom-20 right-6 px-3 py-1.5 rounded-full bg-brand-600 text-white text-xs font-semibold shadow-2xl flex items-center space-x-1.5 border border-brand-400/30 hover:bg-brand-500 transition-all z-20 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>New messages</span>
                </button>
              )}

              {/* Composer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/80">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      rows="2"
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      maxLength={2000}
                      placeholder="Type a private message... (Enter to send, Shift+Enter for newline)"
                      className="w-full p-3 text-xs rounded-xl glass-input text-white resize-none pr-14 focus:outline-none focus:border-brand-500"
                    />
                    <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-500 font-mono">
                      {inputContent.length}/2000
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={!inputContent.trim() || isSending}
                    className="px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:hover:bg-brand-600 text-white transition-all shadow-glass-indigo flex items-center justify-center shrink-0 cursor-pointer"
                    title="Send Private Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* EMPTY CONVERSATION SELECTION STATE */
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Select a Conversation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose an existing employee conversation from the list on the left or click <strong className="text-white">+ New Message</strong> to initiate a private 1-to-1 chat.
              </p>
              <button
                onClick={() => setIsNewMessageModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-glass-indigo transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Conversation</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Start New Message / Employee Search */}
      {isNewMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 relative space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand-400" />
                <span>New Private Message</span>
              </h3>
              <button
                onClick={() => setIsNewMessageModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Organization Employee
              </label>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  placeholder="Search by employee name or email..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-white bg-slate-900/80"
                />
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 bg-slate-950/40 rounded-xl border border-slate-800">
                {filteredEmployees.length === 0 ? (
                  <p className="p-4 text-xs text-slate-500 text-center">
                    No matching organization employees found.
                  </p>
                ) : (
                  filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => handleStartNewChat(emp.id)}
                      className="p-3 hover:bg-brand-600/10 transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 font-bold text-slate-200 flex items-center justify-center text-xs">
                          {getInitials(emp.name)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">
                            {emp.name}
                          </h4>
                          <p className="text-[10px] text-slate-400">{emp.email}</p>
                        </div>
                      </div>

                      <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-slate-800 border-slate-700 text-slate-300 uppercase">
                        {emp.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewMessageModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Forward Report Modal */}
      <ShareReportModal
        isOpen={!!forwardReportData}
        onClose={() => setForwardReportData(null)}
        reportData={forwardReportData}
        isForwarding={true}
      />
    </div>
  );
}
