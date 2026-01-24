import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from 'react-i18next';

function Sidebar({ activeTab, setActiveTab, user }) {
  const { t } = useTranslation();
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const navigate = useNavigate()

  const menuItems = [
    { label: "Mon profil", display: t('my_profile') },
    { label: "Mes annonces", display: t('my_listings') },
    { label: "Réglages", display: t('settings') },
    { label: "Ma Wishlist", display: t('my_wishlist') },
    { label: "Déconnexion", display: t('logout'), isDanger: true },
  ]

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.svg";
    if (avatarPath.startsWith('http')) return avatarPath;
    const backendUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const cleanBackendUrl = backendUrl.replace('/api', '');
    return `${cleanBackendUrl}${avatarPath}`;
  };

  const handleItemClick = (item) => {
    if (item.isDanger) {
      setShowLogoutModal(true)
    } else {
      setActiveTab(item.label)
    }
  }

  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-6">
        <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden mb-3">
            <img src={getAvatarUrl(user?.avatar)} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : t('user')}
          </h2>
        </div>

        <nav className="space-y-0">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              className={`w-full flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 ease-in-out border-b border-blue-100 cursor-pointer ${
                activeTab === item.label
                  ? "text-blue-900 font-bold bg-blue-100" 
                  : item.isDanger 
                    ? "text-red-600 hover:bg-red-50 hover:text-red-700" 
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-900"
              }`}
            >
              <span>{item.display}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full transform transition-all scale-100 animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('logout')}</h3>
              <p className="text-gray-500 mb-8">{t('logout_confirm')}</p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutModal(false)
                    localStorage.removeItem('token');
                    localStorage.removeItem('user'); // Clear user data if stored
                    navigate('/main');
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 hover:shadow-xl hover:shadow-red-500/50 hover:-translate-y-1 hover:scale-105 transition-all duration-300"
                >
                  {t('confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar

