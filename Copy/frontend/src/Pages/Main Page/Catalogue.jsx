import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Filter } from 'lucide-react';
import api from '../../api/axios';
import DefaultBook from '../../assets/book.svg';

export default function Catalogue() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [selectedCondition, setSelectedCondition] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  // Get search query from URL if present
  const params = new URLSearchParams(location.search);
  const initialSearch = params.get('search') || "";
  const [search, setSearch] = useState(initialSearch);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState("");
  const [sortOption, setSortOption] = useState('Plus récent');
  const [cursusList, setCursusList] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes, cursusRes] = await Promise.all([
          api.get('/listings'),
          api.get('/listings/cursus')
        ]);
        setBooks(listingsRes.data);
        setCursusList(cursusRes.data);
        setError("");
        setDebug(JSON.stringify(listingsRes.data, null, 2));
      } catch (err) {
        setError("Erreur lors du chargement des données.");
        setBooks([]);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCoverUrl = (url) => {
    if (!url) return DefaultBook;
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };

  const getCursusLabel = (dbValue) => {
    if (!dbValue) return null;
    const map = {
      '1ere Annee Medecine': 'cursus_med',
      '1ere Annee Informatique': 'cursus_cs',
      '1ere Annee Architecture': 'cursus_arch',
      '1ère Année Médecine': 'cursus_med',
      '1ère année de Licence Informatique': 'cursus_cs',
      '1ère année de Licence Architecture': 'cursus_arch'
    };
    const key = map[dbValue] || dbValue;
    return t(key);
  };

  const getDisplayImage = (book) => {
    if (book.photos) {
      try {
        const photos = typeof book.photos === 'string' ? JSON.parse(book.photos) : book.photos;
        if (Array.isArray(photos) && photos.length > 0) {
          return getCoverUrl(photos[0]);
        }
      } catch (e) {}
    }
    if (book.cover_url) return getCoverUrl(book.cover_url);
    return DefaultBook; // Default image
  };

  const handleBookClick = (book) => {
    let images = [];
    if (book.photos) {
      try {
        const photos = typeof book.photos === 'string' ? JSON.parse(book.photos) : book.photos;
        if (Array.isArray(photos)) {
          images = photos.map(getCoverUrl).slice(0, 5);
        }
      } catch (e) {}
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
      condition: book.condition === 'new' ? t('condition_new') : book.condition === 'good' ? t('condition_good') : t('condition_used'),
      status: t('status_available'),
      accept_exchange: book.accept_exchange === 1 || book.accept_exchange === true,
      description: book.description || t('no_description'),
      recommendation: book.recommended_cursus ? `${t('recommended_for')} ${t(book.recommended_cursus)}` : null,
      images,
      seller: {
        id: book.user_id,
        name: (book.first_name && book.last_name) ? `${book.first_name} ${book.last_name}` : 'Utilisateur',
        phone: book.phone || 'Non disponible',
        location: book.wilaya || 'Non spécifié',
        avatar: book.avatar,
        email: book.email,
      },
    };
    navigate('/details', { state: { annonceData } });
  };

  const toggleCondition = (condition) => {
    setSelectedCondition((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const toggleCategory = (category) => {
    setSelectedCategory((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
  };

  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen py-8 flex items-center justify-center">
        <span className="text-gray-500">{t('loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-stone-50 min-h-screen py-8 flex flex-col items-center justify-center">
        <span className="text-red-500">{error}</span>
        <pre className="bg-gray-100 text-xs p-4 mt-4 rounded max-w-2xl overflow-x-auto">{debug}</pre>
      </div>
    );
  }

  // Helper to normalize strings (remove accents, lowercase)
  const normalize = (str) =>
    (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

  // Filter books by relaxed searchbar
  const normalizedSearch = normalize(search.trim());

  let filteredBooks = books.filter((book) => {
    // Filter by search
    const matchesSearch =
      normalize(book.title).includes(normalizedSearch) ||
      normalize(book.author).includes(normalizedSearch) ||
      normalize(book.isbn).includes(normalizedSearch) ||
      normalize(book.recommended_cursus).includes(normalizedSearch) ||
      normalize(book.recommended_university).includes(normalizedSearch) ||
      normalize(book.publication_date).includes(normalizedSearch);

    // Filter by condition
    const conditionMap = {
      'new': 'Neuf',
      'good': 'Bon',
      'used': 'Usé',
      'bon': 'Bon',
      'neuf': 'Neuf',
      'usé': 'Usé',
    };
    const bookCondition = conditionMap[normalize(book.condition)] || book.condition;
    const matchesCondition =
      selectedCondition.length === 0 || selectedCondition.includes(bookCondition);

    // Filter by price range
    const bookPrice = Number(book.price) || 0;
    const matchesPrice = bookPrice >= priceRange[0] && bookPrice <= priceRange[1];

    // Filter by Cursus (Category)
    // If no category selected, show all. If selected, book must match one of the selected cursus.
    // We check if book.recommended_cursus is in selectedCategory
    const matchesCategory = selectedCategory.length === 0 || (book.recommended_cursus && selectedCategory.includes(book.recommended_cursus));

    return matchesSearch && matchesCondition && matchesPrice && matchesCategory;
  });

  // Sort books by selected option
  filteredBooks = [...filteredBooks].sort((a, b) => {
    if (sortOption === 'Plus récent') {
      // Assuming publication_date is a string like '2023-01-01'
      return new Date(b.publication_date) - new Date(a.publication_date);
    }
    if (sortOption === 'Prix croissant') {
      return (a.price || 0) - (b.price || 0);
    }
    if (sortOption === 'Prix décroissant') {
      return (b.price || 0) - (a.price || 0);
    }
    return 0;
  });

  // Render catalogue UI (simplified)
  return (
    <div className="bg-stone-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search bar */}
        <div className="mb-6">
          <div className="flex gap-3 items-center max-w-4xl mx-auto">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full px-5 py-3 pl-11 border-2 border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 hover:border-blue-300 transition-all duration-300 shadow-md"
              />
              <svg
                className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              onClick={() => navigate('/profile', { state: { activeTab: "Mes annonces", subTab: "nouvelle" } })}
              className="border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white hover:shadow-xl hover:-translate-y-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap"
            >
              {t('post_ad')}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden col-span-full mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 bg-white p-3 rounded-xl shadow-sm border border-gray-200 text-gray-700 font-medium"
            >
              <Filter size={20} />
              {showFilters ? t('hide_filters') : t('show_filters')}
            </button>
          </div>

          {/* Left Sidebar - Filters */}
          <div className={`lg:col-span-1 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl p-5 shadow-md">
              <h3 className="font-bold text-blue-900 mb-4 text-base">{t('sort_by')}</h3>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
              >
                <option className="cursor-pointer">{t('newest')}</option>
                <option className="cursor-pointer">{t('price_asc')}</option>
                <option className="cursor-pointer">{t('price_desc')}</option>
              </select>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md">
              <h3 className="font-bold text-blue-900 mb-4 text-base">{t('condition')}</h3>
              <div className="space-y-3">
                {['Neuf', 'Bon', 'Usé'].map((condition) => (
                  <label key={condition} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCondition.includes(condition)}
                      onChange={() => toggleCondition(condition)}
                      className="w-4 h-4 text-blue-600 accent-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">
                      {condition === 'Neuf' ? t('condition_new') : condition === 'Bon' ? t('condition_good') : t('condition_used')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md">
              <h3 className="font-bold text-gray-900 mb-4 text-base">{t('price_range')}</h3>
              <div className="space-y-4" dir="ltr">
                <div className="relative h-2">
                  <div className="absolute w-full h-2 bg-gray-200 rounded-lg"></div>
                  <div
                    className="absolute h-2 bg-blue-600 rounded-lg"
                    style={{
                      left: `${(priceRange[0] / 50000) * 100}%`,
                      right: `${100 - (priceRange[1] / 50000) * 100}%`,
                    }}
                  ></div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      if (value < priceRange[1]) {
                        setPriceRange([value, priceRange[1]])
                      }
                    }}
                    className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                  />
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      if (value > priceRange[0]) {
                        setPriceRange([priceRange[0], value])
                      }
                    }}
                    className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{priceRange[0]} DA</span>
                  <span>{priceRange[1] >= 50000 ? '∞' : `${priceRange[1]} DA`}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md">
              <h3 className="font-bold text-blue-900 mb-4 text-base">{t('recommended_cursus')}</h3>
              <div className="space-y-3">
                {cursusList.map((c) => {
                  const rawLabel = c.title || c.name;
                  return (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategory.includes(rawLabel)}
                        onChange={() => toggleCategory(rawLabel)}
                        className="w-4 h-4 text-blue-600 accent-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{getCursusLabel(rawLabel)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Right Content - Books Grid */}
          <div className="lg:col-span-3">
            {/* Books Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredBooks.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">{t('no_listings')}</div>
              ) : (
                filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => handleBookClick(book)}
                    className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative bg-gradient-to-br from-blue-900 to-blue-800 h-56 overflow-hidden">
                      <img src={getDisplayImage(book)} alt={book.title} className="w-full h-full object-cover" />
                      
                      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                        <div className="bg-white text-blue-900 text-xs font-bold px-3 py-1 rounded-full border-2 border-blue-900 shadow-sm">
                          {book.condition === 'new' ? t('condition_new') : book.condition === 'good' ? t('condition_good') : t('condition_used')}
                        </div>
                        {(book.accept_exchange === 1 || book.accept_exchange === true) && (
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
                          {t('recommended_for')} {getCursusLabel(book.recommended_cursus)}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{book.title}</h3>
                      <p className="text-xs text-gray-500 mb-4 line-clamp-2">{book.author}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-xs font-medium text-gray-700">{t('available')}</span>
                        <span className="flex items-center gap-1 text-sm font-bold text-green-600">✓ {book.price} DA</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
