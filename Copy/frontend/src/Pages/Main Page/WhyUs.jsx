import { useTranslation } from 'react-i18next';

export default function WhyUs() {
  const { t } = useTranslation();
  const benefits = [
    {
      icon: '⚡',
      title: t('secure_contact'),
      description: t('secure_contact_desc'),
      titleColor: 'text-blue-900',
      iconBg: 'bg-blue-100',
    },
    {
      icon: '💰',
      title: t('fair_prices'),
      description: t('fair_prices_desc'),
      titleColor: 'text-amber-800',
      iconBg: 'bg-amber-100',
    },
    {
      icon: '♻️',
      title: t('circular_library'),
      description: t('circular_library_desc'),
      titleColor: 'text-green-700',
      iconBg: 'bg-green-100',
    },
    {
      icon: '⚡',
      title: t('fast_simple'),
      description: t('fast_simple_desc'),
      titleColor: 'text-red-700',
      iconBg: 'bg-red-100',
    },
  ]

  return (
    <section id="whyus" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">{t('why_us')}</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-amber-50 rounded-3xl p-10 text-center shadow-lg transition-all duration-300">
              <div
                className={`${benefit.iconBg} w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6`}
              >
                {benefit.icon}
              </div>
              <h3 className={`text-base font-bold mb-4 ${benefit.titleColor} uppercase tracking-wide`}>
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
