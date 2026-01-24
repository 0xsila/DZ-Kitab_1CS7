import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Lecteurs from "../../assets/Lecteurs.svg";
import api from "../../api/axios";

export default function Otp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/inscription");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        otp
      });

      if (response.data.success) {
        navigate("/connexion");
      }
    } catch (err) {
      setError(err.response?.data?.message || t('otp_invalid'));
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
          {t('otp_sent_title')}
        </h1>

        <p className="text-[#2a4074] text-sm md:text-base text-center mb-2">
          {t('otp_sent_desc', { email })}
        </p>

        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-[#2a4074] font-medium">{t('otp_code')}</label>

            <input
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))} 
              placeholder={t('enter_otp')}
              required
              className="h-12 md:h-14 px-4 md:px-5 rounded-xl border border-[#2a4074]/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2a4074] placeholder-[#2a4074]/40 text-black"
            />
          </div>

          {error && (
            <p className="text-[#811717] text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-[150px] h-12 md:h-14 bg-[#811717] text-white font-medium rounded-xl shadow hover:bg-[#a22222] transition self-center disabled:opacity-50"
          >
            {loading ? t('verifying') : t('continue')}
          </button>
        </form>

       </div>
    </div>
  );
}

