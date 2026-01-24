import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle, ShieldAlert, X } from "lucide-react";
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
  
  // Modal state for Admin Request
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({ name: "", email: "", message: "" });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

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

  // Handle Admin Request Submit
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    try {
      await api.post("/auth/request-admin-access", requestData);
      setRequestSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess(false);
        setRequestData({ name: "", email: "", message: "" });
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Error sending request");
    } finally {
      setRequestLoading(false);
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
      <div className="w-full max-w-3xl bg-neutral-50/95 rounded-2xl shadow-lg p-8 md:p-14 flex flex-col items-center gap-6 overflow-auto">
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
          
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="text-[#2a4074] opacity-80 hover:opacity-100 hover:underline text-sm font-medium transition-all bg-transparent border-none cursor-pointer"
            >
              {t('become_admin')}
            </button>
          </div>
        </form>
      </div>

      {/* Admin Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#2a4074] text-white">
                <h3 className="text-xl font-bold">{t('request_admin_title')}</h3>
                <button 
                  onClick={() => setShowRequestModal(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition"
                >
                  <X size={24} />
                </button>
              </div>

              {!requestSuccess ? (
                <form onSubmit={handleRequestSubmit} className="p-6 flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('your_name')}</label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2a4074] focus:border-[#2a4074] outline-none transition"
                      value={requestData.name}
                      onChange={(e) => setRequestData({ ...requestData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('your_email')}</label>
                    <input
                      type="email"
                      required
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2a4074] focus:border-[#2a4074] outline-none transition"
                      value={requestData.email}
                      onChange={(e) => setRequestData({ ...requestData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('motivation_message')}</label>
                    <textarea
                      required
                      rows="4"
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2a4074] focus:border-[#2a4074] outline-none transition resize-none"
                      value={requestData.message}
                      onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={requestLoading}
                    className="w-full bg-[#2a4074] text-white py-3 rounded-xl font-semibold hover:bg-[#1e2e54] transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
                  >
                     {requestLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                     {t('send_request')}
                  </button>
                </form>
              ) : (
                <div className="p-8 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">{t('request_sent_success')}</h4>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                  >
                    {t('close')}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
