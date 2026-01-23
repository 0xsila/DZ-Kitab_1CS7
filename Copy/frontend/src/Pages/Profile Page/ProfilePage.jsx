import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion"
import api from "../../api/axios"
import Sidebar from "./Sidebar"
import ProfileCard from "./ProfileCard"
import ActivitySection from "./ActivitySection"
import MyAnnouncements from "./MyAnnouncements"
import Settings from "./Settings"
import Wishlist from "./Wishlist"
import VisitorProfile from "./VisitorProfile"
import LoadingScreen from "../../components/LoadingScreen"

function ProfilePage() {
  const { t } = useTranslation();
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("Mon profil")
  const [isVisitorMode, setIsVisitorMode] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 })

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
    }
  }, [location.state])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile')
        if (response.data.success) {
          setUser(response.data.data)
          localStorage.setItem('user', JSON.stringify(response.data.data))
          
          // Fetch ratings
          try {
            const ratingRes = await api.get(`/ratings/${response.data.data.id}`)
            setRatingStats(ratingRes.data.data)
          } catch (e) {
            console.error("Error fetching ratings:", e)
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (!user && !isVisitorMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('profile_load_error')}</h2>
          <p className="text-gray-600 mb-4">{t('profile_load_error_desc')}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    )
  }

  if (isVisitorMode) {
    return (
      <>
        <VisitorProfile user={user} />
        <button
          onClick={() => setIsVisitorMode(false)}
          className="fixed bottom-4 right-4 z-50 px-6 py-3 bg-gray-900 text-white font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
        >
          {t('back_to_owner_view')}
        </button>
      </>
    )
  }

  const menuItems = [
    { label: "Mon profil", display: t('my_profile') },
    { label: "Mes annonces", display: t('my_listings') },
    { label: "Réglages", display: t('settings') },
    { label: "Ma Wishlist", display: t('my_wishlist') },
    { label: "logout", display: t('logout'), isDanger: true },
  ]

  const handleMobileTabClick = (item) => {
    if (item.isDanger) {
      if (window.confirm(t('logout_confirm'))) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/main');
      }
    } else {
      setActiveTab(item.label);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col lg:flex-row">
        <div className="hidden lg:block">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
        </div>
        
        {/* Mobile Tab Navigation */}
        <div className="lg:hidden bg-white border-b border-gray-200 overflow-x-auto sticky top-[73px] z-40">
          <div className="flex px-4 min-w-max">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleMobileTabClick(item)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === item.label
                    ? "border-blue-600 text-blue-600"
                    : item.isDanger
                      ? "border-transparent text-red-600 hover:text-red-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {item.display}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-6 overflow-hidden w-full">
          <AnimatePresence mode="wait">
            {activeTab === "Mon profil" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto"
              >
                <ProfileCard user={user} ratingStats={ratingStats} />
                <ActivitySection userId={user?.id} />
              </motion.div>
            )}
            {activeTab === "Mes annonces" && (
              <motion.div
                key="announcements"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MyAnnouncements initialTab={location.state?.subTab} user={user} />
              </motion.div>
            )}
            {activeTab === "Réglages" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Settings user={user} setUser={setUser} />
              </motion.div>
            )}
            {activeTab === "Ma Wishlist" && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Wishlist />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      
    </div>
  )
}

export default ProfilePage

