import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import '../../assets/announcements-bg-motifs.css';
import DefaultBook from '../../assets/book.svg';

export default function Announcements() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsVisible, setItemsVisible] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsVisible(1);
      else if (window.innerWidth < 1024) setItemsVisible(2);
      else setItemsVisible(4);
    };

    handleResize(); // Set initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get('/listings');
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 > books.length - itemsVisible ? prevIndex : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 < 0 ? 0 : prevIndex - 1));
  };

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
    let images = [];
    if (book.photos) {
      try {
        const photos = typeof book.photos === 'string' ? JSON.parse(book.photos) : book.photos;
        if (Array.isArray(photos)) {
          images = photos.map(getCoverUrl).slice(0, 5);
        }
      } catch (e) {} // eslint-disable-line no-empty
    }
    if (images.length === 0 && book.cover_url) {
      images = [getCoverUrl(book.cover_url)];
    }
    const annonceData = {
      id: book.id,
      title: book.title,
      authors: book.author,
      isbn: book.isbn,
      publication_date: book.publication_date,
      price: `${book.price} DA`,
      condition:
        book.condition === 'new'
          ? t('condition_new')
          : book.condition === 'good'
          ? t('condition_good')
          : t('condition_used'),
      status: t('status_available'),
      accept_exchange: book.accept_exchange === 1 || book.accept_exchange === true,
      description: book.description || t('no_description'),
      recommendation: book.recommended_cursus
        ? `${t('recommended_for')} ${book.recommended_cursus}`
        : null,
      images,
      seller: {
        id: book.user_id,
        name:
          book.first_name && book.last_name
            ? `${book.first_name} ${book.last_name}`
            : 'Utilisateur',
        phone: book.phone || 'Non disponible',
        location: book.wilaya || 'Non spécifié',
        avatar: book.avatar,
        email: book.email,
      },
    };
    navigate('/details', { state: { annonceData } });
  };

  if (loading) {
    return (
      <section
        id="announcements"
        className="py-16 md:py-24 bg-stone-100 announcements-bg-motifs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">{t('loading')}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="announcements"
      className="py-16 md:py-24 bg-stone-100 announcements-bg-motifs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 text-center bg-white rounded-2xl px-6 py-3 shadow-md inline-block w-fit mx-auto">
            {t('latest_ads')}
          </h2>
        </div>

        <div className="relative px-2" dir="ltr">
          {books.length > itemsVisible && (
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-lg text-blue-900 transition-all border border-gray-100 ${
                currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
              aria-label="Précédent"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          <div className="overflow-hidden -mx-3 py-4">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsVisible)}%)`,
              }}
            >
              {books.length === 0 ? (
                <div className="w-full text-center text-gray-500 py-8">
                  {t('no_announcements')}
                </div>
              ) : (
                books.map((book) => (
                  <div
                    key={book.id}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${100 / itemsVisible}%` }}
                  >
                    <div
                      onClick={() => handleBookClick(book)}
                      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full"
                    >
                      <div className="relative bg-gradient-to-br from-blue-900 to-blue-800 h-56 overflow-hidden">
                        <img
                          src={getDisplayImage(book)}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                          <div className="bg-white text-blue-900 text-xs font-bold px-3 py-1 rounded-full border-2 border-blue-900 shadow-sm">
                            {book.condition === 'new'
                              ? t('condition_new')
                              : book.condition === 'good'
                              ? t('condition_good')
                              : t('condition_used')}
                          </div>
                          {(book.accept_exchange === 1 ||
                            book.accept_exchange === true) && (
                            <div className="bg-amber-100/95 backdrop-blur-md text-amber-800 text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg shadow-sm border border-amber-200/50 flex items-center gap-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
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

                      <div className="p-5">
                        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                          {book.author}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <span className="text-xs font-medium text-gray-700">
                            {t('status_available')}
                          </span>
                          <span className="flex items-center gap-1 text-sm font-bold text-green-600">
                            ✓ {book.price} {t('currency')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {books.length > itemsVisible && (
            <button
              onClick={nextSlide}
              disabled={currentIndex >= books.length - itemsVisible}
              className={`absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-lg text-blue-900 transition-all border border-gray-100 ${
                currentIndex >= books.length - itemsVisible
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50'
              }`}
              aria-label="Suivant"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate('/catalog')}
            className="text-[1.3rem] px-6 py-2.5 rounded-2xl font-semibold hover:text-red-400 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 bg-white shadow-md border border-gray-200"
          >
            {t('view_catalog')}
            <svg
              className="w-4 h-4 rtl:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

