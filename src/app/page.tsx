import NapoleonChat from '@/components/NapoleonChat'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* French Empire Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-6xl">⚜️</div>
        <div className="absolute top-32 right-20 text-4xl">👑</div>
        <div className="absolute bottom-20 left-20 text-5xl">🦅</div>
        <div className="absolute bottom-40 right-10 text-3xl">⚔️</div>
        <div className="absolute top-1/2 left-1/3 text-4xl">🏛️</div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-6 shadow-2xl border-4 border-yellow-300">
            <span className="text-3xl">👑</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Chat met Napoleon Bonaparte
          </h1>
          
          <p className="text-xl text-blue-100 font-medium mb-2">
            Een interactieve geschiedenisles voor Havo 5
          </p>
          
          <p className="text-blue-200 max-w-2xl mx-auto">
            Stel vragen aan de Franse keizer over zijn leven, veldslagen, politiek en de tijd waarin hij leefde. 
            Napoleon antwoordt vanuit zijn eigen perspectief!
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-3xl mb-3">⚔️</div>
            <h3 className="text-white font-semibold mb-2">Militaire Strategie</h3>
            <p className="text-blue-100 text-sm">
              Vraag over zijn beroemde veldslagen, tactieken en militaire hervormingen
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-3xl mb-3">⚖️</div>
            <h3 className="text-white font-semibold mb-2">Code Napoleon</h3>
            <p className="text-blue-100 text-sm">
              Ontdek zijn juridische hervormingen en bestuurlijke innovaties
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-3xl mb-3">🌍</div>
            <h3 className="text-white font-semibold mb-2">Europese Politiek</h3>
            <p className="text-blue-100 text-sm">
              Leer over zijn invloed op Europa en de gevolgen van zijn heerschappij
            </p>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <NapoleonChat />
        </div>

        {/* Educational Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-3xl mx-auto">
            <h3 className="text-white font-semibold mb-3 flex items-center justify-center">
              <span className="mr-2">📚</span>
              Educatieve Doelen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100 text-sm">
              <div>
                <strong>Historisch Inzicht:</strong> Begrijp de complexiteit van Napoleon als historische figuur
              </div>
              <div>
                <strong>Kritisch Denken:</strong> Analyseer verschillende perspectieven op historische gebeurtenissen
              </div>
              <div>
                <strong>Contextualisering:</strong> Plaats Napoleon in de bredere context van de 18e/19e eeuw
              </div>
              <div>
                <strong>Bronnenonderzoek:</strong> Leer historische claims te evalueren en te verifiëren
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}