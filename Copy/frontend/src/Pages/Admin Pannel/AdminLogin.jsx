import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle, ShieldAlert } from "lucide-react";
import Lecteurs from "../../assets/Lecteurs.svg";
import api from "../../api/axios";
import { login } from "../../store/slices/authSlice";

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

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
        const user = response.data.data;
        
        // Check if user is admin
        if (user.role !== 'admin') {
          setError(t('admin_access_denied'));
          setLoading(false);
          return;
        }

        console.log("✅ Admin Login Successful!", response.data);
        
        // Dispatch login action to update Redux state
        dispatch(login({ user: user, token: response.data.token }));
        
        // Trigger storage event for Header update
        window.dispatchEvent(new Event("storage"));

        // Afficher le message de succès
        setSuccess(true);
        
        // Rediriger après 1.5 secondes
        setTimeout(() => {
          console.log("🔄 Redirecting to dashboard...");
          navigate("/dashboard");
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
      className="font-sans"
      style={{
        backgroundColor: "#E5E7ED", // Added className above for font
        backgroundImage: `url(${Lecteurs})`,
        backgroundSize: "cover",        
        backgroundPosition: "center",    
        backgroundRepeat: "no-repeat",   
      }}
      className="w-screen min-h-screen flex flex-col justify-start items-center px-4 py-8"
    >
      <div className="w-full max-w-3xl bg-neutral-50/95 rounded-2xl shadow-lg p-8 md:p-14 flex flex-col items-center gap-6 overflow-auto border-t-4 border-[#2a4074]">
        <div className="flex flex-col items-center gap-2">
          <ShieldAlert className="w-12 h-12 text-[#2a4074]" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#2a4074] text-center">
            {t('admin_login_title')}
          </h1>
        </div>
        <p className="text-[#2a4074] text-sm md:text-base text-center mb-2">
          {t('admin_login_subtitle')}
        </p>

        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          {[
            { label: t('email'), name: "email", type: "email", placeholder: t('enter_email') },
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
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#2a4074]/60 hover:text-[#2a4074]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Message d'erreur */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton de connexion */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || success}
            className={`w-full h-12 md:h-14 mt-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
              ${success 
                ? "bg-green-500 text-white cursor-default" 
                : "bg-[#2a4074] text-white hover:bg-[#1e2e54]"
              } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : success ? (
              <>
                <CheckCircle size={24} />
                {t('admin_login_success')}
              </>
            ) : (
              t('login_button')
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
