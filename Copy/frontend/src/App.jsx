import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Provider, useSelector } from "react-redux";
import { store } from "./store/store";
import "./index.css";

import Layout from "./Layout.jsx";
import Main from "./Pages/Main Page/Main.jsx";
import Catalogue from "./Pages/Main Page/Catalogue.jsx";
import AnnonceDetails from "./Pages/Main Page/AnnonceDetails.jsx";
import ProfilePage from "./Pages/Profile Page/ProfilePage.jsx";
import VisitorProfile from "./Pages/Profile Page/VisitorProfile.jsx";
import Messagerie from "./Pages/Messages Page/Messagerie.jsx";
import LanguageSelection from "./Pages/LanguageSelection.jsx";

// Connexion Pages
import Connexion from "./Pages/Connexion Pages/Connexion.jsx";
import Inscription from "./Pages/Connexion Pages/Inscription.jsx";
import Home from "./Pages/Connexion Pages/Home.jsx";
import MdpOublie from "./Pages/Connexion Pages/MdpOublie.jsx";
import Otp from "./Pages/Connexion Pages/Otp.jsx";
import ChangeMdp from "./Pages/Connexion Pages/ChangeMdp.jsx";
import LoadingScreen from "./components/LoadingScreen";

// Admin Pages
import Dashboard from "./Pages/Admin Pannel/Dashboard.jsx";
import Annonces from "./Pages/Admin Pannel/Annonces.jsx";
import Utilisateurs from "./Pages/Admin Pannel/Utilisateurs.jsx";
import AdminLogin from "./Pages/Admin Pannel/AdminLogin.jsx";

// Protected Route for Admin
const AdminRoute = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    // Check if language is already selected
    const languageSet = localStorage.getItem('language_preference_set');
    const savedLang = localStorage.getItem('i18nextLng');
    
    if (!languageSet) {
      setShowLanguageSelection(true);
    } else if (savedLang) {
      // Ensure dir is correct
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLang;
    }

    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLanguageSelect = () => {
    setShowLanguageSelection(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Provider store={store}>
      <BrowserRouter>
        {showLanguageSelection ? (
          <LanguageSelection onLanguageSelect={handleLanguageSelect} />
        ) : (
          <Routes>
            {/* Auth Routes - Outside Layout */}
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/mot-de-passe-oublie" element={<MdpOublie />} />
            <Route path="/otp" element={<Otp />} />
            <Route path="/changer-mot-de-passe" element={<ChangeMdp />} />
            <Route path="/home" element={<Home />} />
            <Route path="/language" element={<LanguageSelection />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/annonces" element={<AdminRoute><Annonces /></AdminRoute>} />
            <Route path="/utilisateurs" element={<AdminRoute><Utilisateurs /></AdminRoute>} />
         

            {/* Main App Routes - Inside Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Main />} />
              <Route path="main" element={<Main />} />
              <Route path="catalog" element={<Catalogue />} />
              <Route path="annonce/:id" element={<AnnonceDetails />} />
              <Route path="details" element={<AnnonceDetails />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/:id" element={<VisitorProfile />} />
              <Route path="messagerie" element={<Messagerie />} />
            </Route>
          </Routes>
        )}
      </BrowserRouter>
    </Provider>
  );
}

export default App;