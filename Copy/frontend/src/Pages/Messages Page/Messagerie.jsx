import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import { getAllConversations, getListingConversation, sendMessage as sendMessageApi } from '../../api/axios';
import { Search, Send, ChevronLeft, ChevronRight, MoreVertical, Check, CheckCheck } from 'lucide-react';

export default function Messagerie() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('ventes');
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [userId, setUserId] = useState(null); // for identifying 'me' in messages

  // Utility to get userId from JWT
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded.userId || decoded.id || decoded.sub || null;
    } catch {
      return null;
    }
  };
  // Fetch all conversations on mount
  const fetchConvs = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const res = await getAllConversations();
      // Group by listing and role
      const ventes = {};
      const achats = {};
      const myUserId = getUserIdFromToken();
      res.messages.forEach(m => {
        // Determine other person's name
        let otherName = t('user');
        // Ensure loose comparison for IDs in case of string/number mismatch
        if (m.sender_id == myUserId) {
             otherName = m.receiver_name;
        } else {
             otherName = m.sender_name;
        }

        const conv = {
          id: m.listing_id,
          bookTitle: m.book_title || t('ad'),
          author: m.book_author || '',
          image:
            m.book_main_image && m.book_main_image.startsWith('/uploads/')
              ? `http://localhost:3000${m.book_main_image}`
              : m.book_main_image
                ? m.book_main_image
                : m.book_image && m.book_image.startsWith('/uploads/')
                  ? `http://localhost:3000${m.book_image}`
                  : m.book_image || '/A Song of Ice and Fire.jpg',
          senderName: m.sender_name,
          receiverName: m.receiver_name,
          otherName: otherName,
          lastMessage: m.content,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          // Only count as unread if the last message is from the other user and is not read
          unread: m.is_read || m.sender_id === myUserId ? 0 : 1,
          role: m.role,
          sellerId: m.seller_id,
          lastMessageIsMine: m.sender_id === myUserId,
          lastMessageIsRead: m.is_read,
        };
        if (myUserId && m.seller_id === myUserId && !ventes[m.listing_id]) ventes[m.listing_id] = conv;
        if (myUserId && m.seller_id !== myUserId && !achats[m.listing_id]) achats[m.listing_id] = conv;
      });
      setConversations({ ventes: Object.values(ventes), achats: Object.values(achats) });
      setUserId(myUserId);
      // Default select first in ventes or achats if none selected
      if (!selectedId) {
        if (activeTab === 'ventes' && Object.values(ventes).length > 0) setSelectedId(Object.values(ventes)[0].id);
        else if (activeTab === 'achats' && Object.values(achats).length > 0) setSelectedId(Object.values(achats)[0].id);
      }
    } catch (e) {
      // handle error
    }
    setLoadingConvs(false);
  }, [activeTab, selectedId]);

  useEffect(() => {
    fetchConvs();
    // eslint-disable-next-line
  }, [activeTab]);

  // Refetch conversations when page regains focus (user returns to Messagerie)
  useEffect(() => {
    const onFocus = () => fetchConvs();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchConvs]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedId) return;
    const fetchMsgs = async () => {
      setLoadingMsgs(true);
      try {
        const realUserId = getUserIdFromToken();
        const res = await getListingConversation(selectedId);

        // Refresh unseen count in Header
        window.dispatchEvent(new Event('unseen-messages-refresh'));

        setMessages(res.messages.map(m => ({
          id: m.id,
          from: m.sender_id === realUserId ? 'me' : 'them',
          text: m.content,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seen: m.is_read,
          sender_id: m.sender_id,
          receiver_id: m.receiver_id,
          sender_avatar: m.sender_avatar,
          receiver_avatar: m.receiver_avatar,
        })));
      } catch (e) {
        // handle error
      }
      setLoadingMsgs(false);
    };
    fetchMsgs();
  }, [selectedId]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !selectedId) return;
    // Find the selected conversation object
    const convs = conversations[activeTab] || [];
    const selected = convs.find(c => c.id === selectedId) || convs[0] || null;
    if (!selected) return;
    // Determine receiverId: if user is seller, receiver is buyer; if user is buyer, receiver is seller
    let receiverId = null;
    if (selected.role === 'seller') {
      // Seller is replying, receiver is the buyer (the other participant)
      receiverId = selected.receiverName === selected.senderName ? null : null; // fallback
      // Try to get buyer id from conversation (not available in current structure), so fallback to backend logic
    } else {
      // Buyer is replying, receiver is seller
      receiverId = null; // let backend infer seller
    }
    try {
      // Only send receiverId if we are the seller (to reply to buyer)
      if (selected.role === 'seller' && messages.length > 0) {
        // Find the last message not from me (the seller)
        const lastFromBuyer = [...messages].reverse().find(m => m.from === 'them');
        if (lastFromBuyer && lastFromBuyer.id) {
          await sendMessageApi({ listingId: selectedId, content: text });
        } else {
          await sendMessageApi({ listingId: selectedId, content: text });
        }
      } else {
        await sendMessageApi({ listingId: selectedId, content: text });
      }
      // Optimistically add the message to the UI immediately
      setMessages(prev => ([
        ...prev,
        {
          id: `temp-${Date.now()}`,
          from: 'me',
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seen: false,
        }
      ]));
      setDraft('');
      // Refresh messages from backend after a short delay to ensure correct order and seen status
      setTimeout(async () => {
        const realUserId = getUserIdFromToken();
        const res = await getListingConversation(selectedId);
        setMessages(res.messages.map(m => ({
          id: m.id,
          from: m.sender_id === realUserId ? 'me' : 'them',
          text: m.content,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seen: m.is_read,
        })));
        // Also refresh the conversation list so the latest message appears
        fetchConvs();
        // Refresh unseen count in Header
        window.dispatchEvent(new Event('unseen-messages-refresh'));
      }, 300);
    } catch (e) {
      // handle error
    }
  };

  const convs = conversations[activeTab] || [];
  let selected = convs.find(c => c.id === selectedId) || convs[0] || null;
  // Try to get the avatar of the other participant from the messages if not present in selected
  let otherAvatar = null;
  let otherName = selected ? selected.otherName : '';
  
  if (selected) {
    // If otherName is missing for some reason, recalculate
    if (!otherName) {
        if (selected.sellerId === userId) {
            otherName = selected.senderName === selected.receiverName ? selected.receiverName : (selected.senderName || selected.receiverName);
        } else {
            otherName = selected.role === 'buyer' ? selected.receiverName : selected.senderName;
        }
    }

    // Retrieve the other participant's avatar from the latest message from 'them'
    if (messages.length > 0) {
      const otherMsg = [...messages].reverse().find(m => m.from === 'them');
      if (otherMsg) {
        // Prefer avatar from backend fields if available
        if (userId && otherMsg.sender_id && otherMsg.sender_id !== userId && otherMsg.sender_avatar) {
          otherAvatar = otherMsg.sender_avatar;
        } else if (userId && otherMsg.receiver_id && otherMsg.receiver_id !== userId && otherMsg.receiver_avatar) {
          otherAvatar = otherMsg.receiver_avatar;
        } else if (otherMsg.avatar) {
          otherAvatar = otherMsg.avatar;
        }
      }
    }
    // Fallback to default avatar if not found or empty
    if (!otherAvatar || otherAvatar === '' || otherAvatar === null) {
      otherAvatar = '/default-avatar.svg';
    }
    // If the avatar is the default, use as is; otherwise, prefix with server URL if not already absolute
    let avatarUrl = otherAvatar;
    if (avatarUrl !== '/default-avatar.svg' && avatarUrl && !avatarUrl.startsWith('http')) {
      avatarUrl = `http://localhost:3000${avatarUrl}`;
    }
    selected = { ...selected, avatar: avatarUrl, otherName };
  }

  // --- SCROLL TO BOTTOM LOGIC ---
  const messagesEndRef = useRef(null);
  const bottomRef = useRef(null);
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedId]);

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
      <div className="bg-gray-200/80 backdrop-blur-md rounded-2xl p-2 sm:p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[80vh] max-h-[80vh]">
        {/* Left: conversations list */}
        <aside className="md:col-span-1 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col h-full">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-blue-900">{t('messaging')}</h2>
            <p className="text-sm text-gray-500">{t('messaging_desc')}</p>
          </div>

          {/* Tabs */}
          <div className="px-4 pt-3">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'ventes' ? 'bg-blue-900 text-white shadow-sm' : 'text-gray-700 hover:text-gray-900 hover:bg-white'}`}
                onClick={() => {
                  setActiveTab('ventes');
                  setSelectedId((conversations.ventes && conversations.ventes[0]) ? conversations.ventes[0].id : null);
                }}
              >
                {t('my_sales')}
              </button>
              <button
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'achats' ? 'bg-blue-900 text-white shadow-sm' : 'text-gray-700 hover:text-gray-900 hover:bg-white'}`}
                onClick={() => {
                  setActiveTab('achats');
                  setSelectedId((conversations.achats && conversations.achats[0]) ? conversations.achats[0].id : null);
                }}
              >
                {t('my_purchases')}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center px-4 py-3">
            <div className="w-full h-1 bg-gradient-to-r from-blue-400 via-blue-900 to-blue-400 animate-pulse rounded-full"></div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {convs.map((c) => (
              <button
                key={c.id}
                onClick={async () => {
                  setSelectedId(c.id);
                  // Optimistically mark as seen in UI
                  setConversations(prev => {
                    const updated = { ...prev };
                    const tab = activeTab;
                    updated[tab] = (updated[tab] || []).map(conv =>
                      conv.id === c.id ? { ...conv, unread: 0, lastMessageIsRead: true } : conv
                    );
                    return updated;
                  });
                  // Instantly refresh unseen badge in header/navbar
                  window.dispatchEvent(new Event('unseen-messages-refresh'));
                  // Optionally, trigger backend update by fetching messages (which marks as read)
                  try { await getListingConversation(c.id); } catch {}
                }}
                className={`w-full text-left px-3 py-3 border-b border-gray-100 transition-all hover:bg-blue-100/80 hover:shadow-sm hover:-translate-y-[1px] ${selected?.id === c.id ? 'bg-blue-100' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Book Image */}
                  <div className="w-12 h-16 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                    <img 
                      src={c.image} 
                      alt={c.bookTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    {/* Book Title + Time */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`font-semibold text-sm line-clamp-2 leading-tight ${c.unread > 0 ? 'text-black font-bold' : 'text-gray-500'}`}>
                        {c.bookTitle}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] text-gray-500">{c.time}</span>
                        {/* Show blue dot only if last message is from other user and not read */}
                        {c.unread > 0 && (
                          <div className="w-2 h-2 rounded-full bg-blue-600" title="Nouveau message"></div>
                        )}
                        {/* If last message is mine, show check or double check */}
                        {c.lastMessageIsMine && (
                          c.lastMessageIsRead
                            ? <CheckCheck size={16} className="text-blue-600" title="Vu" />
                            : <Check size={16} className="text-gray-400" title="Envoyé" />
                        )}
                      </div>
                    </div>
                    
                    {/* Sender Name */}
                    <p className={`text-xs mb-1 ${c.unread > 0 ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                      <span className="font-medium">{c.otherName}</span>
                    </p>
                    {/* Last Message Preview with 'vous:' label */}
                    <p className={`text-xs truncate flex items-center gap-1 ${c.unread > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                      <span className="font-semibold text-blue-600">{t('you')}:</span> {c.lastMessage}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>


          {/* Pager removed as requested */}
        </aside>

        {/* Right: conversation */}
        <section className="md:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3 min-w-0">
              {selected && (
                <>
                  {/* Other participant's profile picture */}
                  <img
                    src={selected.avatar}
                    alt={selected.otherName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                  />
                  <span className="font-semibold text-blue-900 text-lg truncate">{selected.otherName}</span>
                </>
              )}
              {!selected && (
                <span className="font-semibold text-gray-500">{t('select_listing')}</span>
              )}
            </div>
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><MoreVertical size={18} className="text-gray-600" /></button>
          </div>

          {/* --- SCROLL TO BOTTOM LOGIC --- */}
          {/* Place these at the top level of the component, before return */}
          {/*
          const messagesEndRef = useRef(null);
          const bottomRef = useRef(null);
          useEffect(() => {
            if (bottomRef.current) {
              bottomRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, [messages, selectedId]);
          */}

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 bg-gray-50/60">
            {!selected && (
              <div className="h-full w-full grid place-items-center text-gray-500">
                {t('choose_conversation')}
              </div>
            )}
            {selected && (
              <div className="space-y-3 max-w-3xl mx-auto">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm
                        ${m.from === 'me'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-blue-900 rounded-bl-sm border border-gray-200'}
                      `}
                      style={{
                        maxWidth: '75%',
                        wordBreak: 'break-word',
                      }}
                    >
                      <p>{m.text}</p>
                      <div className={`mt-1 flex items-center gap-1 ${m.from === 'me' ? 'text-blue-100/80' : 'text-gray-400'}`}>
                        <span className="text-[10px]">{m.time}</span>
                        {/* For sent messages, show single check if not seen, double check if seen */}
                        {m.from === 'me' && (m.seen
                          ? <CheckCheck size={14} title={t('seen')} />
                          : <Check size={14} title={t('sent')} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {/* Dummy div for scroll anchor */}
                <div ref={bottomRef}></div>
              </div>
            )}
          </div>



          {/* Composer */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-white sticky bottom-0 z-10">
            <div className="max-w-3xl mx-auto flex items-center gap-2">
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={1}
                placeholder={t('write_message')}
                className="flex-1 resize-none max-h-32 rounded-2xl border border-gray-300 bg-white shadow-sm px-4 py-3 text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-900/40 focus:border-blue-900 hover:border-blue-400 hover:shadow-lg hover:bg-blue-50/40"
                style={{ transition: 'all 0.3s cubic-bezier(.4,0,.2,1)' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                onClick={handleSend}
                className="inline-flex items-center justify-center h-11 px-5 rounded-2xl bg-blue-900 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] transition"
              >
                <Send size={18} className="mr-1 rtl:ml-1 rtl:mr-0" /> {t('send')}
              </button>
            </div>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}
