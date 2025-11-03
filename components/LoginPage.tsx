import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useSound } from '../hooks/useSound';

interface LoginPageProps {
    onLogin: (userId: string) => void;
    error: string | null;
    isLoading: boolean;
    infoMessage: string | null;
}

// IMPORTANT: Set your affiliate link in the Vercel Environment Variables.
// The variable name must be VITE_AFFILIATE_LINK
// @ts-ignore
const AFFILIATE_LINK = import.meta.env.VITE_AFFILIATE_LINK || 'https://1waff.com/?p=YOUR_CODE_HERE';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error, isLoading, infoMessage }) => {
    const [userId, setUserId] = useState('');
    const { t, formatCurrency } = useTranslations();
    const { playSound } = useSound();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        playSound('buttonClick');
        if (userId.trim()) {
            onLogin(userId.trim());
        }
    };

    const handleRegister = () => {
        playSound('buttonClick');
        window.open(AFFILIATE_LINK, '_blank');
    };

    const renderInfoMessage = () => {
        // Special handling for the API message to translate it
        if (!infoMessage) return null;
        
        // This is brittle, but necessary without API changes
        if (infoMessage.includes('successfully completed registration')) {
            const depositAmount = formatCurrency(500);
            const lines = t('info.registeredNeedsDeposit', { depositAmount }).split('\n');
            return (
                 <div className="p-3 bg-black/20 border-2 border-yellow-500/50 rounded-lg text-sm space-y-2">
                     {lines.map((line, index) => {
                         const trimmedLine = line.trim();
                         const firstSpaceIndex = trimmedLine.indexOf(' ');
                         const icon = trimmedLine.substring(0, firstSpaceIndex);
                         const text = trimmedLine.substring(firstSpaceIndex + 1);
                         return (
                             <div key={index} className="flex items-start">
                                 <span className="mr-3 text-lg text-yellow-300">{icon}</span>
                                 <p className="text-gray-200 flex-1">{text}</p>
                             </div>
                         );
                     })}
                 </div>
            )
        }
        // Fallback for any other info message
        return (
            <div className="p-3 bg-black/20 border-2 border-yellow-500/50 rounded-lg text-sm space-y-2">
                <p className="text-gray-200 flex-1">{infoMessage}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center">
             <div className="text-center mb-8">
                <h1 className="app-title-main">
                    {'Chicken'.split('').map((char, index) => (
                        <span key={index} className="char" style={{ animationDelay: `${index * 0.05}s` }}>
                            {char}
                        </span>
                    ))}
                </h1>
                <h2 className="app-title-sub">
                    Run Predictor
                </h2>
            </div>
            <div className="w-full max-w-md p-8 space-y-6 content-card">
                <div className="text-center">
                    <h1 className="text-4xl page-title mb-2">{t('login.title')}</h1>
                    <p className="text-gray-200 mt-2">{t('login.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                         <label htmlFor="userId" className="text-sm font-medium text-gray-200 mb-2 block">{t('login.playerIDLabel')}</label>
                        <input
                            id="userId"
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="12345678"
                            className="form-input"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {isLoading && (
                        <div className="flex items-center p-3 bg-black/20 border-2 border-blue-400/50 rounded-lg text-sm space-x-3">
                            <span className="text-lg">🔍</span>
                            <p className="text-blue-200">{t('login.checkingStatus')}</p>
                        </div>
                    )}

                    {infoMessage && !isLoading && renderInfoMessage()}

                    {error && !isLoading && 
                        <div className="flex items-start p-3 bg-red-900/40 border-2 border-red-500/50 rounded-lg text-sm space-x-3">
                             <span className="text-lg text-red-300 mt-1">❌</span>
                             <p className="text-red-200 whitespace-pre-wrap flex-1">{t(error)}</p>
                        </div>
                    }

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-game"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-white/70 mx-auto"></div>
                            ) : (
                                t('login.continueButton')
                            )}
                        </button>
                    </div>
                </form>
                
                <div className="space-y-4 pt-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span style={{ backgroundColor: '#8C5A3A' }} className="px-3 text-gray-200">
                                {t('login.noAccount')}
                            </span>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleRegister}
                        type="button"
                        className="w-full btn-game"
                    >
                        {t('login.registerButton')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
