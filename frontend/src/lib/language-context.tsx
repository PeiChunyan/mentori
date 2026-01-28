'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'fi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'hero.title': 'Find Your Path in Finland',
    'hero.subtitle': 'Connect with experienced mentors who\'ve navigated the journey of settling in Finland. Get personalized guidance, local insights, and genuine support as you build your new life.',
    'hero.verified': 'Verified Mentors',
    'hero.verified.desc': 'Experienced professionals with proven track records',
    'hero.matching': 'Personalized Matching',
    'hero.matching.desc': 'We match you with mentors based on your goals and background',
    'hero.secure': 'Confidential & Secure',
    'hero.secure.desc': 'Your privacy is our priority. All conversations are protected',
    'cta.start': 'Start Your Mentorship Journey',
    'cta.signin': 'Sign In to Your Account',
    'features.title': 'Why Mentori?',
    'features.guidance': 'Expert Local Guidance',
    'features.guidance.desc': 'Learn about housing, work culture, education, healthcare, and daily life from those who live it',
    'features.community': 'Safe Community',
    'features.community.desc': 'Join a respectful, supportive community dedicated to helping newcomers succeed',
    'features.support': 'Long-term Support',
    'features.support.desc': 'Build lasting relationships that extend beyond initial onboarding',
    'features.free': 'Free & Accessible',
    'features.free.desc': 'Quality mentorship should be available to everyone, regardless of background',
    'stats.mentors': 'Active Mentors',
    'stats.mentees': 'Mentees Supported',
    'stats.rating': 'Avg. Rating',
    'stats.trust': 'Trusted by newcomers and mentors across Finland',
    'footer': '© 2026 Mentori. Helping newcomers build successful lives in Finland. | Privacy Policy | Terms of Service',
  },
  fi: {
    'hero.title': 'Löydä Tiesi Suomessa',
    'hero.subtitle': 'Ota yhteys kokenaisiin mentoreihin, jotka ovat navigoineet muuton Suomeen. Saa yksilöllisiä neuvoja, paikallista tietoa ja aitoa tukea rakentaessasi uutta elämääsi.',
    'hero.verified': 'Varmistetut Mentorit',
    'hero.verified.desc': 'Kokeneet ammattilaiset, joilla on todistettu kokemus',
    'hero.matching': 'Henkilökohtainen Yhteensovitus',
    'hero.matching.desc': 'Yhdistämme sinut mentorien kanssa tavoitteidesi ja taustasi perusteella',
    'hero.secure': 'Luottamuksellinen & Turvallinen',
    'hero.secure.desc': 'Yksityisyytesi on meille tärkeä. Kaikki keskustelut ovat suojattuja',
    'cta.start': 'Aloita Mentorointimatkaasi',
    'cta.signin': 'Kirjaudu Tilillesi',
    'features.title': 'Miksi Mentori?',
    'features.guidance': 'Asiantunteva Paikallinen Opastus',
    'features.guidance.desc': 'Opi asumisesta, työkulttuurista, koulutuksesta, terveydenhuollosta ja päivittäisestä elämästä niiltä, jotka elävät sitä',
    'features.community': 'Turvallinen Yhteisö',
    'features.community.desc': 'Liity kunnioittavaan, tukevaan yhteisöön, joka on omistautunut auttamaan muuttajia menestymään',
    'features.support': 'Pitkäaikainen Tuki',
    'features.support.desc': 'Rakenna kestäviä suhteita, jotka jatkuvat alkuvaiheen jälkeen',
    'features.free': 'Ilmainen & Saatavilla',
    'features.free.desc': 'Laadukasta mentorointia tulisi olla saatavilla kaikille taustasta riippumatta',
    'stats.mentors': 'Aktiivisia Mentoreita',
    'stats.mentees': 'Tuettuja Menteeita',
    'stats.rating': 'Keskiarvo',
    'stats.trust': 'Luotettu muuttajien ja mentorien toimesta ympäri Suomea',
    'footer': '© 2026 Mentori. Auttaa muuttajia rakentamaan menestyksekkäitä elämää Suomessa. | Tietosuojakäytäntö | Palveluehdot',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved && (saved === 'en' || saved === 'fi')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
