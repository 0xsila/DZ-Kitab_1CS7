import Logo from '../../components/Logo';

export default function AboutUs() {
  return (
    <section id="about" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">À propos de DZ-Kitab</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            DZ-Kitab est une plateforme dédiée à la circulation des connaissances en Algérie. Notre mission est de
            rendre les livres accessibles à tous en favorisant l'échange et la réutilisation, tout en contribuant à la
            durabilité environnementale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center flex flex-col items-center">
            <div className="mb-4">
              <Logo className="w-16 h-16" />
            </div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Notre Mission</h3>
            <p className="text-gray-600">
              Créer une communauté de lecteurs passionnés où les livres circulent librement et les connaissances se
              partagent.
            </p>
          </div>

          <div className="text-center">
            <div className="text-5xl mb-4">🌍</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Notre Vision</h3>
            <p className="text-gray-600">
              Un avenir plus durable où chaque livre trouve un nouveau lecteur et contribue à réduire notre impact
              environnemental.
            </p>
          </div>

          <div className="text-center">
            <div className="text-5xl mb-4">💚</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Nos Valeurs</h3>
            <p className="text-gray-600">
              Transparence, durabilité, accessibilité et communauté. Nous croyons en la puissance du partage.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
