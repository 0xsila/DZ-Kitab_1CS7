import { useTranslation } from 'react-i18next';

function VisitorSidebar({ activeTab, setActiveTab, user }) {
  const { t } = useTranslation();
  const menuItems = [
    { label: "Profil", display: t('profile') },
    { label: "Annonces", display: t('listings') },
  ]

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.svg";
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:3000${avatarPath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { year: 'numeric' }).format(date);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-6">
      <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-100">
        <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden mb-3">
          <img src={getAvatarUrl(user?.avatar)} alt="Profile" className="w-full h-full object-cover" />
        </div>
          <h2 className="text-lg font-bold text-gray-900">
            {user?.first_name} {user?.last_name}
          </h2>
          <p className="text-sm text-gray-500">{t('member_since')} {formatDate(user?.created_at)}</p>
          {user?.email && (
            <p className="text-xs text-gray-400 mt-1">{user.email}</p>
          )}
        </div>
      <nav className="space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(item.label)}
            className={`w-full flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 ease-in-out border-b border-blue-100 cursor-pointer ${
              activeTab === item.label
                ? "text-blue-900 font-bold bg-blue-100" 
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-900"
            }`}
          >
            <span>{item.display}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default VisitorSidebar
