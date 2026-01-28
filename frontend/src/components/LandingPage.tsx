'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authStorage } from '@/lib/auth';
import { useLanguage } from '@/lib/language-context';

export default function LandingPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const token = authStorage.getToken();
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const content = {
    en: {
      hero_main: "Get a Real Guide, Not Just Information",
      hero_desc: "Get paired with someone who will help you build that life.",
      cta: "Find Your Mentor Now",
      why: "Why Mentori",
      benefits: [
        { 
          title: "Real Human Connection", 
          desc: "Not an AI. Not a generic article. A real person in Finland who understands exactly what you're going through and genuinely cares about your success.",
          image: "/images/cafe-conversation.jpg"
        },
        { 
          title: "Local, Current Knowledge", 
          desc: "Housing market just shifted. This company no longer hires. That neighborhood is booming. Real-time insights you won't find online.",
          image: "/images/finland-winter.jpg"
        },
        { 
          title: "Peace of Mind", 
          desc: "Stop worrying alone. Have someone in your corner. Someone who's been there, succeeded, and genuinely wants to help you succeed too.",
          image: "/images/satisfied-person.jpg"
        }
      ],
      cta_secondary: "Start Your Journey",
      social_proof: "Real people. Real results. Real connections."
    },
    fi: {
      hero_main: "Saa Oikea Opas, Ei Vain Tietoa",
      hero_desc: "Yhdistä jonkun kanssa, joka auttaa sinua rakentamaan elämän.",
      cta: "Löydä Mentorin",
      why: "Miksi Mentori",
      benefits: [
        { 
          title: "Oikea Ihminen", 
          desc: "Ei botti. Ei geneerinen artikkeli. Oikea ihminen Suomessa, joka ymmärtää täsmälleen mitä käyt läpi ja todella välittää menestyksestäsi.",
          image: "/images/cafe-conversation.jpg"
        },
        { 
          title: "Paikallinen, Ajantasainen Tieto", 
          desc: "Asuntomarkkina muuttui juuri. Tämä yritys ei enää palkkaa. Tuo naapurusto kukoistaa. Reaaliaikaista tietoa, jota et löydä verkosta.",
          image: "/images/finland-winter.jpg"
        },
        { 
          title: "Mielenrauha", 
          desc: "Lopeta huoli yksin. Ole jollakulla tukenasi. Jollakulla, joka on ollut siellä, onnistui, ja todella haluaa auttaa sinua onnistumaan.",
          image: "/images/satisfied-person.jpg"
        }
      ],
      cta_secondary: "Aloita Matka",
      social_proof: "Oikeat ihmiset. Oikeat tulokset. Oikeat yhteydet."
    }
  };

  const t = content[language as keyof typeof content];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 flex flex-col">
      {/* Navigation */}
      <nav className="px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-sm">
        <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">mentori</div>
        <div className="flex gap-3">
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              language === 'en'
                ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-md'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('fi')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              language === 'fi'
                ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-md'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            FI
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-2xl w-full text-center">
          {/* Main Headline */}
          <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-orange-600 to-pink-600 bg-clip-text text-transparent mb-4 transition-all duration-1000 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            {t.hero_main}
          </h1>

          {/* Description */}
          <p className={`text-lg text-slate-700 leading-relaxed mb-6 transition-all duration-1000 delay-100 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {t.hero_desc}
          </p>

          {/* CTA Button */}
          <button
            onClick={() => router.push('/auth')}
            className={`bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white font-semibold py-3 px-10 rounded-full text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-3 transition-all duration-1000 delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {t.cta}
          </button>

          <p className="text-slate-500 text-xs">No credit card needed • Sign up in 2 minutes</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-3">
            {t.why}
          </h2>
          <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">
            {t.social_proof}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.benefits.map((benefit, idx) => {
              const icons = ['👤', '📍', '💙'];
              const gradients = [
                'bg-gradient-to-br from-orange-200 via-pink-200 to-orange-300',
                'bg-gradient-to-br from-blue-200 via-cyan-200 to-blue-300',
                'bg-gradient-to-br from-pink-200 via-purple-200 to-pink-300'
              ];
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-100"
                >
                  <div 
                    className={`relative h-40 ${gradients[idx]} flex items-center justify-center`}
                  >
                    <div className="text-5xl opacity-90">
                      {icons[idx]}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-6 px-6 mt-auto">
        <div className="max-w-5xl mx-auto text-center text-slate-300 text-xs">
          <p>© 2026 Mentori. Helping newcomers build successful lives in Finland. 🇫🇮</p>
        </div>
      </footer>
    </div>
  );
}
