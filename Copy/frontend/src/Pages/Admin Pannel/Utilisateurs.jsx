import { useState, useEffect } from "react"
import { Search, Trash2, Users, LayoutDashboard, BookOpen, LogOut, Eye, ShieldCheck, Shield } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion"
import Logo from "../../components/Logo"
import api from "../../api/axios"
import ConfirmModal from "../../components/ConfirmModal"
import SuccessToast from "../../components/SuccessToast"
import userIcon from "../../assets/user.svg"

export default function Utilisateurs() {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const [promoteModalOpen, setPromoteModalOpen] = useState(false)
  const [promoteId, setPromoteId] = useState(null)
  
  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])


  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (id) => {
    setDeleteId(id)
    setDeleteModalOpen(true)
  }

  const confirmPromote = (id) => {
    setPromoteId(id)
    setPromoteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/admin/users/${deleteId}`)
      setUsers(users.filter(u => u.id !== deleteId))
      setDeleteModalOpen(false)
      setDeleteId(null)
      setToastMessage(t('user_deleted_success'))
      setShowToast(true)
    } catch (error) {
      console.error("Error deleting user:", error)
      alert(t('delete_error'))
    }
  }

  const handlePromote = async () => {
    if (!promoteId) return
    try {
      await api.put(`/admin/users/${promoteId}/role`, { role: 'admin' })
      setUsers(users.map(u => u.id === promoteId ? { ...u, role: 'admin' } : u))
      setPromoteModalOpen(false)
      setPromoteId(null)
      setToastMessage(t('user_promoted_success'))
      setShowToast(true)
    } catch (error) {
      console.error("Error promoting user:", error)
      alert(t('promote_error') || "Error promoting user") 
    }
  }

  // Filtrer les utilisateurs selon le terme recherché
  const filteredUsers = users.filter((u) =>
    (u.first_name + " " + u.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return userIcon;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:3000${avatarPath}`;
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
        title={t('delete_user_title')}
        message={t('delete_user_confirm')}
        isDeleting={true}
      />

      <ConfirmModal 
        isOpen={promoteModalOpen}
        onClose={() => { setPromoteModalOpen(false); setPromoteId(null); }}
        onConfirm={handlePromote}
        title={t('promote_user_title') || "Add Admin"}
        message={t('promote_user_confirm') || "Are you sure you want to add this user to admins ?"}
        isDeleting={false}
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
          <SidebarItem icon={<Users />} label={t('users')} to="/Utilisateurs" active />
          <SidebarItem icon={<BookOpen />} label={t('listings')} to="/Annonces" />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#EFF0F3]">
          <SidebarItem icon={<LogOut />} label={t('logout')} />
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col mt-10">
        {/* Header */}
        <h2 className="text-4xl font-medium text-[#2A4074] ml-6 mb-6">{t('users')}</h2>

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
              placeholder={t('search_user_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl overflow-x-auto max-w-7xl mx-auto shadow-2xl">
            <table className="w-full text-lg">
              <thead className="text-[#2A4074]">
                <tr>
                  <th className="p-4 text-left">{t('table_profile')}</th>
                  <th className="p-4 text-left">{t('activity')}</th>
                  <th className="p-4 text-left">{t('status')}</th>
                  <th className="p-4 text-right">{t('action')}</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-t border-[#2A4074]/10 hover:bg-neutral-50">
                    {/* Profil */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={getAvatarUrl(u.avatar)} 
                          className="w-12 h-12 rounded-md object-cover" 
                          alt="" 
                        />
                        <div>
                          <p className="font-medium text-[#2A4074]">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-neutral-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Activité */}
                    <td className="p-4 text-[#2A4074]">
                      {u.listings_count || 0} {t('listings')} | {u.sold_count || 0} {t('sold')}
                    </td>

                    {/* Statut */}
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-base font-medium border ${
                          u.role === "admin"
                            ? "border-[#811717] text-[#811717]"
                            : "border-[#3A783E] text-[#3A783E]"
                        }`}
                      >
                        {u.role === "admin" ? t('role_admin') : t('role_user')}
                        <span className="text-xs ml-1 text-gray-400">({u.role})</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => confirmPromote(u.id)}
                        className={`p-2 rounded-lg transition-all duration-300 group shadow-sm bg-white ${
                          u.role === 'admin' 
                            ? 'text-gray-300 cursor-not-allowed opacity-50' 
                            : 'text-blue-600 hover:bg-blue-600 hover:text-white'
                        }`}
                        title={t('promote_admin_title') || "Make Admin"}
                        disabled={u.role === 'admin'}
                        style={u.role === 'admin' ? { visibility: 'visible', opacity: 0.5 } : {}}
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </button>
                      
                      <button 
                        onClick={() => confirmDelete(u.id)}
                        className="p-2 rounded-lg transition-all duration-300 group bg-white text-red-500 hover:bg-red-500 hover:text-white shadow-sm"
                        title={t('delete_user_title')}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-neutral-500">
                      {t('no_users_found')}
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
