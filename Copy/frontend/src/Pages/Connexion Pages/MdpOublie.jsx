import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Lecteurs from "../../assets/Lecteurs.svg";
import api from "../../api/axios";

export default function MdpOublie() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/auth/forgot-password", { email });
      if (response.data.success) {
        setMessage(t('reset_link_sent'));
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
      <div className="w-full max-w-2xl bg-neutral-50/95 rounded-2xl shadow-lg p-8 md:p-14 flex flex-col items-center gap-6 overflow-auto">
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#2a4074] text-center">
         {t('forgot_password_title')}
        </h1>

        <p className="text-[#2a4074] text-sm md:text-base text-center mb-2">
          {t('forgot_password_desc')}
        </p>

        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-[#2a4074] font-medium">{t('email_address')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('enter_email')}
              required
              className="h-12 md:h-14 px-4 md:px-5 rounded-xl border border-[#2a4074]/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2a4074] placeholder-[#2a4074]/40 text-black"
            />
          </div>

          {message && (
            <p className="text-green-600 text-sm text-center font-medium">{message}</p>
          )}
          
          {error && (
            <p className="text-[#811717] text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full md:w-auto px-8 h-12 md:h-14 bg-[#811717] text-white font-medium rounded-xl shadow hover:bg-[#a22222] transition self-center disabled:opacity-50"
          >
            {loading ? t('sending') : t('send_link')}
          </button>
        </form>

        <p className="text-[#2a4074]/60 text-sm mt-4 text-center">
          <span className="underline cursor-pointer hover:text-[#2a4074]" onClick={() => navigate("/connexion")}>{t('back_to_login')}</span>
        </p>

       </div>
    </div>
  );
}

