import Logo from '../../components/Logo';

function ActivitySection() {
  const activities = [
    {
      title: "Annonces actives",
      value: "12",
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700",
      icon: <Logo className="w-8 h-8" />,
    },
    {
      title: "Livres vendus",
      value: "45",
      color: "bg-green-50 border-green-200",
      textColor: "text-green-700",
      icon: "✅",
    },
    {
      title: "Alertes favoris",
      value: "8",
      color: "bg-orange-50 border-orange-200",
      textColor: "text-orange-700",
      icon: "⭐",
    },
  ]

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Activité récente</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activities.map((activity, index) => (
          <div key={index} className={`${activity.color} border rounded-xl p-6 transition-transform hover:scale-105`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{activity.icon}</span>
              <span className={`text-3xl font-bold ${activity.textColor}`}>{activity.value}</span>
            </div>
            <h3 className={`font-semibold ${activity.textColor}`}>{activity.title}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivitySection
