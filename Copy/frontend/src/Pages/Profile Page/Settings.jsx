import { useState, useEffect, useRef } from "react"
import { Check, AlertCircle, Eye, EyeOff } from "lucide-react"
import api from "../../api/axios"
import { useTranslation } from 'react-i18next';

function Settings({ user, setUser }) {
  const { t } = useTranslation();
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    bio: "",
    show_phone: true
  })
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  })
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "", 
        show_phone: user.show_phone !== undefined ? (user.show_phone === 1 || user.show_phone === true) : true
      })
    }
  }, [user])

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.svg";
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:3000${avatarPath}`;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const updatedUser = { ...user, avatar: response.data.data.avatar };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setShowPhotoModal(false);
        setMessage({ type: "success", text: t('profile_photo_updated') });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setMessage({ type: "error", text: t('error_uploading_photo') });
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value })
  }

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const preventCopyPaste = (e) => {
    e.preventDefault();
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMessage({ type: "", text: "" })
    
    try {
      // Update profile
      const profileResponse = await api.put('/users/profile', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        bio: formData.bio,
        show_phone: formData.show_phone
      })
      
      if (profileResponse.data.success) {
        const updatedUser = profileResponse.data.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setMessage({ type: "success", text: t('profile_updated') })
      }

      // Update password if provided
      if (passwords.new_password) {
        if (passwords.new_password !== passwords.confirm_password) {
          setMessage({ type: "error", text: t('passwords_mismatch') })
          return
        }
        if (!passwords.current_password) {
           setMessage({ type: "error", text: t('enter_current_password') })
           return
        }
        
        await api.put('/users/change-password', {
          current_password: passwords.current_password,
          new_password: passwords.new_password
        })
        setMessage({ type: "success", text: t('info_password_updated') })
        setPasswords({ current_password: "", new_password: "", confirm_password: "" })
      }
    } catch (error) {
      console.error(error)
      const errorMessage = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || t('error_generic');
      setMessage({ type: "error", text: errorMessage })
    }
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">{t('settings_title')}</h1>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <form className="space-y-8" onSubmit={handleSubmit}>
          
          {/* Photo de profil */}
          <div className="flex flex-col items-center pb-8 border-b border-gray-100">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img src={getAvatarUrl(user?.avatar)} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button 
                type="button" 
                onClick={() => setShowPhotoModal(true)}
                className="absolute bottom-0 right-0 bg-blue-900 text-white p-2 rounded-full shadow-md hover:bg-white hover:text-blue-900 border-2 border-blue-900 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Informations personnelles */}
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-6">{t('personal_info_title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('lastname')}</label>
                <input 
                  type="text" 
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('firstname')}</label>
                <input 
                  type="text" 
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('bio')} <span className="text-gray-400 font-normal">{t('bio_optional')}</span></label>
                <textarea 
                  rows="3"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder={t('enter_bio')} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Coordonnées et Sécurité */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-blue-900 mb-6">{t('contact_security_title')}</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('phone')}</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
                <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-xl transition-colors">
                  <span className="text-sm font-medium text-gray-900">{t('show_phone_on_listings')}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="show_phone"
                      checked={formData.show_phone}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('current_password_label')}</label>
                  <div className="relative">
                    <input 
                      type={showPassword.current ? "text" : "password"} 
                      name="current_password"
                      value={passwords.current_password}
                      onChange={handlePasswordChange}
                      onCopy={preventCopyPaste}
                      onPaste={preventCopyPaste}
                      onCut={preventCopyPaste}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('new_password')}</label>
                  <div className="relative">
                    <input 
                      type={showPassword.new ? "text" : "password"} 
                      name="new_password"
                      value={passwords.new_password}
                      onChange={handlePasswordChange}
                      onCopy={preventCopyPaste}
                      onPaste={preventCopyPaste}
                      onCut={preventCopyPaste}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('confirm_password_label')}</label>
                  <div className="relative">
                    <input 
                      type={showPassword.confirm ? "text" : "password"} 
                      name="confirm_password"
                      value={passwords.confirm_password}
                      onChange={handlePasswordChange}
                      onCopy={preventCopyPaste}
                      onPaste={preventCopyPaste}
                      onCut={preventCopyPaste}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-100">
            <button type="button" className="px-6 py-3 text-gray-600 font-medium hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300">
              {t('cancel')}
            </button>
            <button type="submit" className="px-8 py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-blue-900/20">
              {t('save_changes')}
            </button>
          </div>

        </form>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{t('edit_photo_title')}</h3>
              <button 
                onClick={() => setShowPhotoModal(false)}
                className="text-gray-400 hover:text-red-500 transition-all duration-300 hover:rotate-90 rounded-full p-1 hover:bg-red-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group hover:scale-[1.02] hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="block font-bold text-gray-900">{t('browse_files')}</span>
                  <span className="text-sm text-gray-500">{t('choose_photo_device')}</span>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all duration-300 group hover:scale-[1.02] hover:shadow-md">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="block font-bold text-gray-900">{t('remove_photo')}</span>
                  <span className="text-sm text-gray-500">{t('remove_photo_desc')}</span>
                </div>
              </button>
            </div>
            <div className="p-4 bg-gray-50 text-center">
              <button 
                onClick={() => setShowPhotoModal(false)}
                className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
