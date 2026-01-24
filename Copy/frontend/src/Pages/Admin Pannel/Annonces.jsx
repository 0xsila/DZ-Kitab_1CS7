import { useState, useEffect } from "react"
import { Search, Trash2, Users, LayoutDashboard, BookOpen, LogOut } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion"
import Logo from "../../components/Logo"
import api from "../../api/axios"
import ConfirmModal from "../../components/ConfirmModal"
import SuccessToast from "../../components/SuccessToast"
import DefaultBook from "../../assets/book.svg"

export default function Annonces() {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const response = await api.get('/admin/listings')
      setAnnonces(response.data.data)
    } catch (error) {
      console.error("Error fetching listings:", error)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (id) => {
    setDeleteId(id)
    setDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/admin/listings/${deleteId}`)
      setAnnonces(annonces.filter(a => a.id !== deleteId))
      setDeleteModalOpen(false)
      setDeleteId(null)
      setToastMessage(t('listing_deleted_success'))
      setShowToast(true)
    } catch (error) {
      console.error("Error deleting listing:", error)
      alert(t('delete_error'))
    }
  }

  // Filtrer les annonces selon le terme recherché
  const filteredAnnonces = annonces.filter((a) =>
    a.book_title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageUrl = (photos) => {
    if (!photos) return DefaultBook;
    try {
      const parsed = typeof photos === 'string' ? JSON.parse(photos) : photos;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const path = parsed[0];
        if (path.startsWith('http')) return path;
        return `http://localhost:3000${path}`;
      }
    } catch (e) {
      return DefaultBook;
    }
    return DefaultBook;
  };

  return (
    <div className="min-h-screen bg-[#EDEEF2] flex">
      <SuccessToast 
        show={showToast} 
        message={toastMessage} 
        onClose={() => setShowToast(false)} 
      />
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteId(null); }}
        onConfirm={handleDelete}
        title={t('delete_listing_title')}
        message={t('delete_listing_confirm')}
        isDeleting={true}
      />

      {/* ================= SIDEBAR ================= */}
      <aside className="hidden lg:flex w-64 bg-white shadow-xl flex-col mt-10 mb-10 rounded-xl">
        {/* Logo */}
        <Link to="/" className="h-30 flex items-center justify-center gap-3 mt-4 hover:opacity-80 transition-opacity">
          <Logo className="h-10 w-10" />
          <span className="text-2xl font-bold text-[#2A4074]">DZ-KITAB</span>
        </Link>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-3">
          <SidebarItem icon={<LayoutDashboard />} label={t('dashboard')} to="/Dashboard" />
          <SidebarItem icon={<Users />} label={t('users')} to="/Utilisateurs" />
          <SidebarItem icon={<BookOpen />} label={t('listings')} to="/Annonces" active />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#EFF0F3]">
          <SidebarItem icon={<LogOut />} label={t('logout')} />
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col mt-10">
        {/* Header */}
        <h2 className="text-4xl font-medium text-[#2A4074] ml-6 mb-6">{t('listings')}</h2>

        {/* Content */}
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 p-6 space-y-6"
        >
          {/* Search */}
          <div className="flex items-center gap-3 bg-white border border-[#2A4074]/30 rounded-lg px-4 py-3 shadow-2xl w-full max-w-5xl mx-auto hover:border-[#2A4074] focus-within:ring-2 focus-within:ring-[#2A4074]/20 transition-all duration-300">
            <Search className="w-5 h-5 text-[#2A4074]/60" />
            <input
              type="text"
              className="flex-1 outline-none text-base text-[#2A4074]"
              placeholder={t('search_listing_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl overflow-x-auto max-w-7xl mx-auto shadow-2xl">
            <table className="w-full text-lg">
              <thead className="text-[#2A4074]">
                <tr>
                  <th className="p-4 text-left">{t('book')}</th>
                  <th className="p-4 text-left">{t('seller')}</th>
                  <th className="p-4 text-left">{t('price')}</th>
                  <th className="p-4 text-left">{t('date')}</th>
                  <th className="p-4 text-right">{t('action')}</th>
                </tr>
              </thead>

              <tbody>
                {filteredAnnonces.map((a) => (
                  <tr key={a.id} className="border-t border-[#2A4074]/10 hover:bg-neutral-50">
                    {/* Livre */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={getImageUrl(a.photos)} 
                          alt="" 
                          className="w-14 h-16 rounded-md shadow object-cover" 
                        />
                        <p className="font-medium text-[#2A4074] max-w-xs">{a.book_title}</p>
                      </div>
                    </td>

                    {/* Vendeur */}
                    <td className="p-4 text-[#2A4074]">{a.seller_first_name} {a.seller_last_name}</td>

                    {/* Prix */}
                    <td className="p-4 font-medium text-[#3A783E]">{a.price} {t('currency')}</td>

                    {/* Date */}
                    <td className="p-4 text-[#2A4074]/60">{formatDate(a.created_at)}</td>

                    {/* Action */}
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => confirmDelete(a.id)}
                        className="p-2 rounded-lg transition-all duration-300 group bg-white text-red-500 hover:bg-red-500 hover:text-white shadow-sm"
                        title={t('delete_listing_title')}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAnnonces.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-neutral-500">
                      {t('no_listings_found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.main>
      </div>
    </div>
  )
}

/* ================= COMPONENT ================= */

function SidebarItem({ icon, label, active, to }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(to)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        active ? "bg-[#2A4074]/10 text-[#2A4074]" : "text-[#2A4074] hover:bg-[#2A4074]/5"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  )
}
