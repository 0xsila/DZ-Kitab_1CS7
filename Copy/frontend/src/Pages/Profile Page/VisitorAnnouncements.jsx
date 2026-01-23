import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useTranslation } from 'react-i18next';
import api from "../../api/axios"
import DefaultBook from "../../assets/book.svg"

function VisitorAnnouncements({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("actives")
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchListings()
    }
  }, [user])

  const fetchListings = async () => {
    setLoading(true)
    try {
      // Ensure user.id is present
      if (!user?.id) return;
      
      const response = await api.get(`/listings/user/${user.id}`)
      setListings(response.data)
    } catch (error) {
      console.error("Error fetching listings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCoverUrl = (url) => {
    if (!url) return DefaultBook;
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };

  const getDisplayImage = (book) => {
    if (book.photos) {
      try {
        const photos = typeof book.photos === 'string' ? JSON.parse(book.photos) : book.photos;
        if (Array.isArray(photos) && photos.length > 0) {
          return getCoverUrl(photos[0]);
        }
      } catch (e) {
        // ignore error
      }
    }
    return getCoverUrl(book.cover_url);
  };

  const getFilteredListings = () => {
    switch (activeTab) {
      case "actives":
        return listings.filter(l => l.status === 'active')
      case "vendues":
        return listings.filter(l => l.status === 'sold')
      default:
        return []
    }
  }

  const handleBookClick = (book) => {
    const annonceData = {
      id: book.id,
      title: book.title,
      authors: book.author,
      isbn: book.isbn,
      publication_date: book.publication_date,
      price: `${book.price} ${t('currency')}`,
      condition: book.condition === 'new' ? t('condition_new') : book.condition === 'good' ? t('condition_good') : t('condition_used'),
      accept_exchange: book.accept_exchange === 1 || book.accept_exchange === true,
      status: book.status === 'active' ? t('available') : t('sold'),
      description: book.description || t('no_description'),
      recommendation: book.recommended_cursus ? t('recommended_for_cursus', { cursus: book.recommended_cursus }) : null,
      photos: book.photos, // Pass raw photos
      cover_url: book.cover_url, // Pass raw cover_url
      seller: {
        id: user?.id,
        name: user?.first_name ? `${user.first_name} ${user.last_name}` : t('seller'),
        phone: user?.phone || t('not_available'),
        location: user?.wilaya || t('not_available'),
        avatar: user?.avatar || '',
        email: user?.email || '',
      },
    }
    navigate('/details', { state: { annonceData } });
  }

  const filteredListings = getFilteredListings()

  const tabs = [
    { id: "actives", label: t('on_sale') },
    { id: "vendues", label: t('sold_tab') },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">{t('listings_of_user', { name: user?.first_name || t('user') })}</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === tab.id
                ? "text-blue-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-900 rounded-t-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{activeTab === 'actives' ? t('no_listings_available') : t('no_listings_sold')}</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {activeTab === 'actives' 
                ? t('no_active_listings_desc') 
                : t('no_sold_listings_desc')}
            </p>
          </div>
        ) : (
          filteredListings.map((book, index) => (
            <motion.div
              key={book.id}
              onClick={() => handleBookClick(book)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col relative group ${book.status === 'sold' ? 'opacity-90' : ''}`}
            >
              <div className={`relative bg-gradient-to-br ${book.status === 'sold' ? 'from-gray-800 to-gray-700 grayscale brightness-90' : 'from-blue-900 to-blue-800'} h-56 overflow-hidden`}>
                <img src={getDisplayImage(book)} alt={book.title} className="w-full h-full object-cover" />
                <div className={`absolute top-3 left-3 ${book.status === 'sold' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-white text-blue-900 border-blue-900'} text-xs font-bold px-3 py-1 rounded-full border-2`}>
                  {book.status === 'sold' ? t('sold') : (book.condition === 'new' ? t('condition_new') : book.condition === 'good' ? t('condition_good') : t('condition_used'))}
                </div>
                {book.recommended_cursus && book.status !== 'sold' && (
                  <div className="absolute bottom-2 left-2 right-2 bg-yellow-400 text-blue-900 text-[10px] leading-tight font-bold px-2 py-1 rounded-lg border border-blue-900 shadow-md z-10 text-center">
                    {t('recommended_for_cursus', { cursus: book.recommended_cursus })}
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{book.title}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{book.author}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto">
                  <span className="text-xs font-medium text-gray-700">{book.status === 'sold' ? `${t('sold_on_date')} ${new Date(book.updated_at).toLocaleDateString()}` : t('available')}</span>
                  <span className={`flex items-center gap-1 text-sm font-bold ${book.status === 'sold' ? 'text-gray-600 line-through' : 'text-green-600'}`}>
                    {book.status === 'active' && '✓'} {book.price} {t('currency')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default VisitorAnnouncements
