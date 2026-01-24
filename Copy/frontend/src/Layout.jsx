import { useEffect, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Pages/Main Page/Header';
import ProfileNavbar from './Pages/Profile Page/Navbar';
import Footer from './Pages/Main Page/Footer';
import { User, LogOut } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const element = useOutlet();
  const isProfile = location.pathname.startsWith('/profile');
  const isMessagerie = location.pathname === '/messagerie';
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Check for token to determine login state
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  return (
    <div className={`min-h-screen relative ${isMessagerie ? 'bg-gray-200' : 'bg-stone-50'}`}>
      <Header isLoggedIn={isLoggedIn} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {element}
        </motion.div>
      </AnimatePresence>
      {!isMessagerie && !isProfile && <Footer />}
    </div>
  );
}
