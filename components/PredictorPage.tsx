import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { useSound } from '../hooks/useSound';
import { verificationService } from '../services/verificationService';

// --- Constants ---
const PREDICTION_LIMIT = 15;
// @ts-ignore - VITE_AFFILIATE_LINK is injected by the build process
const AFFILIATE_LINK = import.meta.env.VITE_AFFILIATE_LINK || 'https://1waff.com/?p=YOUR_CODE_HERE';

// --- Prediction Values ---
const COMMON_MULTIPLIERS = ["1.20x", "1.44x", "1.72x", "2.06x", "2.47x"];
const RARE_MULTIPLIERS = ["2.96x", "3.55x", "4.26x", "5.11x"];
const RARE_CHANCE = 1 / 15; // Approx 1 in 15 will be rare


// --- Component Props Interface ---
interface PredictorPageProps {
    user: User;
    onUpdateUser: (user: User) => void;
}

// --- Component ---
const PredictorPage: React.FC<PredictorPageProps> = ({ user, onUpdateUser }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [prediction, setPrediction] = useState<{ value: string; accuracy: number } | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [lastPredictionValue, setLastPredictionValue] = useState<string | null>(null); // New state to track the last value

    const chickenRef = useRef<HTMLDivElement>(null);
    const { t, formatCurrency } = useTranslations();
    const { playSound } = useSound();

    const predictionsUsed = user.predictionCount;
    const predictionsLeft = PREDICTION_LIMIT - predictionsUsed;

    useEffect(() => {
        // Add class to body for special full-screen styling
        document.body.classList.add('game-mode');
        // Cleanup on component unmount
        return () => {
            document.body.classList.remove('game-mode');
        };
    }, []);
    
    useEffect(() => {
        if (showResult && prediction) {
            playSound('predictionReveal');
        }
    }, [showResult, prediction, playSound]);

    const handleGetSignal = () => {
        if (predictionsLeft <= 0 || user.awaitingDeposit || isGenerating || showResult) {
            if(!isGenerating && !showResult) onUpdateUser({ ...user, awaitingDeposit: true });
            return;
        }
        
        playSound('getSignal');
        setIsGenerating(true);

        // Trigger animation
        if (chickenRef.current) {
            chickenRef.current.classList.add('running');
            playSound('chickenRun');
        }

        setTimeout(() => {
            // Generate prediction
            const isRare = Math.random() < RARE_CHANCE;
            const multipliers = isRare ? RARE_MULTIPLIERS : COMMON_MULTIPLIERS;
            
            let value;
            // Loop to ensure the new value is not the same as the last one,
            // as long as there's more than one option.
            do {
                value = multipliers[Math.floor(Math.random() * multipliers.length)];
            } while (multipliers.length > 1 && value === lastPredictionValue);
            
            // Generate a random accuracy between 70% and 99%
            const minAccuracy = 70;
            const maxAccuracy = 99;
            const accuracy = Math.floor(Math.random() * (maxAccuracy - minAccuracy + 1)) + minAccuracy;

            setPrediction({ value, accuracy });
            setLastPredictionValue(value); // Update the last prediction value
            onUpdateUser({ ...user, predictionCount: user.predictionCount + 1 });
            
            setIsGenerating(false);
            setShowResult(true);
            
            if (chickenRef.current) {
                chickenRef.current.classList.remove('running');
            }
        }, 3000); // 3-second animation
    };

    const handleNextRound = () => {
        playSound('nextRound');
        setShowResult(false);
        setPrediction(null);
    };

    const handleDeposit = () => {
        playSound('buttonClick');
        window.open(AFFILIATE_LINK, '_blank');
    };

    if (user.awaitingDeposit || predictionsLeft <= 0) {
        const depositInfo = t('predictor.depositInfo', { 
            limit: PREDICTION_LIMIT, 
            redepositAmount: formatCurrency(400) 
        });
        return (
             <div className="flex items-center justify-center min-h-screen p-4">
                 <div className="static-clouds"></div>
                 <div className="text-center p-8 content-card max-w-lg mx-auto">
                     <h3 className="text-2xl font-bold text-white mb-3 page-title">{t('predictor.limitTitle')}</h3>
                     <p className="text-gray-200 mb-6">{t('predictor.limitSubtitle')}</p>
                     <div className="bg-black/20 border-2 border-yellow-500/50 rounded-lg p-4 mb-6">
                         <p className="font-semibold text-white">{t('predictor.whyDeposit')}</p>
                         <p className="text-sm text-gray-200 mt-1">{depositInfo}</p>
                     </div>
                     <button
                        onClick={handleDeposit}
                        className="w-full btn-game"
                    >
                        {t('predictor.depositNow')}
                    </button>
                    <p className="text-xs text-gray-300 mt-4">{t('predictor.depositNote')}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="game-container">
            <div className="clouds"></div>
            <main className="game-world">
                <div className="road-signs">
                    <div className="sign yellow-sign">
                        <div className="sign-face">
                           <svg width="4.5vh" height="7vh" viewBox="0 0 20 35" className="mb-1">
                                <defs>
                                    <radialGradient id="exclamation-dot-grad" cx="0.4" cy="0.4" r="0.6">
                                        <stop offset="0%" stopColor="#555555" />
                                        <stop offset="100%" stopColor="#000000" />
                                    </radialGradient>
                                    <linearGradient id="exclamation-line-grad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#000000" />
                                        <stop offset="50%" stopColor="#555555" />
                                        <stop offset="100%" stopColor="#000000" />
                                    </linearGradient>
                                </defs>
                                {/* The line part */}
                                <rect x="6" y="0" width="8" height="20" rx="4" fill="url(#exclamation-line-grad)" />
                                {/* The dot part */}
                                <circle cx="10" cy="28" r="6" fill="url(#exclamation-dot-grad)" />
                            </svg>
                            <span>Start</span>
                        </div>
                    </div>
                    <div className="sign grey-sign">
                        <div className="sign-face">
                            <div className="sign-screw" style={{ top: '2vh', left: '2vh' }}></div>
                            <div className="sign-screw" style={{ bottom: '2vh', right: '2vh' }}></div>
                            <span>1.20x</span>
                        </div>
                    </div>
                    <div className="sign grey-sign">
                        <div className="sign-face">
                            <div className="sign-screw" style={{ top: '2vh', right: '2vh' }}></div>
                            <div className="sign-screw" style={{ bottom: '2vh', left: '2vh' }}></div>
                             <span>1.44x</span>
                        </div>
                    </div>
                     <div className="sign grey-sign">
                        <div className="sign-face"><span>...</span></div>
                    </div>
                </div>
                <div className="wall"></div>
                <div className="sidewalk">
                    <div className="manhole"></div>
                    <div className="manhole"></div>
                </div>
                <div className="road"></div>
                <div ref={chickenRef} className="chicken">
                    <img 
                        src="https://i.postimg.cc/mDw7YjT7/bg-edited-gif-f6418d08-29c7-48f8-ae03-bca18b3d46be-GIFSolo-20251103-113356.gif" 
                        alt="Running Chicken" 
                        className="w-full h-full object-contain"
                        onContextMenu={(e) => e.preventDefault()}
                    />
                </div>
            </main>

            <footer className="game-footer">
                {!showResult && (
                    <>
                        <div className="prediction-placeholder flex items-center justify-center gap-4 py-2 px-4 !text-2xl">
                            <img 
                                src="https://i.postimg.cc/QdDR6xDX/bg-edited-gif-f890646d-f34a-489a-ac85-52d5c03223ad-GIFSolo-20251103-121234.gif" 
                                alt="Chicken Run Predictor Logo"
                                className="h-16 w-auto"
                                onContextMenu={(e) => e.preventDefault()}
                            />
                            <span className="leading-tight text-left">
                                Chicken Run<br />Predictor
                            </span>
                        </div>
                        <button 
                            className="action-button"
                            onClick={() => { playSound('buttonClick'); handleGetSignal(); }}
                            disabled={isGenerating}
                        >
                             <div className="btn-screw" style={{ bottom: '12px', left: '12px' }}></div>
                             <div className="btn-screw" style={{ bottom: '12px', right: '12px' }}></div>
                            {isGenerating ? t('predictor.generating') : t('predictor.getSignal')}
                        </button>
                    </>
                )}
            </footer>
            
            {showResult && prediction && (
                <div className="result-overlay">
                    <div className="result-modal">
                        <div className="result-coin">
                            <span>{prediction.value}</span>
                        </div>
                        <div className="result-info">
                            {t('predictor.accuracyLabel').replace('{accuracy}', prediction.accuracy.toString())}
                            <br />
                            {t('predictor.cashoutLabel').replace('{value}', prediction.value)}
                        </div>
                         <button 
                            className="action-button"
                            onClick={() => { playSound('buttonClick'); handleNextRound(); }}
                        >
                            <div className="btn-screw" style={{ bottom: '12px', left: '12px' }}></div>
                            <div className="btn-screw" style={{ bottom: '12px', right: '12px' }}></div>
                            {t('predictor.nextRound')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictorPage;