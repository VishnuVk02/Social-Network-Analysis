import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from '../../features/groups/groupsSlice';
import { fetchOrgEmployees } from '../../features/groups/groupsSlice';
import { sendGroupMessage } from '../../features/groups/chatSlice';
import { startConversation, sendPrivateMessage } from '../../features/messages/privateChatSlice';
import {
  Share2,
  X,
  Send,
  Youtube,
  Github,
  TrendingUp,
  Users,
  User,
  Check,
  AlertCircle,
  Search,
  Forward
} from 'lucide-react';

export default function ShareReportModal({ isOpen, onClose, reportData, isForwarding = false }) {
  const dispatch = useDispatch();

  const { user: currentUser } = useSelector((state) => state.auth);
  const { list: groups, orgEmployees, isLoading } = useSelector((state) => state.groups);

  const [shareTarget, setShareTarget] = useState('GROUP'); // 'GROUP' | 'PERSON'
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [comment, setComment] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchGroups());
      dispatch(fetchOrgEmployees());
      setShareSuccess(false);
      setErrorMsg('');
      setComment('');
      setEmployeeSearch('');
      setSelectedRecipientId('');
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (groups && groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  if (!isOpen) return null;

  const handleShare = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (shareTarget === 'GROUP') {
      if (!selectedGroupId) {
        setErrorMsg('Please select an organization group.');
        return;
      }

      setIsSharing(true);
      try {
        const action = await dispatch(
          sendGroupMessage({
            groupId: selectedGroupId,
            content: comment.trim(),
            messageType: 'REPORT',
            reportData
          })
        );

        if (sendGroupMessage.fulfilled.match(action)) {
          setShareSuccess(true);
          setTimeout(() => {
            setIsSharing(false);
            setShareSuccess(false);
            onClose();
          }, 1500);
        } else {
          setErrorMsg(action.payload || 'Failed to share report.');
          setIsSharing(false);
        }
      } catch (err) {
        setErrorMsg('Failed to share report to group chat.');
        setIsSharing(false);
      }
    } else {
      // PERSON (Private 1-to-1)
      if (!selectedRecipientId) {
        setErrorMsg('Please select an employee colleague.');
        return;
      }

      setIsSharing(true);
      try {
        // Step 1: Get or Create canonical 1-to-1 conversation
        const convAction = await dispatch(startConversation({ recipientId: selectedRecipientId }));
        if (!startConversation.fulfilled.match(convAction)) {
          setErrorMsg(convAction.payload || 'Failed to start conversation with recipient.');
          setIsSharing(false);
          return;
        }

        const conversation = convAction.payload;

        // Step 2: Send report private message
        const msgAction = await dispatch(
          sendPrivateMessage({
            conversationId: conversation.id,
            content: comment.trim(),
            messageType: 'REPORT',
            reportData
          })
        );

        if (sendPrivateMessage.fulfilled.match(msgAction)) {
          setShareSuccess(true);
          setTimeout(() => {
            setIsSharing(false);
            setShareSuccess(false);
            onClose();
          }, 1500);
        } else {
          setErrorMsg(msgAction.payload || 'Failed to send private report.');
          setIsSharing(false);
        }
      } catch (err) {
        setErrorMsg('Failed to share report to private message.');
        setIsSharing(false);
      }
    }
  };

  const getPlatformIcon = (type) => {
    switch (type) {
      case 'YOUTUBE':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'GITHUB':
        return <Github className="w-5 h-5 text-slate-200" />;
      case 'TRENDS':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      default:
        return <Share2 className="w-5 h-5 text-brand-400" />;
    }
  };

  const isOrgUser = currentUser?.accountType === 'ORGANIZATION';

  // Filter employees excluding current user
  const filteredEmployees = (orgEmployees || []).filter(
    (emp) =>
      emp?.id !== currentUser?.id &&
      (emp?.name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp?.email?.toLowerCase().includes(employeeSearch.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 relative space-y-4 shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            {isForwarding ? (
              <Forward className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4 text-brand-400" />
            )}
            <span>{isForwarding ? 'Forward Analytics Report' : 'Share Report'}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isOrgUser ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 space-y-2">
            <AlertCircle className="w-5 h-5" />
            <p className="font-semibold">Organization Feature Only</p>
            <p className="text-slate-400">
              Report sharing and forwarding are exclusively available for Organization accounts.
            </p>
          </div>
        ) : (
          <form onSubmit={handleShare} className="space-y-4">
            {/* Target Selector: [ Group ] or [ Person ] */}
            <div className="flex border-b border-slate-800 space-x-6 pb-2">
              <button
                type="button"
                onClick={() => setShareTarget('GROUP')}
                className={`pb-2 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center space-x-1.5 ${
                  shareTarget === 'GROUP'
                    ? 'border-brand-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Group</span>
              </button>

              <button
                type="button"
                onClick={() => setShareTarget('PERSON')}
                className={`pb-2 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center space-x-1.5 ${
                  shareTarget === 'PERSON'
                    ? 'border-brand-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Person</span>
              </button>
            </div>

            {/* Report Summary Card Preview */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2.5">
                {getPlatformIcon(reportData?.type)}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {reportData?.type} Analytics Report
                  </span>
                  <h4 className="text-xs font-bold text-white leading-tight">{reportData?.title}</h4>
                </div>
              </div>

              {reportData?.subtitle && (
                <p className="text-[11px] text-slate-400">{reportData.subtitle}</p>
              )}

              {reportData?.metrics && reportData.metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                  {reportData.metrics.map((m, idx) => (
                    <div key={idx} className="bg-slate-950/60 p-2 rounded-lg text-[11px]">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">{m.label}</span>
                      <span className="font-bold text-white">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notification messages */}
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center">
                ⚠️ {errorMsg}
              </div>
            )}

            {shareSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center flex items-center justify-center space-x-2">
                <Check className="w-4 h-4" />
                <span>{isForwarding ? 'Report forwarded successfully!' : 'Report shared successfully!'}</span>
              </div>
            )}

            {/* DESTINATION SELECTION UI */}
            {shareTarget === 'GROUP' ? (
              /* GROUP SELECTOR */
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                  <Users className="w-3 h-3 mr-1" /> Select Target Group
                </label>
                {groups && groups.length > 0 ? (
                  <select
                    required
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl glass-input text-white bg-slate-900"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.memberCount} members)
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                    {isLoading ? 'Loading your groups...' : 'You do not belong to any active workspace groups.'}
                  </p>
                )}
              </div>
            ) : (
              /* PERSON / EMPLOYEE SELECTOR */
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                  <User className="w-3 h-3 mr-1" /> Select Colleague Employee
                </label>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    placeholder="Search employee by name or email..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-white bg-slate-900/80"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto divide-y divide-slate-800/60 bg-slate-950/40 rounded-xl border border-slate-800">
                  {filteredEmployees.length === 0 ? (
                    <p className="p-3 text-xs text-slate-500 text-center">
                      No matching organization employees found.
                    </p>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => setSelectedRecipientId(emp.id)}
                        className={`p-2.5 transition-colors flex items-center justify-between cursor-pointer ${
                          selectedRecipientId === emp.id
                            ? 'bg-brand-600/20 border-l-4 border-brand-500'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 font-bold text-slate-200 flex items-center justify-center text-[10px]">
                            {emp.name ? emp.name.substring(0, 2).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{emp.name}</h4>
                            <p className="text-[10px] text-slate-400">{emp.email}</p>
                          </div>
                        </div>

                        {selectedRecipientId === emp.id && (
                          <Check className="w-4 h-4 text-brand-400" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Optional Comment Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Optional Message / Comment
              </label>
              <textarea
                rows="2"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Check out this report for our project..."
                className="w-full p-2.5 text-xs rounded-xl glass-input text-white resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSharing ||
                  (shareTarget === 'GROUP' && (!selectedGroupId || groups.length === 0)) ||
                  (shareTarget === 'PERSON' && !selectedRecipientId)
                }
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-medium shadow-glass-indigo transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                {isForwarding ? <Forward className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                <span>
                  {isSharing
                    ? isForwarding
                      ? 'Forwarding...'
                      : 'Sharing...'
                    : isForwarding
                    ? 'Forward Report'
                    : shareTarget === 'GROUP'
                    ? 'Share to Group Chat'
                    : 'Send Private Report'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
