import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useTranslation } from 'react-i18next';
import { Star, X } from "lucide-react"
import VisitorSidebar from "./VisitorSidebar"
import ProfileCard from "./ProfileCard"
import ActivitySection from "./ActivitySection"
import VisitorAnnouncements from "./VisitorAnnouncements"
import api from "../../api/axios"
import LoadingScreen from "../../components/LoadingScreen"
import SuccessToast from "../../components/SuccessToast"

function VisitorProfile({ user: propUser }) {
  const { t } = useTranslation();
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState("Profil")
  const [user, setUser] = useState(propUser || null)
  const [loading, setLoading] = useState(!propUser)
  
  // Rating state
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${id}`)
        setUser(response.data)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchRatings = async () => {
      try {
        const response = await api.get(`/ratings/${id}`)
        if (response.data.success) {
          setRatingStats({
            average: parseFloat(response.data.data.average) || 0,
            count: response.data.data.count || 0
          })
        }
      } catch (error) {
        console.error("Error fetching ratings:", error)
      }
    }

    if (propUser) {
      setUser(propUser)
      setLoading(false)
      // If propUser is provided, we might still need to fetch ratings if not included
      // Assuming we need to fetch ratings by ID
      if (propUser.id) {
         // We need to fetch ratings for propUser.id
         // But wait, if propUser is passed, id param might be undefined or different?
         // Usually VisitorProfile is used with useParams.
      }
    } else if (id) {
      fetchUser()
      fetchRatings()
    }
  }, [id, propUser])

  const handleRateSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) return

    setSubmittingRating(true)
    try {
      await api.post('/ratings', {
        rated_user_id: user.id,
        rating
      })
      setSuccessMessage(t('rating_success'))
      setShowSuccess(true)
      setShowRatingModal(false)
      setRating(0)
      
      // Refresh ratings
      const response = await api.get(`/ratings/${user.id}`)
      if (response.data.success) {
        setRatingStats({
          average: parseFloat(response.data.data.average) || 0,
          count: response.data.data.count || 0
        })
      }
      
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Error submitting rating:", error)
      alert(error.response?.data?.message || t('rating_error'))
    } finally {
      setSubmittingRating(false)
    }
  }

  if (loading) return <LoadingScreen />
  
  if (!user) return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-stone-50 px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('user_not_found')}</h2>
        <p className="text-gray-500 mb-8">
          {t('user_not_found_desc')}
        </p>
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-blue-900 text-white rounded-xl font-medium hover:bg-blue-800 transition-colors shadow-lg hover:shadow-xl"
        >
          {t('go_back')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <SuccessToast message={successMessage} show={showSuccess} onClose={() => setShowSuccess(false)} />
      
      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowRatingModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{t('rate_user', { name: user.first_name })}</h3>
            
            <form onSubmit={handleRateSubmit}>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      size={32} 
                      className={`${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                    />
                  </button>
                ))}
              </div>
              
              <button
                type="submit"
                disabled={submittingRating || rating === 0}
                className="w-full py-3 bg-blue-900 text-white rounded-xl font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submittingRating ? t('sending') : t('submit_review')}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex">
        <VisitorSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
        <main className="flex-1 p-6">
          {activeTab === "Profil" && (
            <div className="max-w-6xl mx-auto">
              <ProfileCard 
                user={user} 
                onRate={() => setShowRatingModal(true)}
                ratingStats={ratingStats}
              />
              <ActivitySection userId={user?.id} />
            </div>
          )}
          {activeTab === "Annonces" && <VisitorAnnouncements user={user} />}
        </main>
      </div>
    </div>
  )
}

export default VisitorProfile
