import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import Lecteurs from "../../assets/Lecteurs.svg";
import api from "../../api/axios";

export default function Connexion() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post("/auth/login", formData);
      
      if (response.data.success) {
        console.log("✅ Login Successful!", response.data);
        
        // Stocker le token et les infos utilisateur
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        
        // Trigger storage event for Header update
        window.dispatchEvent(new Event("storage"));

        // Afficher le message de succès
        setSuccess(true);
        
        // Rediriger après 1.5 secondes
        setTimeout(() => {
          console.log("🔄 Redirecting to main page...");
          navigate("/main");
        }, 1500);
      }
    } catch (err) {
      console.error("❌ Login Error:", err);
      setError(err.response?.data?.message || t('login_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
  
<motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: "#E5E7ED",
        backgroundImage: `url(${Lecteurs})`,
        backgroundSize: "cover",        
        backgroundPosition: "center",    
        backgroundRepeat: "no-repeat",   
      }}
      className="w-screen min-h-screen flex flex-col justify-start items-center px-4 py-8"
    >
  <div className="w-full max-w-3xl bg-neutral-50/95 rounded-2xl shadow-lg p-8 md:p-14 flex flex-col items-center gap-6 overflow-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#2a4074] text-center">
         {t('welcome_back')}
        </h1>
        <p className="text-[#2a4074] text-sm md:text-base text-center mb-2">
          {t('enter_credentials')}
        </p>

        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          {[
            { label: t('email_address'), name: "email", type: "email", placeholder: t('enter_email') },
            { label: t('password'), name: "password", type: "password", placeholder: t('enter_password') },
          ].map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <label className="text-[#2a4074] font-medium">{field.label}</label>
              <div className="relative">
                <input
                  type={field.name === "password" && showPassword ? "text" : field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required
                  className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl border border-[#2a4074]/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2a4074] placeholder-[#2a4074]/40 text-black"
                />
                {field.name === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2a4074]/60 hover:text-[#2a4074] transition-colors rtl:left-4 rtl:right-auto"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={showPassword ? "hide" : "show"}
                        initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </motion.div>
                    </AnimatePresence>
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {error && (
            <p className="text-[#811717] text-sm text-center">{error}</p>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl text-center animate-fade-in">
              <p className="font-medium">✅ {t('login_success')}</p>
              <p className="text-sm">{t('redirecting')}</p>
            </div>
          )}

          <p className="text-[#2a4074]/60 text-sm -mt-2 mb-2 text-right cursor-pointer">
            <span className="underline hover:text-[#2a4074]" onClick={() => navigate("/mot-de-passe-oublie")}>
              {t('forgot_password')}
            </span>
          </p>
          <button
              type="submit"
              disabled={loading || success}
              className="ml-100 mt-4 w-40 h-12 md:h-14 bg-[#811717] text-white font-medium rounded-xl shadow hover:bg-[#a22222] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
           {loading ? (
             <>
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               {t('logging_in')}
             </>
           ) : success ? t('success') : t('login_button')}
          </button>
        </form>

        <p className="text-[#2a4074]/60 text-sm mt-4 text-center">
          Vous n'avez pas de compte?{" "}
          <button type="button" className="underline hover:text-[#2a4074] cursor-pointer" onClick={() => navigate("/inscription")}>Inscrivez-vous</button>
        </p>
      </div>

      {/* Transition Overlay */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#E5E7ED] z-50 flex flex-col items-center justify-center gap-8"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl"
            >
              <CheckCircle size={48} className="text-[#2a4074]" />
            </motion.div>
            
            <div className="text-center space-y-3">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold text-[#2a4074]"
              >
                Bienvenue !
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[#2a4074]/70 text-lg"
              >
                Connexion réussie
              </motion.p>
            </div>
            
            <motion.div 
              className="w-48 h-1.5 bg-[#2a4074]/10 rounded-full overflow-hidden mt-4"
            >
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="w-full h-full bg-[#811717]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


