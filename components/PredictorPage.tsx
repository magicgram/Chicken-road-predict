

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

// --- Difficulty Multipliers ---
const difficultyMultipliers = {
    Easy: ['1.03x', '1.07x'],
    Medium: ['1.12x', '1.28x'],
    Hard: ['1.23x', '1.55x'],
    Hardcore: ['1.63x', '2.80x'],
};

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
    const [difficulty, setDifficulty] = useState('Easy');
    const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const chickenRef = useRef<HTMLDivElement>(null);
    // Fix: Destructure formatCurrency from useTranslations to make it available in the component.
    const { t, formatCurrency } = useTranslations();
    const { playSound } = useSound();

    const difficulties = ['Easy', 'Medium', 'Hard', 'Hardcore'];
    const predictionsUsed = user.predictionCount;
    const predictionsLeft = PREDICTION_LIMIT - predictionsUsed;
    
    const currentMultipliers = difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers];

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDifficultyOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                    {/* --- Scene Elements --- */}
                    <div className="dark-arch-background" style={{ left: '16.67%', transform: 'translateX(-50%)' }}></div>

                    <div className="vertical-divider" style={{ left: '33.33%' }}></div>
                    <div className="vertical-divider" style={{ left: '66.67%' }}></div>
                    
                    <div className="multiplier-circle" style={{ top: '18vh', left: '50%', transform: 'translateX(-50%)' }}>
                        {currentMultipliers[0]}
                    </div>
                    <div className="multiplier-circle" style={{ top: '18vh', left: '83.33%', transform: 'translateX(-50%)' }}>
                        {currentMultipliers[1]}
                    </div>
                    
                    <div className="wall-vent" style={{ bottom: '40px', left: '50%', transform: 'translateX(-50%)' }}></div>
                    <div className="wall-vent" style={{ bottom: '40px', left: '83.33%', transform: 'translateX(-50%)' }}></div>
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
                        <div className="panel-item full-width" style={{flexGrow: 2.5}}>Cashout before this value 👉</div>
                        <div className="panel-item" style={{flexGrow: 1.5}}></div>
                    </div>
                    <div className="panel-row">
                        <div className="relative w-full" ref={dropdownRef}>
                             {isDifficultyOpen && (
                                <div className="dropdown-menu">
                                    {difficulties.map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => {
                                                setDifficulty(d);
                                                setIsDifficultyOpen(false);
                                                playSound('buttonClick');
                                            }}
                                            className="dropdown-item"
                                        >
                                            <span>{d}</span>
                                            {difficulty === d && (
                                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    setIsDifficultyOpen((prev) => !prev);
                                    playSound('buttonClick');
                                }}
                                className="panel-item w-full flex justify-between items-center"
                                aria-haspopup="true"
                                aria-expanded={isDifficultyOpen}
                            >
                                <span>{difficulty}</span>
                                <svg className={`h-5 w-5 transform transition-transform duration-200 ${isDifficultyOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
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