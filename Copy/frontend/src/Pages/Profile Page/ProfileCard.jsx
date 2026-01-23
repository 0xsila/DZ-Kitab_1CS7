import { useTranslation } from 'react-i18next';

function ProfileCard({ user, onRate, ratingStats }) {
  const { t, i18n } = useTranslation();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-DZ' : 'fr-FR', { month: 'long', year: 'numeric' }).format(date);
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.svg";
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:3000${avatarPath}`;
  };

  const average = Number(ratingStats?.average) || 0;
  const count = ratingStats?.count || 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-10 mb-8 max-w-3xl mx-auto flex flex-col items-center text-center relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-transparent opacity-50 pointer-events-none"></div>

      {/* Avatar */}
      <div className="relative z-10 mb-6">
        <div className="w-36 h-36 rounded-full p-1 bg-white shadow-md border border-gray-100">
          <img 
            src={getAvatarUrl(user?.avatar)} 
            alt={`${user?.first_name} ${user?.last_name}`} 
            className="w-full h-full object-cover rounded-full" 
          />
        </div>
      </div>

      {/* User Info */}
      <div className="relative z-10 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {user?.first_name} {user?.last_name}
        </h1>
        <p className="text-gray-500 font-medium mb-2">{t('member_since')} {formatDate(user?.created_at)}</p>
        {user?.bio && (
          <p className="text-gray-600 italic mb-6 max-w-lg mx-auto">{user.bio}</p>
        )}

        {/* Rating */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center gap-1 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`w-6 h-6 ${star <= Math.round(average) ? "text-blue-900" : "text-gray-300"} fill-current`} viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-900 font-bold ml-2">{average.toFixed(1)}/5</span>
            <span className="text-gray-400 text-sm ml-1 border-l border-gray-300 pl-2">{count} {t('reviews')}</span>
          </div>
          
          {onRate && (
            <button
              onClick={onRate}
              className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-6 py-2 rounded-lg font-semibold shadow-md transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5 fill-blue-900" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              {t('rate')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileCard

