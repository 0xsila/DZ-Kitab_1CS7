import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer id="footer" className="bg-blue-900 text-white py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4">DZ-KITAB</h3>
            <p className="text-blue-100">{t('hero_subtitle')}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('about')}</h4>
            <ul className="space-y-2 text-blue-100">
              <li>
                <a href="#" className="hover:text-white hover:underline transition">
                  {t('who_we_are')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:underline transition">
                  {t('our_mission')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('support')}</h4>
            <ul className="space-y-2 text-blue-100">
              <li>
                <a href="#" className="hover:text-white hover:underline transition">
                  {t('help')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:underline transition">
                  {t('faq')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('contact')}</h4>
            <div className="text-blue-100 space-y-2">
              <p className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                dzkitab1cs7@gmail.com
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
                +213 792863886
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 pt-12 flex flex-col md:flex-row justify-between items-center text-blue-100">
          <p>&copy; 2025 DZ-KITAB. {t('rights_reserved')}</p>

          <div className="flex gap-6 mt-8 md:mt-0 items-center">
            <a href="https://web.facebook.com/profile.php?id=61587264650043" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:scale-110 transition-all duration-300" title="Facebook">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            <a href="https://www.instagram.com/dzkitab?igsh=MWpmemd1ZzV2ZGNm" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:scale-110 transition-all duration-300" title="Instagram">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.5-.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z" />
              </svg>
            </a>

            <a href="https://www.linkedin.com/in/dz-kitab-aa3baa3a7?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:scale-110 transition-all duration-300" title="LinkedIn">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
              </svg>
            </a>

            <a href="https://x.com/DzKitab" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:scale-110 transition-all duration-300" title="Twitter/X">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.207-6.807-5.979 6.807H2.631l7.732-8.835L1.91 2.25h6.837l4.716 6.231 5.449-6.231zM17.002 18.807h1.844L6.983 4.126H5.081l11.921 14.681z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
