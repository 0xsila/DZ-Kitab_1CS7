
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useSelector } from 'react-redux';


export default function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const token = useSelector(state => state.auth.token);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <section id="home" className="bg-gradient-to-r from-blue-50 to-stone-50 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Content */}
          <div className="flex flex-col gap-6 pt-8">
            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight font-rounded"
            >
              {t('hero_title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              {t('hero_subtitle')}
            </p>

            {/* Search bar with Enter navigation */}
            <div className="relative mt-2">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('search_placeholder')}
                className="w-full px-6 py-4 pl-12 rtl:pl-6 rtl:pr-12 border-2 border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 shadow-sm"
              />
              <svg
                className="absolute left-4 top-4 w-5 h-5 text-gray-400 rtl:right-4 rtl:left-auto"
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

            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => navigate('/catalog')}
                className="bg-blue-900 hover:bg-white hover:text-blue-900 hover:border-2 hover:shadow-xl hover:-translate-y-1 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                {t('view_catalog')}
              </button>
              <button
                onClick={() => {
                  if (token) {
                    navigate('/profile', { state: { activeTab: "Mes annonces", subTab: "nouvelle" } });
                  } else {
                    navigate('/connexion');
                  }
                }}
                className="border-2 border-red-700 text-red-700 hover:bg-red-700 hover:text-white hover:shadow-xl hover:-translate-y-1 px-8 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                {t('post_ad')}
              </button>
            </div>
          </div>

          <div className="hidden md:flex justify-center md:-mt-24 lg:-mt-40 md:scale-100 lg:scale-110 relative">
            {/* Light effect */}
            <img 
              src="/Polygon 2.png" 
              alt="" 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-none z-0 opacity-90 pointer-events-none blur-md" 
            />
            <img src="/HOMEPAGE PICS.png" alt="People exchanging books" className="w-100 h-auto relative z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
