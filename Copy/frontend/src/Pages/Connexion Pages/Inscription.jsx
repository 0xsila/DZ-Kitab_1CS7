import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Lecteurs from "../../assets/Lecteurs.svg";
import api from "../../api/axios";

export default function Inscription() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Backend requires: 8+ chars, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(t('password_requirements'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('password_mismatch'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (response.data.success) {
        // Redirection vers la page OTP avec l'email en state pour la vérification
        navigate("/otp", { state: { email: formData.email } });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || t('registration_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
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
      <div className="w-full max-w-2xl bg-neutral-50/95 rounded-2xl shadow-lg p-8 md:p-14 flex flex-col items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#2a4074] text-center">
          {t('welcome_platform')}
        </h1>
        <p className="text-[#2a4074] text-sm md:text-base text-center mb-2">
          {t('enter_info')}
        </p>

        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-1 w-full md:w-1/2">
              <label className="text-left text-[#2a4074] font-medium">{t('first_name')}</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder={t('your_first_name')}
                required
                className="h-12 md:h-14 px-4 md:px-5 rounded-xl border border-[#2a4074]/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2a4074] placeholder-[#2a4074]/40 text-black"
              />
            </div>
            <div className="flex flex-col gap-1 w-full md:w-1/2">
              <label className="text-left text-[#2a4074] font-medium">{t('last_name')}</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder={t('your_last_name')}
                required
                className="h-12 md:h-14 px-4 md:px-5 rounded-xl border border-[#2a4074]/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2a4074] placeholder-[#2a4074]/40 text-black"
              />
            </div>
          </div>

          {[
            { label: t('email_address'), name: "email", type: "email", placeholder: t('enter_email') },
            { label: t('phone_number'), name: "phone", type: "tel", placeholder: t('enter_phone') },
            { label: t('password'), name: "password", type: "password", placeholder: t('enter_password') },
            { label: t('confirm_password'), name: "confirmPassword", type: "password", placeholder: t('confirm_your_password') },
          ].map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <label className="text-left text-[#2a4074] font-medium">{field.label}</label>
              <div className="relative">
                <input
                  type={
                    field.name === "password" && showPassword
                      ? "text"
                      : field.name === "confirmPassword" && showConfirmPassword
                      ? "text"
                      : field.type
                  }
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required
                  className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl border border-[#2a4074]/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2a4074] placeholder-[#2a4074]/40 text-black"
                />
                {(field.name === "password" || field.name === "confirmPassword") && (
                  <button
                    type="button"
                    onClick={() =>
                      field.name === "password"
                        ? setShowPassword(!showPassword)
                        : setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2a4074]/60 hover:text-[#2a4074] transition-colors rtl:left-4 rtl:right-auto"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={
                          (field.name === "password" ? showPassword : showConfirmPassword)
                            ? "hide"
                            : "show"
                        }
                        initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {field.name === "password" ? (
                          showPassword ? <EyeOff size={20} /> : <Eye size={20} />
                        ) : (
                          showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <p className="text-[#811717] text-sm mt-1 min-h-[1.25rem]">
            {error}
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 md:h-14 bg-[#811717] text-white font-medium rounded-xl shadow hover:bg-[#a22222] transition disabled:opacity-50"
          >
            {loading ? t('registering') : t('register_button')}
          </button>
        </form>

        <p className="text-[#2a4074]/60 text-sm mt-4 text-center">
          {t('already_have_account')}{" "}
          <button type="button" className="underline cursor-pointer hover:text-[#2a4074]" onClick={() => navigate("/connexion")}>{t('login_here')}</button>
        </p>
      </div>
    </motion.div>
  );
}