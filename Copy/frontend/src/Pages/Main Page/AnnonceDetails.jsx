'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import SuccessToast from '../../components/SuccessToast';
import { sendMessage } from '../../api/axios';
import axios from '../../api/axios';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, User, ArrowRight, MessageCircle, Download } from 'lucide-react'
import DefaultBook from '../../assets/book.svg';

export default function AnnonceDetails() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const [annonceData, setAnnonceData] = useState(location.state?.annonceData || null)
  const [loading, setLoading] = useState(!location.state?.annonceData)

  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const fetchAnnonce = async () => {
      if (!annonceData && id) {
        try {
          // We need an endpoint to fetch a single listing by ID
          // Assuming GET /listings/:id exists or we filter from all listings
          // Since we don't have a direct single listing endpoint in the previous context,
          // we might need to implement it or use the existing list endpoint.
          // Let's try to fetch from the list endpoint with a filter if possible, 
          // or just fetch all and find (not efficient but works for now)
          // OR better: implement getListingById in backend.
          
          // For now, let's assume we can get it. 
          // If not, we should add it to backend.
          const response = await axios.get(`/listings/${id}`);
          setAnnonceData(response.data);
        } catch (error) {
          console.error("Error fetching listing:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAnnonce();

    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr))
      } catch (e) {
        console.error("Error parsing user from local storage", e)
      }
    }
  }, [id, annonceData])

  const formatPrice = (price) => {
    if (!price) return '';
    const numericPrice = price.toString().replace(/[^0-9.,]/g, '').trim();
    return `${numericPrice} ${t('currency')}`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t('loading')}</div>;
  }

  const getCoverUrl = (url) => {
    if (!url) return DefaultBook;
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };

  const getDisplayData = (data) => {
    if (!data) {
      return {
        title: 'Médecine- Anatomie pour les étudiants 2ème édition',
        authors: 'Richard L. Drake, A. Wayne Vogl, Adam W. M. Mitchell',
        isbn: '978-1234567890',
        price: '900 DA',
        condition: 'Neuf',
        status: 'Disponible',
        description:
          "Ce livre est un ouvrage de référence pour les étudiants en médecine. Il couvre l'anatomie humaine de manière détaillée et illustrée.",
        recommendation: 'Recommandé pour la 1ère Année Médecine',
        images: ['/book-1.jpg', '/book-2.jpg', '/book-3.jpg', '/book-4.jpg', '/book-5.jpg'],
        seller: {
          id: 999,
          name: 'Ahmed Benali',
          phone: '+213 555 123 456',
          email: 'ahmed.benali@email.com',
          location: 'Alger, Algérie',
        },
      };
    }
    
    // Robust image handling 
    let images = [];
    let rawPhotos = data.images || data.photos;

    // 1. Handle stringified JSON if necessary (though backend should handle it)
    if (typeof rawPhotos === 'string') {
      try {
        if (rawPhotos.trim().startsWith('[')) {
             rawPhotos = JSON.parse(rawPhotos);
        } else {
             // single string url?
             rawPhotos = [rawPhotos];
        }
      } catch (e) {
        console.error("Failed to parse photos string", e);
        rawPhotos = [];
      }
    }

    // 2. Normalize to array
    if (!Array.isArray(rawPhotos)) {
        rawPhotos = [];
    }

    // 3. Filter valid items and map to full URLs
    images = rawPhotos
        .filter(p => p && typeof p === 'string')
        .map(url => getCoverUrl(url));

    // 4. Fallback to cover_url if images is empty
    if (images.length === 0) {
        if (data.cover_url) {
            images = [getCoverUrl(data.cover_url)];
        } else if (data.image) {
             images = [getCoverUrl(data.image)];
        } else {
            images = [DefaultBook];
        }
    }
    
    return {
      ...data,
      images: images,
      seller: data.seller || (data.user ? {
        id: data.user.id,
        name: `${data.user.first_name} ${data.user.last_name}`,
        phone: data.user.phone,
        email: data.user.email,
        location: data.user.wilaya,
        avatar: data.user.avatar
      } : {})
    };
  };

  const annonce = getDisplayData(annonceData);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    if (!annonceData?.id && !annonceData?.listing_id) {
      alert('Erreur: ID de l\'annonce manquant.');
      return;
    }
    try {
      // Use annonceData.id or annonceData.listing_id as the listingId
      const listingId = annonceData?.id || annonceData?.listing_id;
      await sendMessage({ listingId, content: message });
      setShowSuccess(true);
      setMessage('');
    } catch (e) {
      alert('Erreur lors de l\'envoi du message.');
    }
  }

  const openLightbox = () => {
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
  }

  const handleDownloadImage = async () => {
    try {
      const imageUrl = annonce.images[selectedImage];
      if (!imageUrl) return;

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `image-${Date.now()}.jpg`; 
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <>
      <SuccessToast message="Message envoyé !" show={showSuccess} onClose={() => setShowSuccess(false)} />
    <div className="bg-stone-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left side - Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div
              className="relative bg-white rounded-2xl shadow-lg overflow-hidden p-4 group hover:shadow-xl transition-shadow"
            >
              <img 
                onClick={openLightbox}
                src={annonce.images[selectedImage] || DefaultBook} 
                alt={annonce.title} 
                className="w-full h-64 md:h-96 object-contain cursor-pointer" 
              />
              
              {/* Download Button */}
              {annonce.images.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadImage();
                  }}
                  className="absolute top-6 right-6 p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-lg shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                  title="Télécharger l'image"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Thumbnails - full width, modern look */}
            {annonce.images.length > 0 && (
              <div className="flex w-full gap-4 mt-2 overflow-x-auto pb-2" style={{justifyContent: annonce.images.length > 1 ? 'flex-start' : 'center'}}>
                {annonce.images.slice(0, 5).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 md:w-[90px] md:h-[90px] rounded-xl border-2 transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400
                      ${selectedImage === index ? 'border-blue-900 ring-2 ring-blue-900 scale-105 shadow-lg z-10' : 'border-gray-200 hover:border-blue-400 hover:scale-105'}
                    `}
                    style={{ boxShadow: selectedImage === index ? '0 0 0 2px #1e3a8a22' : undefined }}
                    tabIndex={0}
                    aria-label={`Voir l'image ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right side - Details */}
          <div className="space-y-6">
            
            {/* Title and authors */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{annonce.title}</h1>
              <p className="text-gray-600 text-lg">{annonce.authors}</p>
              {annonce.publication_date && (
                <p className="text-gray-500 text-sm mt-1">
                  {t('published_in')} : {new Date(annonce.publication_date).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long' })}
                </p>
              )}
              {annonce.isbn && (
                <p className="text-gray-500 text-sm mt-1">
                  ISBN : {annonce.isbn}
                </p>
              )}
              {annonce.recommendation && (
                <div className="mt-3 inline-block bg-white text-red-900 text-sm font-bold px-4 py-2 rounded-lg border border-red-900 shadow-sm">
                  {annonce.recommendation}
                </div>
              )}
            </div>

            {/* Price and status */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-3xl font-black text-blue-900 tracking-tight">{formatPrice(annonce.price)}</div>
              {(annonce.accept_exchange === 1 || annonce.accept_exchange === true) && (
                <div className="bg-amber-100/80 text-amber-800 text-sm font-bold px-4 py-2 rounded-xl border border-amber-200 shadow-sm flex items-center gap-2 cursor-default" title={t('exchange_available')}>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                  </svg>
                  <span>{t('exchange_available')}</span>
                </div>
              )}
            </div>

            {/* Condition */}
            <div className="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100 flex items-center justify-start gap-4 w-fit">
              <span className="text-gray-600 font-medium">{t('condition')}</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full font-semibold text-sm">
                {annonce.condition === 'Neuf' ? t('condition_new') : annonce.condition === 'Bon' ? t('condition_good') : t('condition_used')}
              </span>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="font-bold text-gray-900 mb-3">{t('description')}</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{annonce.description}</p>
            </div>

            {/* Seller info */}
            {/* Seller Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
              
              <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2 relative z-10">
                <User className="w-5 h-5 text-blue-600" />
                {t('seller_info')}
              </h3>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                {/* Avatar with ring */}
                <Link 
                  to={annonce.seller?.id ? ((currentUser && String(currentUser.id) === String(annonce.seller.id)) ? '/profile' : `/profile/${annonce.seller.id}`) : '#'} 
                  className={`relative group block ${!annonce.seller?.id ? 'pointer-events-none' : ''}`}
                >
                  <div className="w-20 h-20 rounded-full shadow-md transform group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                    <img 
                      src={annonce.seller.avatar ? (annonce.seller.avatar.startsWith('http') ? annonce.seller.avatar : `http://localhost:3000${annonce.seller.avatar}`) : "/default-avatar.svg"} 
                      alt={annonce.seller.name}
                      className="w-full h-full object-cover bg-white"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 text-center sm:text-start space-y-4 w-full pt-2">
                  <h4 className="font-bold text-2xl text-gray-900 inline-block">
                    <Link 
                      to={annonce.seller?.id ? ((currentUser && String(currentUser.id) === String(annonce.seller.id)) ? '/profile' : `/profile/${annonce.seller.id}`) : '#'}
                      className={`hover:text-blue-700 transition-colors ${!annonce.seller?.id ? 'pointer-events-none' : ''}`}
                    >
                      {annonce.seller.name}
                    </Link>
                  </h4>
                  
                  <div className="space-y-3">
                    {/* Only show phone if available */}
                    {annonce.seller.phone ? (
                        <div className="flex items-center justify-center sm:justify-start gap-3 text-gray-600 p-2 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                            <Phone size={16} />
                        </div>
                        <span className="font-medium">{annonce.seller.phone}</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center sm:justify-start gap-3 text-gray-400 p-2 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                            <Phone size={16} />
                        </div>
                        <span className="font-medium italic">{t('not_available')}</span>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-center sm:justify-start gap-3 text-gray-600 p-2 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <Mail size={16} />
                      </div>
                      <span className="font-medium break-all">{annonce.seller.email || t('not_available')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {annonce.seller.id && (
                <motion.button
                  whileHover={{}}
                  whileTap={{}}
                  onClick={() => {
                    if (currentUser && String(currentUser.id) === String(annonce.seller.id)) {
                      navigate('/profile')
                    } else {
                      navigate(`/profile/${annonce.seller.id}`)
                    }
                  }}
                  className="mt-8 w-full px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 bg-blue-900 text-white shadow-lg hover:bg-white hover:text-blue-900 hover:shadow-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 group"
                >
                  <span className="relative z-10 tracking-wide">{t('view_full_profile')}</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform duration-200 rtl:rotate-180" />
                </motion.button>
              )}
            </div>

            {/* Contact seller - hidden if user is owner */}
            {(!currentUser || String(currentUser.id) !== String(annonce.seller.id)) && (
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="font-bold text-gray-900 mb-4">{t('contact_seller')}</h3>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('write_message')}
                  className="w-full border-2 border-gray-300 rounded-xl p-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                  rows="4"
                />
                <button
                  onClick={handleSendMessage}
                  className="mt-4 w-full text-black border-2 border-gray-300 bg-white hover:bg-blue-800 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  {t('send_message')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white text-5xl font-light hover:text-gray-300 transition-colors z-10"
            aria-label="Close lightbox"
          >
            ×
          </button>
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={annonce.images[selectedImage] || '/placeholder.svg'}
              alt={annonce.title}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
    </>
  )
}
