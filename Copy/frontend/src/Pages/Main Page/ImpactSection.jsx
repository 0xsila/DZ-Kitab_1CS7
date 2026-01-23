import { useTranslation } from 'react-i18next';

export default function ImpactSection() {
  const { t } = useTranslation();
  const stats = [
    {
      icon: '🌳',
      number: '2kg',
      unit: t('wood_saved'),
    },
    {
      icon: '💧',
      number: '100',
      unit: t('water_saved'),
    },
    {
      icon: '🌍',
      number: '2.1',
      unit: t('co2_saved'),
    },
  ]

  return (
    <section id="impact" className="py-32 md:py-48 bg-gradient-to-b from-stone-100 to-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-28">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8">
            {t('impact_title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-semibold">{t('impact_subtitle')}</p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-16 md:gap-40 mb-20">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-8xl md:text-9xl mb-8">{stat.icon}</div>
              <div className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">{stat.number}</div>
              <p className="text-gray-600 text-lg md:text-xl">{stat.unit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
