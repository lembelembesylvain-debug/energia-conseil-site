function App() {  
  return (  
    <div className="min-h-screen bg-white">  
      {/* Header */}  
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white py-6 sticky top-0 z-50 shadow-lg">  
        <div className="container mx-auto px-4 flex justify-between items-center">  
          <div className="text-2xl font-bold">⚡ Energia-Conseil IA</div>  
          <nav className="hidden md:flex space-x-6">  
            <a href="#audit" className="hover:text-green-200 transition">Audit IA</a>  
            <a href="#avantages" className="hover:text-green-200 transition">Avantages</a>  
            <a href="#process" className="hover:text-green-200 transition">Comment ça marche</a>  
            <a href="#prix" className="hover:text-green-200 transition">Prix</a>  
          </nav>  
          <a href=<a href="https://buy.stripe.com/7sY9ATfmA5AK4Ltgpu3ZK00" target="_blank" rel="noopener noreferrer" className="bg-white text-green-600 px-6 py-2 rounded-full font-bold hover:bg-green-50 transition">  
            Commander  
          </a>  
        </div>  
      </header>  
  
      {/* Hero Section */}  
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">  
        <div className="container mx-auto px-4 text-center">  
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">  
            🤖 Audit Énergétique par Intelligence Artificielle  
          </h1>  
          <p className="text-2xl text-gray-700 mb-8">  
            Votre Diagnostic Complet en 48h  
          </p>  
          <div className="flex flex-wrap justify-center gap-6 mb-10">  
            <div className="bg-white px-6 py-3 rounded-lg shadow-md">  
              <span className="text-green-600 font-bold">✓ Précision 95%</span>  
            </div>  
            <div className="bg-white px-6 py-3 rounded-lg shadow-md">  
              <span className="text-green-600 font-bold">✓ Résultats en 48h</span>  
            </div>  
            <div className="bg-white px-6 py-3 rounded-lg shadow-md">  
              <span className="text-green-600 font-bold">✓ 199€ seulement</span>  
            </div>  
          </div>  
          <a href="#commander" className="inline-block bg-green-600 text-white px-10 py-4 rounded-full text-xl font-bold hover:bg-green-700 transform hover:scale-105 transition shadow-lg">  
            COMMANDER MON AUDIT IA - 199€  
          </a>  
          <div className="mt-6 space-y-2">  
            <p className="text-gray-600">✅ Remboursé si vous faites les travaux</p>  
            <p className="text-gray-600">✅ Satisfait ou remboursé 30 jours</p>  
            <p className="text-gray-600">✅ Certifié ANAH - Éligible MaPrimeRénov'</p>  
          </div>  
        </div>  
      </section>  

      {/* Problèmes Section */}  
      <section className="py-20 bg-gray-50">  
        <div className="container mx-auto px-4">  
          <h2 className="text-4xl font-bold text-center mb-12">  
            Vous en avez assez des audits énergétiques classiques ?  
          </h2>  
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">  
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">  
              <div className="text-3xl mb-3">😤</div>  
              <h3 className="font-bold text-xl mb-2">Attendre 4 à 6 semaines</h3>  
              <p className="text-gray-600">Pour obtenir un rendez-vous</p>  
            </div>  
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">  
              <div className="text-3xl mb-3">💸</div>  
              <h3 className="font-bold text-xl mb-2">Payer 800 à 1 500€</h3>  
              <p className="text-gray-600">Pour un diagnostic</p>  
            </div>  
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">  
              <div className="text-3xl mb-3">⏰</div>  
              <h3 className="font-bold text-xl mb-2">Bloquer 3-4 heures</h3>  
              <p className="text-gray-600">De votre journée pour la visite</p>  
            </div>  
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">  
              <div className="text-3xl mb-3">🎲</div>  
              <h3 className="font-bold text-xl mb-2">Obtenir des résultats variables</h3>  
              <p className="text-gray-600">Selon le diagnostiqueur</p>  
            </div>  
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">  
              <div className="text-3xl mb-3">📄</div>  
              <h3 className="font-bold text-xl mb-2">Recevoir un rapport de 80 pages</h3>  
              <p className="text-gray-600">Incompréhensible</p>  
            </div>  
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">  
              <div className="text-3xl mb-3">✨</div>  
              <h3 className="font-bold text-xl mb-2">Il existe une meilleure solution</h3>  
              <p className="font-bold text-green-600 text-lg">L'audit énergétique du 21ème siècle est là.</p>  
            </div>  
          </div>  
        </div>  
      </section>  
  
      {/* Avantages IA Section */}  
      <section id="avantages" className="py-20 bg-white">  
        <div className="container mx-auto px-4">  
          <h2 className="text-4xl font-bold text-center mb-12">  
            L'Intelligence Artificielle révolutionne l'audit énergétique  
          </h2>  
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">  
            <div className="bg-green-50 p-6 rounded-lg text-center">  
              <div className="text-4xl mb-4">⚡</div>  
              <h3 className="font-bold text-xl mb-2">Résultats en 48h</h3>  
              <p className="text-gray-600">vs 4-6 semaines</p>  
            </div>  
            <div className="bg-green-50 p-6 rounded-lg text-center">  
              <div className="text-4xl mb-4">💰</div>  
              <h3 className="font-bold text-xl mb-2">Prix : 199€</h3>  
              <p className="text-gray-600">vs 800-1 500€</p>  
            </div>  
            <div className="bg-green-50 p-6 rounded-lg text-center">  
              <div className="text-4xl mb-4">🏠</div>  
              <h3 className="font-bold text-xl mb-2">100% à distance</h3>  
              <p className="text-gray-600">vs visite physique obligatoire</p>  
            </div>  
            <div className="bg-green-50 p-6 rounded-lg text-center">  
              <div className="text-4xl mb-4">🎯</div>  
              <h3 className="font-bold text-xl mb-2">Précision 95%</h3>  
              <p className="text-gray-600">Algorithmes entraînés sur 100 000+ cas</p>  
            </div>  
            <div className="bg-green-50 p-6 rounded-lg text-center">  
              <div className="text-4xl mb-4">🤝</div>  
              <h3 className="font-bold text-xl mb-2">Objectivité totale</h3>  
              <p className="text-gray-600">Pas de biais humain</p>  
            </div>  
            <div className="bg-green-50 p-6 rounded-lg text-center">  
              <div className="text-4xl mb-4">📊</div>  
              <h3 className="font-bold text-xl mb-2">3-5 scénarios optimisés</h3>  
              <p className="text-gray-600">vs 1-2 recommandations standards</p>  
            </div>  
            <div className="bg-green-50 p-6 rounded-lg text-center">  
              <div className="text-4xl mb-4">💸</div>  
              <h3 className="font-bold text-xl mb-2">Aides calculées au centime</h3>  
              <p className="text-gray-600">Maximisation automatique</p>  
            </div>  
            <div className="bg-green-50 p-6 rounded-lg text-center">  
              <div className="text-4xl mb-4">🔧</div>  
              <h3 className="font-bold text-xl mb-2">Technologie 21ème siècle</h3>  
              <p className="text-gray-600">L'audit énergétique réinventé</p>  
            </div>  
          </div>  
        </div>  
      </section>  
 
      {/* Comparatif Section */}  
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">  
        <div className="container mx-auto px-4">  
          <h2 className="text-4xl font-bold text-center mb-16">  
            Audit Traditionnel vs Audit IA  
          </h2>  
            
          <div className="max-w-5xl mx-auto">  
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">  
              <div className="grid grid-cols-3 gap-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6">  
                <div className="text-center font-bold text-xl">Critère</div>  
                <div className="text-center font-bold text-xl">Audit Traditionnel</div>  
                <div className="text-center font-bold text-xl">Audit IA ⚡</div>  
              </div>  
                
              <div className="grid grid-cols-3 gap-0 border-b border-gray-200 p-6 hover:bg-gray-50 transition">  
                <div className="flex items-center">  
                  <span className="text-3xl mr-3">💰</span>  
                  <span className="font-semibold">Prix</span>  
                </div>  
                <div className="text-center text-red-600 font-bold text-xl">800-1 500€</div>  
                <div className="text-center text-green-600 font-bold text-2xl">199€</div>  
              </div>  
                
              <div className="grid grid-cols-3 gap-0 border-b border-gray-200 p-6 hover:bg-gray-50 transition">  
                <div className="flex items-center">  
                  <span className="text-3xl mr-3">⏱️</span>  
                  <span className="font-semibold">Délai</span>  
                </div>  
                <div className="text-center text-gray-700">4-6 semaines</div>  
                <div className="text-center text-green-600 font-bold">48h</div>  
              </div>  
                
              <div className="grid grid-cols-3 gap-0 border-b border-gray-200 p-6 hover:bg-gray-50 transition">  
                <div className="flex items-center">  
                  <span className="text-3xl mr-3">🏠</span>  
                  <span className="font-semibold">Visite physique</span>  
                </div>  
                <div className="text-center text-gray-700">Obligatoire (3-4h)</div>  
                <div className="text-center text-green-600 font-bold">100% en ligne</div>  
              </div>  
                
              <div className="grid grid-cols-3 gap-0 border-b border-gray-200 p-6 hover:bg-gray-50 transition">  
                <div className="flex items-center">  
                  <span className="text-3xl mr-3">🎯</span>  
                  <span className="font-semibold">Précision</span>  
                </div>  
                <div className="text-center text-gray-700">Variable (humain)</div>  
                <div className="text-center text-green-600 font-bold">95% (algorithmes)</div>  
              </div>  
                
              <div className="grid grid-cols-3 gap-0 border-b border-gray-200 p-6 hover:bg-gray-50 transition">  
                <div className="flex items-center">  
                  <span className="text-3xl mr-3">📊</span>  
                  <span className="font-semibold">Scénarios</span>  
                </div>  
                <div className="text-center text-gray-700">1-2 recommandations</div>  
                <div className="text-center text-green-600 font-bold">3-5 scénarios optimisés</div>  
              </div>  
                
              <div className="grid grid-cols-3 gap-0 p-6 hover:bg-gray-50 transition">  
                <div className="flex items-center">  
                  <span className="text-3xl mr-3">✅</span>  
                  <span className="font-semibold">Certification ANAH</span>  
                </div>  
                <div className="text-center text-green-600 font-bold">✓</div>  
                <div className="text-center text-green-600 font-bold">✓</div>  
              </div>  
            </div>  
              
            <div className="mt-12 text-center">  
              <div className="inline-block bg-green-50 border-2 border-green-500 rounded-2xl p-8">  
                <p className="text-2xl font-bold text-green-600 mb-2">  
                  ⚡ Économisez 1 300€ et 5 semaines  
                </p>  
                <p className="text-gray-700">  
                  Sans compromis sur la qualité ou la certification  
                </p>  
              </div>  
            </div>  
          </div>  
        </div>  
      </section>  
 
      {/* Process Section */}  
      <section id="process" className="py-20 bg-gradient-to-br from-blue-50 to-green-50">  
        <div className="container mx-auto px-4">  
          <h2 className="text-4xl font-bold text-center mb-16">Comment ça marche ? 4 étapes simples</h2>  
          <div className="max-w-4xl mx-auto space-y-8">  
            <div className="flex items-start gap-6 bg-white p-8 rounded-lg shadow-lg">  
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">  
                1  
              </div>  
              <div>  
                <h3 className="text-2xl font-bold mb-3">VOUS UPLOADEZ (30 minutes)</h3>  
                <p className="font-semibold text-green-600 mb-2">📱 Prenez des photos de votre logement avec votre smartphone</p>  
                <ul className="space-y-2 text-gray-700">  
                  <li>✓ Guidage complet : L'application vous guide à chaque étape</li>  
                  <li>✓ Uploadez vos factures d'énergie et documents</li>  
                  <li>✓ Répondez à un questionnaire simple</li>  
                </ul>  
              </div>  
            </div>  
 
            <div className="flex items-start gap-6 bg-white p-8 rounded-lg shadow-lg">  
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">  
                2  
              </div>  
              <div>  
                <h3 className="text-2xl font-bold mb-3">L'IA ANALYSE (24-48h)</h3>  
                <p className="font-semibold text-green-600 mb-2">🤖 Traitement automatique de vos données</p>  
                <ul className="space-y-2 text-gray-700">  
                  <li>✓ Modélisation thermique 3D de votre logement</li>  
                  <li>✓ Calcul précis des déperditions énergétiques</li>  
                  <li>✓ Simulation de dizaines de scénarios de travaux</li>  
                  <li>✓ Optimisation multi-critères (coût, performance, ROI, confort)</li>  
                  <li className="font-bold text-green-600">300+ paramètres analysés simultanément</li>  
                </ul>  
              </div>  
            </div>  
  
            <div className="flex items-start gap-6 bg-white p-8 rounded-lg shadow-lg">  
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">  
                3  
              </div>  
              <div>  
                <h3 className="text-2xl font-bold mb-3">VOUS RECEVEZ LE RAPPORT</h3>  
                <p className="font-semibold text-green-600 mb-2">📊 Rapport PDF interactif (40-60 pages)</p>  
                <ul className="space-y-2 text-gray-700">  
                  <li>✓ 3-5 scénarios de rénovation personnalisés</li>  
                  <li>✓ Aides financières calculées au centime près</li>  
                  <li>✓ ROI détaillé pour chaque scénario</li>  
                  <li>✓ Planning et budget recommandés</li>  
                  <li className="font-bold text-green-600">Tout est clair, chiffré, actionnable</li>  
                </ul>  
              </div>  
            </div>  
  
            <div className="flex items-start gap-6 bg-white p-8 rounded-lg shadow-lg">  
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">  
                4  
              </div>  
              <div>  
                <h3 className="text-2xl font-bold mb-3">NOUS VOUS ACCOMPAGNONS</h3>  
                <p className="font-semibold text-green-600 mb-2">👨‍💼 Vous n'êtes jamais seul</p>  
                <ul className="space-y-2 text-gray-700">  
                  <li>✓ Visio explicative 30 min offerte</li>  
                  <li>✓ Mise en relation avec artisans RGE de votre région</li>  
                  <li>✓ Aide au montage des dossiers d'aides</li>  
                  <li>✓ Support illimité pendant votre projet</li>  
                </ul>  
              </div>  
            </div>  
          </div>  
        </div>  
      </section>  
  
      {/* Témoignages Section */}  
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">  
        <div className="container mx-auto px-4">  
          <h2 className="text-4xl font-bold text-center mb-4">  
            💬 Ils ont testé l'audit IA  
          </h2>  
          <p className="text-center text-xl text-gray-600 mb-16">  
            Plus de 500 propriétaires satisfaits  
          </p>  
            
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">  
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">  
              <div className="flex items-center mb-4">  
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-3xl mr-4">  
                  👩‍💼  
                </div>  
                <div>  
                  <h4 className="font-bold text-lg">Sophie D.</h4>  
                  <p className="text-gray-600 text-sm">Lyon (69)</p>  
                </div>  
              </div>  
              <div className="text-yellow-500 text-xl mb-3">⭐⭐⭐⭐⭐</div>  
              <p className="text-gray-700 italic mb-4">  
                "Grâce à l'audit IA, j'ai économisé 4 200€ sur mon projet. Le rapport était ultra-précis et j'ai touché 38 000€ d'aides au lieu des 34 000€ annoncés par mon premier diagnostiqueur."  
              </p>  
              <div className="bg-green-50 p-3 rounded-lg">  
                <p className="text-sm text-green-700 font-semibold">  
                  ✓ Maison 120m² • DPE F → B  
                </p>  
              </div>  
            </div>  
              
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">  
              <div className="flex items-center mb-4">  
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center text-3xl mr-4">  
                  👨‍💼  
                </div>  
                <div>  
                  <h4 className="font-bold text-lg">Marc L.</h4>  
                  <p className="text-gray-600 text-sm">Chalon-sur-Saône (71)</p>  
                </div>  
              </div>  
              <div className="text-yellow-500 text-xl mb-3">⭐⭐⭐⭐⭐</div>  
              <p className="text-gray-700 italic mb-4">  
                "J'étais sceptique sur l'audit à distance, mais le niveau de détail m'a bluffé. L'IA a détecté des ponts thermiques que je ne soupçonnais même pas. Résultat : facture de chauffage divisée par 3."  
              </p>  
              <div className="bg-blue-50 p-3 rounded-lg">  
                <p className="text-sm text-blue-700 font-semibold">  
                  ✓ Maison 150m² • DPE E → C  
                </p>  
              </div>  
            </div>  
              
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">  
              <div className="flex items-center mb-4">  
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center text-3xl mr-4">  
                  👴  
                </div>  
                <div>  
                  <h4 className="font-bold text-lg">Jean-Pierre M.</h4>  
                  <p className="text-gray-600 text-sm">Mâcon (71)</p>  
                </div>  
              </div>  
              <div className="text-yellow-500 text-xl mb-3">⭐⭐⭐⭐⭐</div>  
              <p className="text-gray-700 italic mb-4">  
                "199€ pour un audit aussi complet, c'est cadeau ! Et en plus remboursé quand j'ai fait les travaux. L'IA a calculé mes aides au centime près : 42 300€ obtenus, exactement comme prévu."  
              </p>  
              <div className="bg-purple-50 p-3 rounded-lg">  
                <p className="text-sm text-purple-700 font-semibold">  
                  ✓ Maison 100m² • DPE F → B  
                </p>  
              </div>  
            </div>  
          </div>  
            
          <div className="mt-16 grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">  
            <div className="bg-white p-6 rounded-xl text-center shadow-md">  
              <div className="text-4xl font-bold text-green-600 mb-2">4.9/5</div>  
              <p className="text-gray-600">Note moyenne</p>  
            </div>  
            <div className="bg-white p-6 rounded-xl text-center shadow-md">  
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>  
              <p className="text-gray-600">Audits réalisés</p>  
            </div>  
            <div className="bg-white p-6 rounded-xl text-center shadow-md">  
              <div className="text-4xl font-bold text-green-600 mb-2">95%</div>  
              <p className="text-gray-600">Taux de satisfaction</p>  
            </div>  
            <div className="bg-white p-6 rounded-xl text-center shadow-md">  
              <div className="text-4xl font-bold text-green-600 mb-2">48h</div>  
              <p className="text-gray-600">Délai moyen</p>  
            </div>  
          </div>  
        </div>  
      </section>  
 
      {/* FAQ Section */}  
      <section id="faq" className="py-20 bg-white">  
        <div className="container mx-auto px-4">  
          <h2 className="text-4xl font-bold text-center mb-4">  
            ❓ Questions fréquentes  
          </h2>  
          <p className="text-center text-xl text-gray-600 mb-16">  
            Tout ce que vous devez savoir  
          </p>  
            
          <div className="max-w-4xl mx-auto space-y-6">  
            <div className="bg-gray-50 p-8 rounded-2xl border-l-4 border-green-500 hover:shadow-lg transition">  
              <h3 className="text-xl font-bold mb-3 flex items-center">  
                <span className="text-green-600 mr-3">✓</span>  
                L'audit IA est-il aussi fiable qu'un audit classique ?  
              </h3>  
              <p className="text-gray-700 leading-relaxed">  
                Oui, notre IA atteint une <strong>précision de 95%</strong>, entraînée sur plus de 100 000 cas réels.   
                Elle est certifiée ANAH et reconnue par MaPrimeRénov'.  
              </p>  
            </div>  
              
            <div className="bg-gray-50 p-8 rounded-2xl border-l-4 border-blue-500 hover:shadow-lg transition">  
              <h3 className="text-xl font-bold mb-3 flex items-center">  
                <span className="text-blue-600 mr-3">✓</span>  
                Est-il reconnu pour MaPrimeRénov' ?  
              </h3>  
              <p className="text-gray-700 leading-relaxed">  
                Absolument. Notre audit est <strong>certifié ANAH</strong> et éligible pour toutes les aides :   
                MaPrimeRénov', CEE, Éco-PTZ, aides locales.  
              </p>  
            </div>  
              
            <div className="bg-gray-50 p-8 rounded-2xl border-l-4 border-purple-500 hover:shadow-lg transition">  
              <h3 className="text-xl font-bold mb-3 flex items-center">  
                <span className="text-purple-600 mr-3">✓</span>  
                Combien de temps prend la collecte des données ?  
              </h3>  
              <p className="text-gray-700 leading-relaxed">  
                <strong>30 minutes maximum</strong> à votre rythme. Le formulaire est guidé étape par étape.   
                Vous pouvez sauvegarder et reprendre plus tard.  
              </p>  
            </div>  
              
            <div className="bg-gray-50 p-8 rounded-2xl border-l-4 border-orange-500 hover:shadow-lg transition">  
              <h3 className="text-xl font-bold mb-3 flex items-center">  
                <span className="text-orange-600 mr-3">✓</span>  
                L'audit est-il vraiment remboursé si je fais les travaux ?  
              </h3>  
              <p className="text-gray-700 leading-relaxed">  
                Oui, <strong>remboursement intégral des 199€</strong> si vous réalisez les travaux recommandés   
                (facture à fournir sous 12 mois).  
              </p>  
            </div>  
          </div>  
        </div>  
      </section>  

      
      <section className="py-20 bg-gradient-to-br from-green-600 to-blue-600 text-white">  
        <div className="container mx-auto px-4 text-center">  
          <div className="max-w-4xl mx-auto">  
            <h2 className="text-5xl font-bold mb-6">  
              ⚡ Prêt à optimiser votre rénovation ?  
            </h2>  
            <p className="text-2xl mb-8 opacity-90">  
              Obtenez votre audit énergétique par IA en 48h  
            </p>  
              
            <div className="grid md:grid-cols-3 gap-6 mb-12">  
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">  
                <div className="text-4xl mb-3">✅</div>  
                <h3 className="font-bold text-xl mb-2">Certifié ANAH</h3>  
                <p className="text-sm opacity-90">Reconnu MaPrimeRénov'</p>  
              </div>  
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">  
                <div className="text-4xl mb-3">💰</div>  
                <h3 className="font-bold text-xl mb-2">Remboursé</h3>  
                <p className="text-sm opacity-90">Si vous faites les travaux</p>  
              </div>  
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">  
                <div className="text-4xl mb-3">🛡️</div>  
                <h3 className="font-bold text-xl mb-2">Garantie 30 jours</h3>  
                <p className="text-sm opacity-90">Satisfait ou remboursé</p>  
              </div>  
            </div>  
              
            <div className="bg-white text-gray-900 p-8 rounded-2xl shadow-2xl mb-8 inline-block">  
              <div className="flex items-center justify-center gap-4 mb-4">  
                <span className="text-gray-400 line-through text-2xl">800-1 500€</span>  
                <span className="text-5xl font-bold text-green-600">199€</span>  
              </div>  
              <p className="text-gray-600 mb-6">Rapport complet • 3-5 scénarios • Aides calculées</p>  
                
              <a href="#commander" className="inline-block bg-green-600 text-white px-12 py-5 rounded-full text-2xl font-bold hover:bg-green-700 transform hover:scale-105 transition shadow-lg">  
                COMMANDER MON AUDIT IA - 199€  
              </a>  
            </div>  
              
            <div className="bg-yellow-400 text-gray-900 p-6 rounded-xl inline-block mb-8">  
              <p className="font-bold text-lg mb-2">⚠️ Places limitées : 15 audits/semaine</p>  
              <p className="text-sm">Délai actuel : 2-3 jours • Commandez maintenant pour profiter des aides 2026</p>  
            </div>  
              
            <div className="flex flex-wrap justify-center gap-6">  
              <div className="flex items-center gap-2">  
                <span className="text-2xl">💳</span>  
                <span>Paiement sécurisé</span>  
              </div>  
              <div className="flex items-center gap-2">  
                <span className="text-2xl">📞</span>  
                <span>Questions ? 06 10 59 68 98</span>  
              </div>  
              <div className="flex items-center gap-2">  
                <span className="text-2xl">⚡</span>  
                <span>Rapport sous 48h</span>  
              </div>  
            </div>  
          </div>  
        </div>  
      </section>  
 
{/* Footer */}  
<footer className="bg-gray-900 text-white py-12">  
  <div className="container mx-auto px-4">  
    <div className="grid md:grid-cols-3 gap-8 mb-8">  
      <div>  
        <h4 className="text-xl font-bold mb-4">⚡ Energia-Conseil IA</h4>  
        <p className="text-gray-400">L'audit énergétique par intelligence artificielle</p>  
      </div>  
      <div>  
        <h4 className="text-xl font-bold mb-4">Contact</h4>  
        <p className="text-gray-400">📍 16 Rue Cuvier, 69006 Lyon</p>  
        <p className="text-gray-400">📞 06 10 59 68 98</p>  
        <p className="text-gray-400">✉️ contact@energia-conseil.com</p>  
      </div>  
      <div>  
        <h4 className="text-xl font-bold mb-4">Liens rapides</h4>  
        <ul className="space-y-2">  
          <li><a href="#audit" className="text-gray-400 hover:text-white transition">Audit</a></li>  
          <li><a href="#avantages" className="text-gray-400 hover:text-white transition">Avantages</a></li>  
          <li><a href="#process" className="text-gray-400 hover:text-white transition">Process</a></li>  
          <li><a href="#prix" className="text-gray-400 hover:text-white transition">Prix</a></li>  
        </ul>  
      </div>  
    </div>  
    <div className="border-t border-gray-800 pt-8 text-center text-gray-400">  
      <p>&copy; 2026 Energia-Conseil IA. Tous droits réservés.</p>  
    </div>  
  </div>  
</footer>  
</div>  
)  
}    
export default App  