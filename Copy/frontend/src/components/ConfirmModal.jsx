import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, isDeleting = false }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDeleting ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            <AlertTriangle size={32} strokeWidth={2.5} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 mb-8">{message}</p>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 py-3 px-4 text-white font-semibold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 ${
                isDeleting 
                  ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-600/30' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30'
              }`}
            >
              Confirmer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
