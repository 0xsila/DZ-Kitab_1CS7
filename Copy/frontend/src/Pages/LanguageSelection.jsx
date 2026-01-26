import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const LanguageSelection = ({ onLanguageSelect }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageSelect = (lang) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('i18nextLng', lang);
    localStorage.setItem('language_preference_set', 'true');
    
    if (onLanguageSelect) {
      onLanguageSelect();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-stone-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center transform transition-all hover:scale-[1.01] duration-300">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 font-rounded">
          DZ-KITAB
        </h1>
        <p className="text-gray-500 mb-10 text-lg">
          Choisissez une langue / اختر لغة
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleLanguageSelect('fr')}
            className="w-full group relative flex items-center justify-between p-4 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">FR</span>
              <div className="text-left">
                <p className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">Français</p>
                <p className="text-sm text-gray-400">Continuer en Français</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-blue-500 group-hover:bg-blue-500 transition-all"></div>
          </button>

          <button
            onClick={() => handleLanguageSelect('ar')}
            className="w-full group relative flex items-center justify-between p-4 border-2 border-gray-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">AR</span>
              <div className="text-left">
                <p className="font-bold text-gray-800 text-lg group-hover:text-emerald-600 transition-colors font-sans">العربية</p>
                <p className="text-sm text-gray-400">متابعة باللغة العربية</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-emerald-500 group-hover:bg-emerald-500 transition-all"></div>
          </button>
        </div>

        <div className="mt-12 text-sm text-gray-400">
          <p>Vous pourrez changer ultérieurement</p>
          <p>يمكنك تغيير هذا لاحقا</p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;
