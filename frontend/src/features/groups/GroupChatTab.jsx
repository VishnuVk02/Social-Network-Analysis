import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  fetchGroupMessages,
  loadOlderMessages,
  sendGroupMessage,
  deleteGroupMessage,
  appendRealtimeMessage,
  markMessageDeleted,
  clearChatState
} from './chatSlice';
import ShareReportModal from '../../components/common/ShareReportModal';
import {
  Send,
  Trash2,
  ArrowDown,
  MessageSquare,
  Sparkles,
  Info,
  Clock,
  Shield,
  Youtube,
  Github,
  TrendingUp,
  ExternalLink,
  BarChart2,
  Forward,
  AlertCircle,
  ChevronUp
} from 'lucide-react';

export default function GroupChatTab({ group }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user: currentUser } = useSelector((state) => state.auth);
  const { messages, hasMore, nextCursor, isLoading, isLoadingOlder, isSending, error } = useSelector((state) => state.chat);

  const [inputContent, setInputContent] = useState('');
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const socketRef = useRef(null);

  const isOrgAdmin = currentUser?.accountType === 'ORGANIZATION' && currentUser?.role === 'ADMIN';

  // Initialize Socket.IO connection and rooms
  useEffect(() => {
    if (!group?.id) return;

    dispatch(clearChatState());
    dispatch(fetchGroupMessages({ groupId: group.id }));

    // Get auth token for Socket authentication
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
      socket.emit('group:join', { groupId: group.id });
    });

    socket.on('group:message', (newMessage) => {
      if (newMessage && newMessage.groupId === group.id) {
        dispatch(appendRealtimeMessage(newMessage));
      }
    });

    socket.on('group:message:deleted', (data) => {
      if (data && data.groupId === group.id) {
        dispatch(markMessageDeleted(data));
      }
    });

    return () => {
      if (socket) {
        socket.emit('group:leave', { groupId: group.id });
        socket.disconnect();
      }
    };
  }, [dispatch, group?.id]);

  // Handle Scroll to Bottom
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll to bottom on initial load or sending
  useEffect(() => {
    if (messages.length > 0 && !showScrollBottomBtn) {
      scrollToBottom('auto');
    }
  }, [messages.length]);

  // Scroll listener to detect if user scrolled up
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottomBtn(!isAtBottom);
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputContent.trim() || isSending) return;

    const content = inputContent.trim();
    setInputContent('');

    dispatch(sendGroupMessage({ groupId: group.id, content })).then((res) => {
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
    if (hasMore && nextCursor) {
      dispatch(loadOlderMessages({ groupId: group.id, cursor: nextCursor }));
    }
  };

  const handleDelete = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      dispatch(deleteGroupMessage({ groupId: group.id, messageId }));
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

  const [forwardReportData, setForwardReportData] = useState(null);

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

  return (
    <div className="flex flex-col h-[600px] glass-panel rounded-2xl border border-slate-800/80 overflow-hidden relative">
      {/* Header bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{group?.name} Chat</h3>
            <p className="text-[11px] text-slate-400">{group?.memberCount} Members • Real-time Workspace Collaboration</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-pine-500/10 border border-pine-500/20 text-pine-400">
            <span className="w-1.5 h-1.5 rounded-full bg-pine-400 mr-1.5 animate-pulse"></span>
            Real-time Live
          </span>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-2.5 bg-coral-500/10 border-b border-coral-500/20 text-coral-400 text-xs text-center font-semibold flex items-center justify-center space-x-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Messages area with vertical scrolling */}
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

        {/* Loading Spinner */}
        {isLoading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs space-y-2">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading message history...</span>
          </div>
        ) : messages.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Start the conversation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              This is the beginning of the <strong className="text-slate-200">{group?.name}</strong> group chat. Share ideas, discuss analytics, and collaborate with your team.
            </p>
          </div>
        ) : (
          /* MESSAGE THREAD */
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            const canDelete = isMe || isOrgAdmin;
            const isReport = msg.messageType === 'REPORT' || !!msg.reportData;

            return (
              <div
                key={msg.id}
                className={`flex space-x-3 text-xs ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
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

                {/* Message Content Bubble */}
                <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name & Timestamp Header */}
                  <div className={`flex items-center space-x-2 text-[10px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="font-semibold text-slate-300">
                      {isMe ? 'You' : msg.senderName}
                    </span>
                    <span>•</span>
                    <span>{formatTime(msg.createdAt)}</span>
                  </div>

                  {/* Bubble Container */}
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

                    {/* Delete Message Button */}
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

      {/* Composer Input Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              rows="2"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={2000}
              placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
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
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <ShareReportModal
        isOpen={!!forwardReportData}
        onClose={() => setForwardReportData(null)}
        reportData={forwardReportData}
        isForwarding={true}
      />
    </div>
  );
}
