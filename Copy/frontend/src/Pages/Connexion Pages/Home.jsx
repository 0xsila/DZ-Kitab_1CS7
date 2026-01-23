import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, CheckCircle, User } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      navigate("/"); // Redirect to login if no token
    } else if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center transform transition-all hover:scale-[1.02] duration-300">
        <div className="mx-auto w-20 h-20 bg-[#eef2ff] rounded-full flex items-center justify-center mb-6">
          <User size={40} className="text-[#2a4074]" />
        </div>
        
        <h1 className="text-4xl font-bold text-[#2a4074] mb-3 tracking-tight">
          {t('welcome_user', { name: user.first_name })}
        </h1>
        
        <p className="text-gray-500 mb-8 text-lg">
          {t('welcome_back_message')}
        </p>

        <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl mb-8 flex items-center justify-center gap-2">
          <CheckCircle size={20} />
          <span className="font-medium">{t('login_success_message')}</span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-[#811717] text-white px-6 py-3.5 rounded-xl hover:bg-[#a22222] transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-red-900/20"
        >
          <LogOut size={20} />
          {t('logout_btn')}
        </button>
      </div>
    </div>
  );
}
