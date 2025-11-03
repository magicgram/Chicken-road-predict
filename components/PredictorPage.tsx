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
    const [lastPredictionValue, setLastPredictionValue] = useState<string | null>(null);

    const chickenRef = useRef<HTMLDivElement>(null);
    const { t, formatCurrency } = useTranslations();
    const { playSound } = useSound();

    const predictionsUsed = user.predictionCount;
    const predictionsLeft = PREDICTION_LIMIT - predictionsUsed;

    useEffect(() => {
        document.body.classList.add('game-mode');
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

        if (chickenRef.current) {
            chickenRef.current.classList.add('running');
            playSound('chickenRun');
        }

        setTimeout(() => {
            const isRare = Math.random() < RARE_CHANCE;
            const multipliers = isRare ? RARE_MULTIPLIERS : COMMON_MULTIPLIERS;
            
            let value;
            do {
                value = multipliers[Math.floor(Math.random() * multipliers.length)];
            } while (multipliers.length > 1 && value === lastPredictionValue);
            
            const minAccuracy = 70;
            const maxAccuracy = 99;
            const accuracy = Math.floor(Math.random() * (maxAccuracy - minAccuracy + 1)) + minAccuracy;

            setPrediction({ value, accuracy });
            setLastPredictionValue(value);
            onUpdateUser({ ...user, predictionCount: user.predictionCount + 1 });
            
            setIsGenerating(false);
            setShowResult(true);
            
            if (chickenRef.current) {
                // Let animation finish, then remove class
                setTimeout(() => {
                    if (chickenRef.current) {
                        chickenRef.current.classList.remove('running');
                    }
                }, 1000);
            }
        }, 3000); 
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
        <div className="game-container-dark">
            <div className="game-scenery">
                <div className="wall-background">
                    <div className="doorway"></div>
                    <div className="multiplier-orb" style={{ left: '55%', top: '20%', transform: 'scale(0.8)' }}>1.03x</div>
                    <div className="multiplier-orb" style={{ left: '78%', top: '25%', transform: 'scale(0.9)' }}>1.07x</div>
                </div>
                <div className="floor"></div>

                <div ref={chickenRef} className="chicken">
                    <img 
                        src="https://i.postimg.cc/mDw7YjT7/bg-edited-gif-f6418d08-29c7-48f8-ae03-bca18b3d46be-GIFSolo-20251103-113356.gif" 
                        alt="Running Chicken" 
                        className="w-full h-full object-contain"
                        onContextMenu={(e) => e.preventDefault()}
                    />
                </div>
            </div>

            <footer className="game-footer-dark">
                <div className="control-panel">
                    <div className="panel-row">
                        <div className="panel-item">Accuracy -</div>
                        <div className="panel-item">Steps -</div>
                    </div>
                    <div className="panel-row">
                        <div className="panel-item full-width">Cashout before this value 👉</div>
                    </div>
                    <div className="panel-row">
                        <div className="panel-item dropdown">Easy</div>
                    </div>
                    <button 
                        onClick={handleGetSignal}
                        disabled={isGenerating || showResult}
                        className="btn-get-signal"
                    >
                        {isGenerating ? t('predictor.generating') : t('predictor.getSignal')}
                    </button>
                </div>
            </footer>
            
            {showResult && prediction && (
                <div className="result-overlay">
                    <div className="result-modal result-modal-dark">
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
                            onClick={handleNextRound}
                        >
                            {t('predictor.nextRound')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictorPage;