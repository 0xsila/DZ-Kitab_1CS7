import { useEffect, useState } from 'react';
import { getAllConversations } from '../api/axios';
import { jwtDecode } from 'jwt-decode';

export default function useUnseenMessages() {
  const [unseenCount, setUnseenCount] = useState(0);


  useEffect(() => {
    const fetchUnseen = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return setUnseenCount(0);
        const decoded = jwtDecode(token);
        const userId = decoded.userId || decoded.id || decoded.sub;
        const res = await getAllConversations();
        // Collect unique announce (listing_id) for unseen messages
        const uniqueAnnounces = new Set();
        res.messages.forEach(m => {
          if (!m.is_read && m.receiver_id === userId && m.sender_id !== userId) {
            uniqueAnnounces.add(m.listing_id);
          }
        });
        setUnseenCount(uniqueAnnounces.size);
      } catch {
        setUnseenCount(0);
      }
    };
    fetchUnseen();
    // Optionally, poll every 30s
    const interval = setInterval(fetchUnseen, 30000);
    // Listen for custom event to refresh unseen count instantly
    const handler = () => fetchUnseen();
    window.addEventListener('unseen-messages-refresh', handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener('unseen-messages-refresh', handler);
    };
  }, []);

  return unseenCount;
}
