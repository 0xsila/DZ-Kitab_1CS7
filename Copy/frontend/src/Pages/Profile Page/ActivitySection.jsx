
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

function ActivitySection({ userId }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    activeListings: 0,
    soldListings: 0,
    wishlistItems: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let response;
        if (userId) {
          response = await api.get(`/users/${userId}/stats`);
        } else {
          response = await api.get('/users/stats');
        }
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchStats();
  }, [userId]);

  const activities = [
    {
      title: t('active_listings'),
      value: stats.activeListings,
      icon: (
        <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: t('sold_books'),
      value: stats.soldListings,
      icon: (
        <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: t('wishlist_available'),
      value: stats.wishlistItems,
      icon: (
        <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="max-w-4xl mx-auto mb-20">
      <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">{t('my_activity')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {activities.map((activity, index) => (
          <div 
            key={index} 
            className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              {activity.icon}
            </div>
            <span className="text-4xl font-bold text-gray-900 mb-2">{activity.value}</span>
            <h3 className="text-base font-medium text-gray-500 tracking-wide">{activity.title}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivitySection

