import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, X, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import api from "../../api/axios"
import DefaultBook from "../../assets/book.svg"

const SuccessModal = ({ title, message, onClose }) => {
  const { t } = useTranslation()
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden"
    >
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
        <CheckCircle size={40} strokeWidth={3} />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title || t('success')}</h3>
      <p className="text-gray-500 mb-8 font-medium">{message}</p>
      
      <button 
        onClick={onClose}
        className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 hover:-translate-y-1 transition-all duration-300"
      >
        {t('continue')}
      </button>
    </motion.div>
  </div>
  )
}

function MyAnnouncements({ initialTab, user }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(initialTab || "nouvelle")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Edit & Success states
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [successTitle, setSuccessTitle] = useState("Succès !")

  const [formData, setFormData] = useState({
    isbn: "",
    title: "",
    author: "",
    publication_date: "",
    condition: "Neuf",
    description: "",
    price: "",
    accept_exchange: false,
    photos: [null, null, null, null, null] // Array of 5 slots
  })
  const [previewImages, setPreviewImages] = useState([null, null, null, null, null]) // Array of 5 slots

  const [isSearching, setIsSearching] = useState(false)
  const [priceStats, setPriceStats] = useState(null)

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const response = await api.get('/listings/my-listings')
      setListings(response.data)
    } catch (error) {
      console.error("Error fetching listings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e, index) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      setFormData(prev => {
        const newPhotos = [...prev.photos]
        newPhotos[index] = file
        return { ...prev, photos: newPhotos }
      })
      
      setPreviewImages(prev => {
        const newPreviews = [...prev]
        newPreviews[index] = URL.createObjectURL(file)
        return newPreviews
      })
    }
  }

  const removePhoto = (index) => {
    setFormData(prev => {
      const newPhotos = [...prev.photos]
      newPhotos[index] = null
      return { ...prev, photos: newPhotos }
    })
    
    setPreviewImages(prev => {
      const newPreviews = [...prev]
      newPreviews[index] = null
      return newPreviews
    })
  }

  const handleEdit = (book) => {
      console.log('DEBUG accept_exchange from backend:', book.accept_exchange);
    const conditionMap = {
      "new": t('condition_new'),
      "good": t('condition_good'),
      "used": t('condition_used')
    }

    // Initialize photos array with nulls
    const initialPhotos = [null, null, null, null, null];
    const initialPreviews = [null, null, null, null, null];

    // Handle existing photos
    if (book.photos) {
      try {
        const parsed = typeof book.photos === 'string' ? JSON.parse(book.photos) : book.photos;
        const photosArray = Array.isArray(parsed) ? parsed : [parsed];
        
        photosArray.forEach((url, index) => {
          if (index < 5) {
            // Store existing URL in formData as string (to distinguish from File object)
            // We'll use this to send back to server if not replaced
            const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
            initialPhotos[index] = url; // Keep original relative path for submission
            initialPreviews[index] = fullUrl;
          }
        });
      } catch (e) {
        // Single photo fallback
        const url = book.photos;
        const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
        initialPhotos[0] = url;
        initialPreviews[0] = fullUrl;
      }
    } else if (book.cover_url) {
      const url = book.cover_url;
      const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
      initialPhotos[0] = url;
      initialPreviews[0] = fullUrl;
    }

    setFormData({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publication_date: book.publication_date ? new Date(book.publication_date).getFullYear() : "",
      condition: conditionMap[book.condition] || "Neuf",
      description: book.description || "", 
      price: book.price,
      accept_exchange: [true, 1, "1", "true"].includes(book.accept_exchange),
      photos: initialPhotos
    })
    
    setPreviewImages(initialPreviews)
    setIsEditing(true)
    setEditingId(book.id)
    setActiveTab("nouvelle")
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAutoFill = async () => {
    if (!formData.isbn) return;
    try {
      const response = await api.get(`/listings/lookup/${formData.isbn}`);
      const book = response.data;
      setFormData(prev => ({
        ...prev,
        title: book.title || prev.title,
        author: book.author || prev.author,
        publication_date: book.publication_date ? new Date(book.publication_date).getFullYear() : prev.publication_date
      }));
      if (book.cover_url) {
        setPreviewImages(prev => {
          const newPreviews = [...prev];
          if (!newPreviews[0]) newPreviews[0] = book.cover_url;
          return newPreviews;
        });
        setFormData(prev => {
          const newPhotos = [...prev.photos];
          if (!newPhotos[0]) newPhotos[0] = book.cover_url;
          return { ...prev, photos: newPhotos };
        });
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        alert(t('book_not_found'));
      } else {
        console.error("Error looking up book:", error);
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const conditionMapping = {
      "Neuf": "new",
      "Bon état": "good",
      "Usé": "used"
    }

    const data = new FormData()
    data.append('isbn', formData.isbn)
    data.append('title', formData.title)
    data.append('author', formData.author)
    const pubDate = formData.publication_date ? `${formData.publication_date}-01-01` : ""
    data.append('publication_date', pubDate)
    data.append('condition', conditionMapping[formData.condition] || "new")
    data.append('description', formData.description)
    data.append('price', formData.price)
    data.append('accept_exchange', formData.accept_exchange)

    // Handle photos slots
    formData.photos.forEach((item, index) => {
      if (item instanceof File) {
        // New file upload
        data.append(`photo_${index}`, item)
      } else if (typeof item === 'string') {
        // Existing URL
        data.append(`photo_${index}`, item)
      }
    })

    try {
      const config = {
        headers: {
          'Content-Type': undefined
        }
      };

      if (isEditing) {
        data.append('status', 'active')
        await api.put(`/listings/${editingId}`, data, config)
        setSuccessTitle(t('success'))
        setSuccessMessage(t('ad_updated_success'))
      } else {
        await api.post('/listings', data, config)
        setSuccessTitle(t('success'))
        setSuccessMessage(t('ad_published_success'))
      }
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      resetForm()
      setActiveTab("actives")
      fetchListings()
    } catch (error) {
      console.error("Error saving listing:", error)
      alert(isEditing ? t('error_saving_ad') : t('error_creating_ad'))
    } finally {
      setIsSubmitting(false);
    }
  }

  const resetForm = () => {
    setFormData({
      isbn: "",
      title: "",
      author: "",
      publication_date: "",
      condition: "Neuf",
      description: "",
      price: "",
      accept_exchange: false,
      photos: []
    })
    setPreviewImages([])
    setIsEditing(false)
    setEditingId(null)
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      if (activeTab === 'supprimees') {
        await api.delete(`/listings/${itemToDelete.id}/permanent`)
      } else {
        await api.delete(`/listings/${itemToDelete.id}`)
      }
      setShowDeleteModal(false)
      fetchListings()
    } catch (error) {
      console.error("Error deleting listing:", error)
    }
  }

  const handleMarkAsSold = async (book) => {
    try {
      await api.put(`/listings/${book.id}`, { status: 'sold' })
      setSuccessTitle(t('status_updated'))
      setSuccessMessage(t('ad_marked_sold'))
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      fetchListings()
    } catch (error) {
      console.error("Error marking as sold:", error)
      alert(t('error_updating_status'))
    }
  }

  const handleMarkAsActive = async (book) => {
    try {
      await api.put(`/listings/${book.id}`, { status: 'active' })
      setSuccessTitle(t('status_updated'))
      setSuccessMessage(t('ad_relisted'))
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      fetchListings()
    } catch (error) {
      console.error("Error marking as active:", error)
      alert(t('error_updating_status'))
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
    if (book.cover_url) return getCoverUrl(book.cover_url);
    return DefaultBook;
  };

  const handleBookClick = (book) => {
    // Pass raw data to details page and let it handle parsing/display
    const annonceData = {
      id: book.id,
      title: book.title,
      authors: book.author,
      isbn: book.isbn,
      publication_date: book.publication_date,
      price: `${book.price} DA`,
      condition: book.condition === 'new' ? t('condition_new') : book.condition === 'good' ? t('condition_good') : t('condition_used'),
      accept_exchange: book.accept_exchange === 1 || book.accept_exchange === true || book.accept_exchange === "1" || book.accept_exchange === "true",
      status: book.status === 'active' ? t('status_available') : t('sold'),
      description: book.description || t('no_description'),
      recommendation: book.recommended_cursus ? `${t('recommended_for')} ${book.recommended_cursus}` : null,
      photos: book.photos, // Pass raw photos array/string
      cover_url: book.cover_url, // Pass raw cover_url
      seller: {
        id: user?.id,
        name: 'Moi',
        avatar: user?.avatar,
        email: user?.email,
        phone: user?.phone,
      },
    }
    navigate('/details', { state: { annonceData } });
  }

  const getFilteredListings = () => {
    switch (activeTab) {
      case "actives":
        return listings.filter(l => l.status === 'active')
      case "vendues":
        return listings.filter(l => l.status === 'sold')
      case "supprimees":
        return listings.filter(l => l.status === 'deleted') // Assuming you have soft delete or status
      default:
        return []
    }
  }

  const filteredListings = getFilteredListings()

  const tabs = [
    { id: "nouvelle", label: t('tabs_new') },
    { id: "actives", label: t('tabs_active') },
    { id: "vendues", label: t('tabs_sold') },
    { id: "supprimees", label: t('tabs_deleted') },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">{t('my_ads')}</h1>

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

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal 
            title={successTitle}
            message={successMessage} 
            onClose={() => setShowSuccess(false)} 
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
      {activeTab === "nouvelle" && (
        <motion.div
          key="nouvelle"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
        >
          <h2 className="text-xl font-bold text-blue-900 mb-6">
            {isEditing ? t('edit_ad_title') : t('create_new_ad_title')}
          </h2>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* ISBN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    placeholder={t('isbn_placeholder')} 
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                    required
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-900"></div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const cleanIsbn = formData.isbn.replace(/-/g, '');
                    if (cleanIsbn.length >= 10) {
                      setIsSearching(true);
                      
                      // Fetch book details
                      api.get(`/listings/lookup/${cleanIsbn}`)
                        .then(response => {
                          const book = response.data;
                          setFormData(prev => ({
                            ...prev,
                            title: book.title || prev.title,
                            author: book.author || prev.author,
                            publication_date: book.publication_date ? new Date(book.publication_date).getFullYear() : prev.publication_date
                          }));
                          if (book.cover_url) {
                            setPreviewImages(prev => {
                              const newPreviews = [...prev];
                              newPreviews[0] = book.cover_url;
                              return newPreviews;
                            });
                            setFormData(prev => {
                              const newPhotos = [...prev.photos];
                              newPhotos[0] = book.cover_url;
                              return { ...prev, photos: newPhotos };
                            });
                          }
                        })
                        
                        .finally(() => setIsSearching(false));

                      // Fetch stats
                      api.get(`/listings/stats/${cleanIsbn}`)
                        .then(res => setPriceStats(res.data))
                        .catch(() => setPriceStats(null));
                    }
                  }}
                  className="px-4 py-3 bg-blue-50 text-blue-900 font-bold rounded-xl hover:bg-blue-100 transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline">{t('auto_fill')}</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">{t('auto_fill_hint')}</p>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('book_title')}</label>
              <input 
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t('enter_title')} 
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                required
              />
            </div>

            {/* Auteur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('author')}</label>
              <input 
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder={t('enter_author')} 
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                required
              />
            </div>

            {/* Date de publication */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('publication_year')}</label>
              <input 
                type="number"
                name="publication_date"
                value={formData.publication_date}
                onChange={handleInputChange}
                onWheel={(e) => e.target.blur()}
                placeholder="2025" 
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
              />
            </div>

            {/* État du livre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">{t('condition')}</label>
              <div className="flex gap-4">
                {[t('condition_new'), t('condition_good'), t('condition_used')].map((etat) => (
                  <label key={etat} className="flex-1 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="condition" 
                      value={etat}
                      checked={formData.condition === etat}
                      onChange={handleInputChange}
                      className="peer sr-only" 
                    />
                    <div className="text-center py-3 px-4 rounded-xl border border-gray-200 peer-checked:border-blue-600 peer-checked:bg-blue-100 peer-checked:text-blue-900 peer-checked:font-bold transition-all duration-300 group-hover:border-blue-400 group-hover:bg-blue-50 group-hover:text-blue-800 group-hover:shadow-md">
                      {etat}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('description')}</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder={t('give_description')} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
              ></textarea>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('price_da')}</label>
              <div className="flex flex-col md:flex-row gap-4 items-stretch">
                <div className="relative flex-[2]">
                  <input 
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    onWheel={(e) => e.target.blur()}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all pr-12 h-full"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">DA</span>
                </div>
                
                {priceStats && priceStats.avg_price ? (
                  <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-left-2 duration-300 hover:shadow-md transition-all group cursor-help relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200/20 rounded-full -mr-8 -mt-8 blur-xl"></div>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0 ring-2 ring-blue-100 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="relative">
                      <p className="text-[10px] uppercase tracking-wider text-blue-500 font-bold mb-0.5">{t('avg_price_label')}</p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-xl font-black text-blue-900">{priceStats.avg_price}</p>
                        <span className="text-xs font-bold text-blue-700">DA</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-tight">
                      {t('no_avg_price')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Accept Exchange - Theme Consistent Design */}
            <label 
              htmlFor="accept_exchange" 
              className={`flex items-center gap-4 p-4 cursor-pointer select-none rounded-xl border-2 transition-all duration-200 ${
                formData.accept_exchange 
                  ? 'bg-blue-50 border-blue-600 shadow-sm' 
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox"
                  name="accept_exchange"
                  id="accept_exchange"
                  checked={formData.accept_exchange}
                  onChange={(e) => setFormData(prev => ({ ...prev, accept_exchange: e.target.checked }))}
                  className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-gray-300 transition-all checked:border-blue-600 checked:bg-blue-600 hover:border-blue-400"
                />
                <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div className="flex-1">
                <span className={`block text-base font-bold transition-colors ${formData.accept_exchange ? 'text-blue-900' : 'text-gray-700'}`}>
                  {t('accept_exchange_label')}
                </span>
                <span className={`block text-xs font-medium ${formData.accept_exchange ? 'text-blue-600' : 'text-gray-500'}`}>
                  {t('exchange_available')}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${formData.accept_exchange ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                  </svg>
              </div>
            </label>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('photos')}</label>
              <p className="text-xs text-gray-500 mb-4">{t('main_photo_hint')}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Main Photo Slot (Index 0) */}
                <div className="col-span-2 md:col-span-1 md:row-span-2 relative aspect-[2/3] border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-all duration-300 group overflow-hidden bg-gray-50">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 0)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  {previewImages[0] ? (
                    <>
                      <img src={previewImages[0]} alt="Main Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                        <p className="text-white text-xs font-bold mb-2">{t('change')}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          removePhoto(0)
                        }}
                        className="absolute top-2 right-2 z-30 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-gray-500">{t('main_photo')}</span>
                    </div>
                  )}
                </div>

                {/* Secondary Photo Slots (Indices 1-4) */}
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="relative aspect-[2/3] border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-all duration-300 group overflow-hidden bg-gray-50">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, index)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {previewImages[index] ? (
                      <>
                        <img src={previewImages[index]} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                          <p className="text-white text-xs font-bold mb-2">{t('change')}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            removePhoto(index)
                          }}
                          className="absolute top-2 right-2 z-30 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-1 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <span className="text-[10px] font-medium">{t('photo_n')} {index + 1}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 mt-8">
              <button type="button" onClick={resetForm} className="px-6 py-3 text-gray-600 font-medium hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300" disabled={isSubmitting}>
                {t('cancel')}
              </button>
              <button type="submit" className={`px-8 py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-blue-900/20 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('processing')}</span>
                  </div>
                ) : (
                  isEditing ? t('save_changes') : t('publish_ad')
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {activeTab === "actives" && (
        <motion.div 
          key="actives"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredListings.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{t('no_active_ads')}</h3>
              <p className="text-gray-500">{t('no_active_ads_desc')}</p>
              <button 
                onClick={() => setActiveTab("nouvelle")}
                className="mt-6 px-6 py-2 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800 transition-colors"
              >
                {t('create_ad_btn')}
              </button>
            </div>
          ) : (
            filteredListings.map((book, index) => (
            <motion.div
              key={book.id}
              onClick={() => handleBookClick(book)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col relative group"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setItemToDelete(book)
                  setShowDeleteModal(true)
                }}
                className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <div className="relative bg-gradient-to-br from-blue-900 to-blue-800 h-56 overflow-hidden">
                <img src={getDisplayImage(book)} alt={book.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex flex-col gap-2 items-start z-10">
                  <div className="bg-white/95 backdrop-blur-sm text-blue-900 text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg shadow-sm border border-blue-100/50">
                    {book.condition === 'new' ? t('condition_new') : book.condition === 'good' ? t('condition_good') : t('condition_used')}
                  </div>
                  {(book.accept_exchange === 1 || book.accept_exchange === true || book.accept_exchange === "1" || book.accept_exchange === "true") && (
                     <div className="bg-amber-100/95 backdrop-blur-md text-amber-800 text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg shadow-sm border border-amber-200/50 flex items-center gap-1">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                      </svg>
                      {t('exchange_available')}
                    </div>
                  )}
                </div>
                {book.recommended_cursus && (
                  <div className="absolute bottom-2 left-2 right-2 bg-yellow-400 text-blue-900 text-[10px] leading-tight font-bold px-2 py-1 rounded-lg border border-blue-900 shadow-md z-10 text-center">
                    {t('recommended_for')} {book.recommended_cursus}
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{book.title}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{book.author}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto mb-4">
                  <span className="text-xs font-medium text-gray-700">{t('status_available')}</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-green-600">✓ {book.price} DA</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(book)
                    }}
                    className="flex-1 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out bg-blue-50 text-blue-900 hover:bg-blue-200 text-xs font-bold"
                  >
                    {t('edit')}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkAsSold(book)
                    }}
                    className="flex-1 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out bg-red-50 text-red-700 hover:bg-red-200 text-xs font-bold"
                  >
                    {t('mark_sold')}
                  </button>
                </div>
              </div>
            </motion.div>
          )))}
        </motion.div>
      )}

      {activeTab === "vendues" && (
        <motion.div 
          key="vendues"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredListings.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{t('no_history_ads')}</h3>
              <p className="text-gray-500">{t('no_history_ads')}</p>
            </div>
          ) : (
            filteredListings.map((book, index) => (
            <motion.div
              key={book.id}
              onClick={() => handleBookClick(book)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col opacity-90 hover:opacity-100"
            >
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-700 h-56 overflow-hidden grayscale brightness-90">
                <img src={getDisplayImage(book)} alt={book.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full border-2 border-red-200">
                  {t('sold')}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{book.title}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{book.author}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto mb-4">
                  <span className="text-xs font-medium text-gray-500">{t('sold_on')} {new Date(book.updated_at || Date.now()).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-gray-600 line-through">{book.price} DA</span>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMarkAsActive(book)
                  }}
                  className="w-full px-3 py-2 rounded-lg transition-all duration-300 ease-in-out bg-blue-50 text-blue-900 hover:bg-blue-200 text-xs font-bold"
                >
                  {t('relist')}
                </button>
              </div>
            </motion.div>
          )))}
        </motion.div>
      )}

      {activeTab === "supprimees" && (
        <motion.div 
          key="supprimees"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredListings.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{t('empty_trash_title')}</h3>
              <p className="text-gray-500">{t('empty_trash_desc')}</p>
            </div>
          ) : (
            filteredListings.map((book, index) => (
            <motion.div
              key={book.id}
              onClick={() => handleBookClick(book)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col relative group"
            >
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-56 overflow-hidden">
                <img src={getDisplayImage(book)} alt={book.title} className="w-full h-full object-cover opacity-90" />
                <div className="absolute top-3 right-3 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-gray-700">
                  {t('tabs_deleted')}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{book.title}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{book.author}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto mb-4">
                  <span className="text-xs font-medium text-gray-700">{book.status}</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-gray-500">{book.price} DA</span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkAsActive(book)
                    }}
                    className="flex-1 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out bg-blue-50 text-blue-900 hover:bg-blue-200 text-xs font-bold"
                  >
                    {t('restore')}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setItemToDelete(book)
                      setShowDeleteModal(true)
                    }}
                    className="px-3 py-2 rounded-lg transition-all duration-300 ease-in-out bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                    title={t('delete_permanently_tooltip')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )))}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full transform transition-all scale-100 animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {activeTab === 'supprimees' ? t('delete_permanently_title') : t('delete_confirm_title')}
              </h3>
              <p className="text-gray-500 mb-8">
                {activeTab === 'supprimees' 
                  ? <>{t('delete_permanently_confirm')} <span className="font-bold text-gray-800">"{itemToDelete?.title}"</span> ?</>
                  : <>{t('delete_ad_confirm')} <span className="font-bold text-gray-800">"{itemToDelete?.title}"</span> ?</>
                }
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 hover:border-gray-300 hover:text-gray-900 hover:shadow-md transition-all duration-300"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/40 hover:-translate-y-1 transition-all duration-300"
                >
                  {activeTab === 'supprimees' ? t('delete') : t('move_to_trash')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAnnouncements
