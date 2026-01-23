import { useState, useEffect } from "react"
import {
  Users,
  LayoutDashboard,
  BookOpen,
  LogOut,
} from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion"
import Logo from "../../components/Logo"
import userIcon from "../../assets/user.svg"
import bookIcon from "../../assets/book.svg"
import annonceIcon from "../../assets/annonce.svg"
import api from "../../api/axios"

// Chart.js
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    users: 0,
    listings: 0,
    sold: 0
  })
  const [graphData, setGraphData] = useState({
    users: [],
    listings: []
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats')
        setStats(response.data.data)
        
        // Fetch graph data
        const graphResponse = await api.get('/admin/stats/history')
        setGraphData(graphResponse.data.data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }
    fetchStats()
  }, [])

  const userChartData = {
    labels: graphData.users.map(d => d.date),
    datasets: [
      {
        label: t('registrations'),
        data: graphData.users.map(d => d.count),
        borderColor: '#2A4074',
        backgroundColor: 'rgba(42, 64, 116, 0.5)',
        tension: 0.4,
      },
    ],
  }

  const listingChartData = {
    labels: graphData.listings.map(d => d.date),
    datasets: [
      {
        label: t('new_listings'),
        data: graphData.listings.map(d => d.count),
        borderColor: '#3A783E',
        backgroundColor: 'rgba(58, 120, 62, 0.5)',
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#EDEEF2] flex">
      {/* ================= SIDEBAR ================= */}
      <aside className="hidden lg:flex w-64 bg-white shadow-xl flex-col mt-10 mb-10 rounded-xl">
        {/* Logo */}
        <Link to="/" className="h-30 flex items-center justify-center gap-3 mt-4 hover:opacity-80 transition-opacity">
          <Logo className="h-10 w-10" />
          <span className="text-2xl font-bold text-[#2A4074]">DZ-KITAB</span>
        </Link>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-3 ">
  <SidebarItem icon={<LayoutDashboard />} label={t('dashboard')} to="/Dashboard" active />
  <SidebarItem icon={<Users />} label={t('users')} to="/Utilisateurs" />
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
        <h2 className="text-4xl font-medium text-[#2A4074] ml-6 mb-6">
          {t('dashboard')}
        </h2>

        {/* ================= CONTENT ================= */}
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 p-6 space-y-8"
        >
          {/* ===== STATS ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <StatCard
              title={t('total_users')}
              value={stats.users}
              icon={userIcon}
              titleColor="text-[#2A4074]"
              valueColor="text-[#2A4074]"
            />
            <StatCard
              title={t('active_listings')}
              value={stats.listings}
              icon={annonceIcon}
              titleColor="text-[#3A783E]"
              valueColor="text-[#3A783E]"
            />
            <StatCard
              title={t('books_sold')}
              value={stats.sold}
              icon={bookIcon}
              titleColor="text-[#811717]"
              valueColor="text-[#811717]"
            />
          </div>

          {/* ===== GRAPHS ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graph 1 */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-[#2A4074] mb-4">{t('registrations')}</h3>
              <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
                <Line options={chartOptions} data={userChartData} />
              </div>
            </div>

            {/* Graph 2 */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-[#2A4074] mb-4">{t('new_listings')}</h3>
              <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
                <Line options={chartOptions} data={listingChartData} />
              </div>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, icon, titleColor, valueColor }) {
  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 flex items-center gap-4">
      <div className="p-3 bg-neutral-50 rounded-lg">
        <img src={icon} alt="" className="w-8 h-8" />
      </div>
      <div>
        <p className={`text-sm font-medium ${titleColor}`}>{title}</p>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, active, to }) {
  const navigate = useNavigate()
  
  return (
    <button
      onClick={() => navigate(to)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition
        ${active ? "bg-[#2A4074]/10 text-[#2A4074]" : "text-[#2A4074] hover:bg-[#2A4074]/5"}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  )
}



