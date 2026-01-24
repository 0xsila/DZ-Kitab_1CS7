import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Bell, BookOpen, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useUnseenMessages from '../../hooks/useUnseenMessages';
import useNotifications from '../../hooks/useNotifications';
import Logo from '../../components/Logo';

export default function Header({ isLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const { t, i18n } = useTranslation();
  const { notifications, unreadCount: unreadNotifCount, markAsRead, markAllAsRead } = useNotifications(isLoggedIn);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.type === 'wishlist_available' && notification.related_id) {
      navigate(`/annonce/${notification.related_id}`);
      setShowNotifications(false);
    }
  };

  const handleLanguageClick = () => {
    navigate('/language');
  };

  useEffect(() => {
    const updateUser = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };
    updateUser();
    window.addEventListener('storage', updateUser);
    return () => window.removeEventListener('storage', updateUser);
  }, [isLoggedIn]);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.svg";
    if (avatarPath.startsWith('http')) return avatarPath;
    const backendUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const cleanBackendUrl = backendUrl.replace('/api', '');
    return `${cleanBackendUrl}${avatarPath}`;
  };

  const scrollToSection = (sectionId) => {
    if (location.pathname === '/' || location.pathname === '/main') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  const handleCatalogueClick = () => {
    navigate('/catalog');
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (location.pathname === '/main') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/main');
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToSectionMobile = (sectionId) => {
    scrollToSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  const unseenCount = useUnseenMessages();
  return (
    <header className="bg-stone-50 border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-6 lg:px-12 py-2 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="text-2xl font-bold text-blue-900 flex items-center gap-2 bg-transparent border-none cursor-pointer"
        >
          <Logo className="w-8 h-8" /> DZ-Kitab
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-12 text-gray-700 font-medium">
          <button
            onClick={() => scrollToSection('home')}
            className="hover:text-blue-500 transition-colors duration-300 cursor-pointer bg-none border-none"
          >
            {t('home')}
          </button>
          <button
            onClick={() => scrollToSection('announcements')}
            className="hover:text-blue-500 transition-colors duration-300 cursor-pointer bg-none border-none"
          >
            {t('latest_ads')}
          </button>
          <button
            onClick={() => scrollToSection('whyus')}
            className="hover:text-blue-500 transition-colors duration-300 cursor-pointer bg-none border-none"
          >
            {t('why_us')}
          </button>
          <button
            onClick={() => scrollToSection('impact')}
            className="hover:text-blue-500 transition-colors duration-300 cursor-pointer bg-none border-none"
          >
            {t('impact')}
          </button>
          <button
            onClick={handleCatalogueClick}
            className="hover:text-blue-500 transition-colors duration-300 cursor-pointer bg-none border-none"
          >
            {t('catalog')}
          </button>
          <button
            onClick={() => scrollToSection('footer')}
            className="hover:text-blue-500 transition-colors duration-300 cursor-pointer bg-none border-none"
          >
            {t('about')}
          </button>
        </nav>


        <div className="hidden lg:flex gap-4 items-center">
          {isLoggedIn && (
            <button
              onClick={handleLanguageClick}
              className="px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all font-medium text-sm"
            >
              {i18n.language === 'fr' ? 'FR' : 'AR'}
            </button>
          )}
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none"
                  title="Notifications"
                >
                  <Bell size={24} />
                </button>
                {unreadNotifCount > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-sm"></span>
                )}

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className={`absolute mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 ${i18n.language === 'ar' ? 'left-0' : 'right-0'}`}>
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-semibold text-gray-700">{t('notifications_title')}</h3>
                      {unreadNotifCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-transparent border-none cursor-pointer"
                        >
                          {t('mark_all_read')}
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-48">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <Bell size={24} className="text-gray-300" />
                          </div>
                          <p className="text-sm font-medium text-gray-600">{t('no_notifications')}</p>
                          <p className="text-xs text-gray-400 mt-1">{t('notification_empty_desc')}</p>
                        </div>
                      ) : (
                        notifications.map(notif => {
                          // Try to parse message as JSON for translation
                          let displayMessage = notif.message;
                          try {
                            const parsed = JSON.parse(notif.message);
                            if (parsed.key) {
                              displayMessage = t(parsed.key, parsed.args);
                            }
                          } catch (e) {
                            // Not JSON, use as is (legacy support)
                          }

                          return (
                          <div 
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-all group relative ${!notif.is_read ? 'bg-blue-50/60' : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${!notif.is_read ? 'bg-white text-blue-600 ring-1 ring-blue-100' : 'bg-gray-100 text-gray-500'}`}>
                                <BookOpen size={18} strokeWidth={2} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm mb-1.5 leading-relaxed ${!notif.is_read ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                  {displayMessage}
                                </p>
                                <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                                  {new Date(notif.created_at).toLocaleDateString(i18n.language, { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                              {!notif.is_read && (
                                <div className="absolute top-5 right-4 w-2 h-2 bg-blue-600 rounded-full ring-4 ring-blue-50"></div>
                              )}
                            </div>
                          </div>
                        )})
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => navigate('/messagerie')}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none"
                  title="Messages"
                >
                  <MessageCircle size={24} />
                </button>
                {unseenCount > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-sm"></span>
                )}
              </div>
              <button 
                onClick={() => navigate('/profile')}
                className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all cursor-pointer p-0"
                title="Profile"
              >
                <img 
                  src={getAvatarUrl(user?.avatar)} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => navigate('/inscription')}
                className="bg-red-700 hover:bg-red-500 hover:-translate-y-0.5 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 cursor-pointer border-none"
              >
                {t('register')}
              </button>
              <button 
                onClick={() => navigate('/connexion')}
                className="border-2 border-gray-400 text-gray-700 hover:bg-gray-300 hover:-translate-y-0.5 px-6 py-2 rounded-xl font-semibold transition-all duration-300 cursor-pointer bg-transparent"
              >
                {t('login')}
              </button>
              <button
                onClick={handleLanguageClick}
                className="px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all font-medium text-sm"
              >
                {i18n.language === 'fr' ? 'FR' : 'AR'}
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-6 flex flex-col gap-4 shadow-lg">
          <button
            onClick={() => scrollToSectionMobile('home')}
            className="text-left py-2 hover:text-blue-500 transition-colors bg-transparent border-none cursor-pointer font-medium text-gray-700"
          >
            {t('home')}
          </button>
          <button
            onClick={() => scrollToSectionMobile('announcements')}
            className="text-left py-2 hover:text-blue-500 transition-colors bg-transparent border-none cursor-pointer font-medium text-gray-700"
          >
            {t('latest_ads')}
          </button>
          <button
            onClick={() => scrollToSectionMobile('whyus')}
            className="text-left py-2 hover:text-blue-500 transition-colors bg-transparent border-none cursor-pointer font-medium text-gray-700"
          >
            {t('why_us')}
          </button>
          <button
            onClick={() => scrollToSectionMobile('impact')}
            className="text-left py-2 hover:text-blue-500 transition-colors bg-transparent border-none cursor-pointer font-medium text-gray-700"
          >
            {t('impact')}
          </button>
          <button
            onClick={handleCatalogueClick}
            className="text-left py-2 hover:text-blue-500 transition-colors bg-transparent border-none cursor-pointer font-medium text-gray-700"
          >
            {t('catalog')}
          </button>
          <button
            onClick={() => scrollToSectionMobile('footer')}
            className="text-left py-2 hover:text-blue-500 transition-colors bg-transparent border-none cursor-pointer font-medium text-gray-700"
          >
            {t('about')}
          </button>
          
          <div className="h-px bg-gray-100 my-2"></div>
          
          <div className="flex flex-col gap-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        navigate('/profile');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-200 p-0"
                    >
                      <img 
                        src={getAvatarUrl(user?.avatar)} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <span className="font-medium text-gray-700">{user?.first_name} {user?.last_name}</span>
                  </div>
                  <button
                    onClick={handleLanguageClick}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-gray-600 font-medium text-sm"
                  >
                    {i18n.language === 'fr' ? 'FR' : 'AR'}
                  </button>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      // Don't close menu so user can see notifications
                    }}
                    className="flex items-center gap-2 text-gray-600 bg-transparent border-none cursor-pointer"
                  >
                    <div className="relative">
                      <Bell size={20} />
                      {unreadNotifCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white"></span>
                      )}
                    </div>
                    <span>{t('notifications_title')}</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate('/messagerie');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-gray-600 bg-transparent border-none cursor-pointer"
                  >
                    <div className="relative">
                      <MessageCircle size={20} />
                      {unseenCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white"></span>
                      )}
                    </div>
                    <span>{t('messages_tooltip')}</span>
                  </button>
                </div>

                {/* Mobile Notifications Dropdown */}
                {showNotifications && (
                  <div className="bg-gray-50 rounded-lg p-2 max-h-60 overflow-y-auto border border-gray-200">
                     {notifications.length === 0 ? (
                        <p className="text-center text-sm text-gray-500 py-4">{t('no_notifications')}</p>
                      ) : (
                        notifications.map(notif => {
                          let displayMessage = notif.message;
                          try {
                            const parsed = JSON.parse(notif.message);
                            if (parsed.key) {
                              displayMessage = t(parsed.key, parsed.args);
                            }
                          } catch (e) {}

                          return (
                            <div 
                              key={notif.id}
                              onClick={() => {
                                handleNotificationClick(notif);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`p-3 border-b border-gray-100 last:border-0 text-sm ${!notif.is_read ? 'bg-blue-50 font-medium' : ''}`}
                            >
                              {displayMessage}
                            </div>
                          );
                        })
                      )}
                  </div>
                )}
              </>
            ) : (
              <>
                <button 
                  onClick={() => {
                    navigate('/inscription');
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-red-700 text-white px-6 py-2 rounded-xl font-semibold text-center border-2 border-red-700 hover:bg-white hover:text-red-700 transition-all duration-300 cursor-pointer"
                >
                  {t('register')}
                </button>
                <button 
                  onClick={() => {
                    navigate('/connexion');
                    setIsMobileMenuOpen(false);
                  }}
                  className="border-2 border-gray-400 text-gray-700 px-6 py-2 rounded-xl font-semibold text-center bg-transparent hover:bg-gray-700 hover:text-white hover:border-gray-700 transition-all duration-300 cursor-pointer"
                >
                  {t('login')}
                </button>
                <div className="flex justify-center">
                  <button
                    onClick={handleLanguageClick}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-gray-600 font-medium text-sm"
                  >
                    {i18n.language === 'fr' ? 'FR' : 'AR'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
