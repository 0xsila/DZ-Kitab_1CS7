import { useEffect } from 'react';

export default function SuccessToast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-24 right-6 z-[9999]">
      <div className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 animate-fade-in-up">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="font-semibold text-base">{message}</span>
      </div>
    </div>
  );
}

// Add this to your global CSS or Tailwind config:
// .animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both; }
// @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
