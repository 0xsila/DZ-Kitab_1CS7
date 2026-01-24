import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import api from "../../api/axios"
import DefaultBook from "../../assets/book.svg"

function Wishlist() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formError, setFormError] = useState("")
  const [formData, setFormData] = useState({
    isbn: "",
    title: "",
    authors: ""
  })
  const [isSearching, setIsSearching] = useState(false)

  const [availableBooks, setAvailableBooks] = useState([])
  const [pendingBooks, setPendingBooks] = useState([])

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist')
      setAvailableBooks(response.data.availableBooks)
      setPendingBooks(response.data.pendingBooks)
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    }
  }

  const resetForm = () => {
    setFormData({ isbn: "", title: "", authors: "" })
    setFormError("")
  }

  const handleAutoFill = async () => {
    if (!formData.isbn.trim()) {
      setFormError(t('enter_isbn_auto'))
      return
    }

    setIsSearching(true)
    setFormError("")

    try {
      const cleanIsbn = formData.isbn.trim().replace(/-/g, '')
      const response = await api.get(`/listings/lookup/${cleanIsbn}`)
      const book = response.data

      setFormData(prev => ({
        ...prev,
        title: book.title || "",
        authors: book.author || ""
      }))
    } catch (error) {
      console.error("Error fetching book details:", error)
      setFormError(t('book_not_found_manual'))
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddBook = async (event) => {
    event.preventDefault()
    if (!formData.isbn.trim() || !formData.title.trim() || !formData.authors.trim()) {
      setFormError(t('fill_all_fields'))
      return
    }

    try {
      await api.post('/wishlist', {
        isbn: formData.isbn.trim(),
        title: formData.title.trim(),
        authors: formData.authors.trim()
      })
      
      fetchWishlist()
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      setFormError(t('error_adding_wishlist'))
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    
    try {
      await api.delete(`/wishlist/${itemToDelete.id}`)
      setPendingBooks((prev) => prev.filter((book) => book.id !== itemToDelete.id))
      setAvailableBooks((prev) => prev.filter((book) => book.id !== itemToDelete.id))
      setShowDeleteModal(false)
      setItemToDelete(null)
    } catch (error) {
      console.error("Error deleting from wishlist:", error)
    }
  }

  const handleViewOffers = async (book) => {
    if (!book.listing_id) return;
    
    try {
      const response = await api.get(`/listings/${book.listing_id}`);
      const listing = response.data;
      
      const getCoverUrl = (url) => {
        if (!url) return DefaultBook;
        if (url.startsWith('http')) return url;
        return `http://localhost:3000${url}`;
      };

      const getDisplayImage = (listing) => {
        if (listing.photos) {
          try {
            const photos = typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos;
            if (Array.isArray(photos) && photos.length > 0) {
              return getCoverUrl(photos[0]);
            }
          } catch (e) {
            // ignore error
          }
        }
        return getCoverUrl(listing.cover_url);
      };

      const annonceData = {
        id: listing.id,
        title: listing.title,
        authors: listing.author,
        price: `${listing.price} DA`,
        condition: listing.condition === 'new' ? t('condition_new') : listing.condition === 'good' ? t('condition_good') : t('condition_used'),
        status: listing.status === 'active' ? t('status_available') : t('sold'),
        description: listing.description || t('no_description'),
        recommendation: t('recommended'),
        images: [getDisplayImage(listing)],
        seller: {
          name: `${listing.first_name} ${listing.last_name}`,
          phone: listing.phone || 'Non disponible',
          location: listing.wilaya || 'Non spécifié',
        },
      };
      
      navigate('/details', { state: { annonceData } });
    } catch (error) {
      console.error("Error fetching listing details:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-blue-900">{t('my_wishlist')}</h1>
        <button
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
          className="px-6 py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-all duration-300 shadow-lg shadow-blue-900/20 flex items-center gap-2 hover:-translate-y-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('add_to_wishlist')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Livres disponibles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-blue-900">{t('available_books')}</h2>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {availableBooks.length} {t('found')}
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {availableBooks.map((book) => (
              <div key={book.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{book.title}</h3>
                    <p className="text-gray-600 font-medium">{book.authors}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="text-gray-400 select-none">ISBN</span>
                    {book.isbn}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setItemToDelete(book)
                        setShowDeleteModal(true)
                      }}
                      className="text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-150 p-2 rounded-lg shadow-sm hover:shadow-md"
                      title="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleViewOffers(book)}
                      className="px-4 py-2 bg-blue-50 text-blue-900 text-sm font-bold rounded-lg hover:bg-blue-900 hover:text-white transition-all duration-300 flex items-center gap-2"
                    >
                      Voir les détails
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Livres en attente */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-blue-900">{t('pending_books')}</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {pendingBooks.length} {t('searching')}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingBooks.map((book) => (
              <div key={book.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 group relative">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 text-lg">{book.title}</h3>
                  <span className="shrink-0 bg-amber-50 text-amber-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    {t('pending')}
                  </span>
                </div>
                
                <p className="text-gray-500 font-medium mb-4">{book.authors}</p>
                
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-sm text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="text-gray-300 select-none">ISBN</span>
                    {book.isbn}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-medium">{t('added_on')} {book.dateAdded}</span>
                    <button
                      onClick={() => {
                        setItemToDelete(book)
                        setShowDeleteModal(true)
                      }}
                      className="text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-150 p-2 rounded-lg shadow-sm hover:shadow-md"
                      title={t('remove')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add book modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{t('add_book_title')}</h3>
                <p className="text-gray-500 mt-2">{t('add_book_desc')}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg p-1 transition-all duration-300 hover:rotate-90 hover:scale-110"
                aria-label="Fermer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 rounded-xl border border-red-100 font-medium">
                {formError}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleAddBook}>
              {/* ISBN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text"
                      value={formData.isbn}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isbn: e.target.value }))}
                      placeholder={t('isbn_placeholder')} 
                      className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                    />
                    {isSearching && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-900"></div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={isSearching}
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
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder={t('enter_title')} 
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                />
              </div>

              {/* Auteur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('author')}</label>
                <input 
                  type="text"
                  value={formData.authors}
                  onChange={(e) => setFormData((prev) => ({ ...prev, authors: e.target.value }))}
                  placeholder={t('enter_author')} 
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setShowAddModal(false)
                  }}
                  className="px-6 py-3 text-gray-600 font-medium hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 shadow-md shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/40 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
                >
                  {t('add_to_wishlist')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('delete_book_title')}</h3>
              <p className="text-gray-500 mb-8">
                {t('delete_book_confirm')} <span className="font-bold text-gray-800">"{itemToDelete?.title}"</span> {t('from_wishlist')}
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Wishlist
