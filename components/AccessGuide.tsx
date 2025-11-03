

import React, { useState } from 'react';
import CopyIcon from './icons/CopyIcon';
import { useTranslations } from '../hooks/useTranslations';
import { useSound } from '../hooks/useSound';


const Step: React.FC<{ number: number; children: React.ReactNode }> = ({ number, children }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 mr-2 bg-yellow-400 text-yellow-900 border-2 border-yellow-600 rounded-full font-bold text-lg">
            {number}
        </div>
        <p className="text-gray-200 text-lg mt-0.5">{children}</p>
    </div>
);

const PromoCode: React.FC = () => {
    const [copied, setCopied] = useState(false);
    const promoCode = "FSS23";
    const { t } = useTranslations();
    const { playSound } = useSound();

    const handleCopy = () => {
        playSound('copy');
        navigator.clipboard.writeText(promoCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
    };

    return (
        <div className="flex items-start space-x-4">
             <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 mr-2 bg-yellow-400 text-yellow-900 border-2 border-yellow-600 rounded-full font-bold text-lg">
                4
            </div>
            <div className="text-gray-200 text-lg mt-0.5 flex-grow">
                <p>{t('accessGuide.usePromo')}</p>
                <div className="mt-2 flex items-center bg-black/40 p-2 rounded-lg border border-white/20 w-max">
                    <span className="font-mono text-xl text-yellow-300 mr-4">{promoCode}</span>
                    <button 
                        onClick={handleCopy}
                        className="p-2 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-label="Copy promocode"
                    >
                        {copied ? (
                           <span className="text-green-400 text-sm font-semibold">{t('common.copied')}</span>
                        ) : (
                           <CopyIcon className="h-5 w-5 text-gray-300" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};


const AccessGuide: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="w-full max-w-2xl mx-auto p-8 content-card mb-8">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold page-title mb-2">
                    {t('accessGuide.title')}
                </h2>
                <p className="text-gray-200">{t('accessGuide.subtitle')}</p>
                <img 
                    src="https://i.postimg.cc/g0R0b25Y/Picsart-25-11-03-11-47-16-281.jpg" 
                    alt="Access guide visual" 
                    className="mt-6 rounded-lg shadow-lg border-4"
                    style={{ borderColor: 'var(--wood-border)' }}
                    onContextMenu={(e) => e.preventDefault()}
                />
            </div>
            
            <div className="space-y-6">
                <Step number={1}>{t('accessGuide.step1')}</Step>
                <Step number={2}>{t('accessGuide.step2')}</Step>
                <Step number={3}>{t('accessGuide.step3')}</Step>
                <PromoCode />
            </div>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-wood-bg px-4 text-sm font-semibold text-gray-200 rounded-full tracking-widest uppercase shadow-md" style={{ backgroundColor: '#8C5A3A' }}>
                        {t('accessGuide.then')}
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                    <span className="mr-3 text-3xl">📝</span> {t('accessGuide.findPlayerIdTitle')}
                </h3>
                <Step number={1}>{t('accessGuide.findPlayerIdStep1')}</Step>
                <Step number={2}>{t('accessGuide.findPlayerIdStep2')}</Step>
                <Step number={3}>{t('accessGuide.findPlayerIdStep3')}</Step>
                <Step number={4}>{t('accessGuide.findPlayerIdStep4')}</Step>
            </div>
        </div>
    );
};

export default AccessGuide;