import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Lecteurs from "../../assets/Lecteurs.svg";
import api from "../../api/axios";

function ChangementReussie({ onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-neutral-50 rounded-2xl shadow-lg p-8 md:p-14 w-full max-w-md text-center relative animate-scale-in">
        <div className="flex justify-center mb-6">
          <div className="checkmark">
            <svg viewBox="-1 -1 54 54">
              <circle
                className="checkmark__circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="checkmark__check"
                fill="none"
                d="M14 27l7 7 16-16"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-[#2a4074] mb-4">
          {t('password_changed_success')}
        </h1>

        <button
          onClick={() => {
            onClose();
            navigate("/connexion");
          }}
          className="bg-[#811717] text-white px-6 py-3 rounded-xl shadow hover:bg-[#a22222] transition"
        >
          {t('login_button')}
        </button>
      </div>
    </div>
  );
}

export default function ChangeMdp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError(t('missing_token'));
      return;
    }

    // Validation du mot de passe : au moins 8 caractères, 1 majuscule, 1 minuscule et 1 chiffre
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError(t('password_requirements'));
      return;
    }

    // Vérifier que mot de passe et confirmation sont identiques
    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('password_mismatch'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        new_password: formData.newPassword
      });

      if (response.data.success) {
        setShowSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || t('error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
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
          {t('change_password')}
        </h1>
        <p className="text-[#2a4074] text-sm md:text-base text-center mb-2">
          {t('reset_password_desc')}
        </p>

        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          {[
            { name: "newPassword", placeholder: t('enter_new_password') },
            { name: "confirmPassword", placeholder: t('confirm_new_password') },
          ].map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <label className="text-[#2a4074] font-medium">{field.name === "newPassword" ? t('new_password') : t('confirm_password')}</label>
              <div className="relative">
                <input
                  type={
                    field.name === "newPassword" && showNewPassword
                      ? "text"
                      : field.name === "confirmPassword" && showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required
                  className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl border border-[#2a4074]/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2a4074] placeholder-[#2a4074]/40 text-black"
                />
                <button
                  type="button"
                  onClick={() =>
                    field.name === "newPassword"
                      ? setShowNewPassword(!showNewPassword)
                      : setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2a4074]/60 hover:text-[#2a4074] transition-colors"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={
                        (field.name === "newPassword" ? showNewPassword : showConfirmPassword)
                          ? "hide"
                          : "show"
                      }
                      initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {field.name === "newPassword" ? (
                        showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />
                      ) : (
                        showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
            </div>
          ))}

          {/* Message d'erreur */}
          <p className="text-[#811717] text-sm mt-1 min-h-[1.25rem]">
            {error}
          </p>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full md:w-auto px-8 h-12 md:h-14 bg-[#811717] text-white font-medium rounded-xl shadow hover:bg-[#a22222] transition self-center disabled:opacity-50"
          >
            {loading ? t('changing') : t('confirm')}
          </button>
        </form>
      </div>

      {/* Popup */}
      {showSuccess && <ChangementReussie onClose={() => setShowSuccess(false)} />}
    </div>
  );
}
