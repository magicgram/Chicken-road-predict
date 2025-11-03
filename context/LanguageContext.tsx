import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations } from '../i18n/translations';

// --- Currency Conversion Data ---
const currencyData: { [key: string]: { symbol: string; position: 'pre' | 'post' } } = {
    bn: { symbol: '৳', position: 'pre' }, // Bangladesh Taka
    ur: { symbol: 'Rs', position: 'pre' }, // Pakistan Rupee
    ne: { symbol: 'रू', position: 'pre' }, // Nepalese Rupee
    ru: { symbol: '₽', position: 'post' }, // Russian Ruble
    es: { symbol: '€', position: 'pre' }, // Euro
    fr: { symbol: '€', position: 'pre' }, // Euro
    de: { symbol: '€', position: 'pre' }, // Euro
    pt: { symbol: '€', position: 'pre' }, // Euro
    it: { symbol: '€', position: 'pre' }, // Euro
    zh: { symbol: '¥', position: 'pre' }, // Chinese Yuan
    ja: { symbol: '¥', position: 'pre' }, // Japanese Yen
    ko: { symbol: '₩', position: 'pre' }, // South Korean Won
    ar: { symbol: '﷼', position: 'pre' }, // Saudi Riyal
    tr: { symbol: '₺', position: 'pre' }, // Turkish Lira
    nl: { symbol: '€', position: 'pre' }, // Euro
    pl: { symbol: 'zł', position: 'post' }, // Polish Złoty
    sv: { symbol: 'kr', position: 'post' }, // Swedish Krona
    no: { symbol: 'kr', position: 'post' }, // Norwegian Krone
    da: { symbol: 'kr', position: 'post' }, // Danish Krone
    fi: { symbol: '€', position: 'pre' }, // Euro
    id: { symbol: 'Rp', position: 'pre' }, // Indonesian Rupiah
    vi: { symbol: '₫', position: 'post' }, // Vietnamese Đồng
    th: { symbol: '฿', position: 'pre' }, // Thai Baht
    ms: { symbol: 'RM', position: 'pre' }, // Malaysian Ringgit
    fil: { symbol: '₱', position: 'pre' }, // Philippine Peso
    el: { symbol: '€', position: 'pre' }, // Euro
    cs: { symbol: 'Kč', position: 'post' }, // Czech Koruna
    hu: { symbol: 'Ft', position: 'post' }, // Hungarian Forint
    ro: { symbol: 'lei', position: 'post' }, // Romanian Leu
    uk: { symbol: '₴', position: 'pre' }, // Ukrainian Hryvnia
    he: { symbol: '₪', position: 'pre' }, // Israeli New Shekel
    fa: { symbol: '﷼', position: 'post' }, // Iranian Rial
};

const conversions: { [key: string]: { '500': number; '400': number } } = {
    bn: { '500': 689, '400': 551 },
    ur: { '500': 1599, '400': 1279 },
    ne: { '500': 800, '400': 640 },
    ru: { '500': 1050, '400': 840 },
    es: { '500': 6, '400': 5 },
    fr: { '500': 6, '400': 5 },
    de: { '500': 6, '400': 5 },
    pt: { '500': 6, '400': 5 },
    it: { '500': 6, '400': 5 },
    zh: { '500': 87, '400': 70 },
    ja: { '500': 1890, '400': 1512 },
    ko: { '500': 16590, '400': 13272 },
    ar: { '500': 45, '400': 36 },
    tr: { '500': 390, '400': 312 },
    nl: { '500': 6, '400': 5 },
    pl: { '500': 48, '400': 38 },
    sv: { '500': 125, '400': 100 },
    no: { '500': 128, '400': 102 },
    da: { '500': 82, '400': 66 },
    fi: { '500': 6, '400': 5 },
    id: { '500': 97500, '400': 78000 },
    vi: { '500': 305000, '400': 244000 },
    th: { '500': 440, '400': 352 },
    ms: { '500': 56, '400': 45 },
    fil: { '500': 700, '400': 560 },
    el: { '500': 6, '400': 5 },
    cs: { '500': 275, '400': 220 },
    hu: { '500': 4330, '400': 3464 },
    ro: { '500': 55, '400': 44 },
    uk: { '500': 480, '400': 384 },
    he: { '500': 44, '400': 35 },
    fa: { '500': 504000, '400': 403200 },
};


type LanguageContextType = {
    language: string;
    setLanguage: (language: string) => void;
    t: (key: string, replacements?: { [key: string]: string | number }) => string;
    formatCurrency: (amountInr: 500 | 400) => string;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<string>(() => {
        try {
            const storedLang = localStorage.getItem('mines-predictor-lang');
            return storedLang || 'en';
        } catch (e) {
            console.error("Could not access localStorage", e);
            return 'en';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('mines-predictor-lang', language);
        } catch (e) {
            console.error("Could not access localStorage", e);
        }
    }, [language]);

    const formatCurrency = useCallback((amountInr: 500 | 400): string => {
        if (language === 'en' || language === 'hi') {
            return `₹${amountInr}`;
        }

        const conversionValues = conversions[language];
        const currencyInfo = currencyData[language];

        if (conversionValues && currencyInfo) {
            const amount = conversionValues[amountInr];
            if (currencyInfo.position === 'pre') {
                return `${currencyInfo.symbol}${amount}`;
            }
            return `${amount.toLocaleString()}${currencyInfo.symbol}`;
        }

        // Fallback for any languages without specific conversion data
        return `₹${amountInr}`;
    }, [language]);


    const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
        const keys = key.split('.');
        let result: any = translations;
        try {
            for (const k of keys) {
                if (result === undefined) break;
                result = result[k];
            }
            let translatedString = result?.[language] || result?.['en'];
            
            if (translatedString === undefined) {
                let fallbackResult: any = translations;
                for (const k of keys) {
                    if(fallbackResult === undefined) break;
                    fallbackResult = fallbackResult[k];
                }
                if(fallbackResult?.['en']) return key; 
                
                return key;
            }
            
            if (translatedString && replacements) {
                Object.keys(replacements).forEach(placeholder => {
                    const regex = new RegExp(`{${placeholder}}`, 'g');
                    translatedString = translatedString.replace(regex, String(replacements[placeholder]));
                });
            }

            return translatedString;

        } catch (e) {
            console.error(`Translation error for key: ${key}`, e);
            return key; 
        }
    }, [language]);


    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, formatCurrency }}>
            {children}
        </LanguageContext.Provider>
    );
};
