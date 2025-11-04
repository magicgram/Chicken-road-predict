import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { useSound } from '../hooks/useSound';
import { verificationService } from '../services/verificationService';

// --- Constants ---
const PREDICTION_LIMIT = 15;
// @ts-ignore - VITE_AFFILIATE_LINK is injected by the build process
const AFFILIATE_LINK = import.meta.env.VITE_AFFILIATE_LINK || 'https://1waff.com/?p=YOUR_CODE_HERE';

// --- Prediction Data with Steps ---
interface PredictionData {
    value: string;
    steps: number;
}

const predictionDataByDifficulty: { [key: string]: PredictionData[] } = {
    Easy: [
        { value: "1.03x", steps: 1 }, { value: "1.07x", steps: 2 }, { value: "1.12x", steps: 3 },
        { value: "1.17x", steps: 4 }, { value: "1.23x", steps: 5 }, { value: "1.29x", steps: 6 },
        { value: "1.36x", steps: 7 }, { value: "1.44x", steps: 8 }, { value: "1.53x", steps: 9 },
        { value: "1.63x", steps: 10 }, { value: "1.75x", steps: 11 }
    ],
    Medium: [
        { value: "1.12x", steps: 1 }, { value: "1.28x", steps: 2 }, { value: "1.47x", steps: 3 },
        { value: "1.70x", steps: 4 }, { value: "1.98x", steps: 5 }, { value: "2.33x", steps: 6 },
        { value: "2.76x", steps: 7 }
    ],
    Hard: [
        { value: "1.23x", steps: 1 }, { value: "1.55x", steps: 2 }, { value: "1.98x", steps: 3 },
        { value: "2.56x", steps: 4 }, { value: "3.36x", steps: 5 }, { value: "4.49x", steps: 6 }
    ],
    Hardcore: [
        { value: "1.63x", steps: 1 }, { value: "2.80x", steps: 2 }, { value: "4.95x", steps: 3 },
        { value: "9.08x", steps: 4 }
    ],
};


// --- Decorative Multiplier Values based on Difficulty ---
const difficultyMultipliers: { [key: string]: string[] } = {
    Easy: ['1.03X', '1.07X'],
    Medium: ['1.12X', '1.28X'],
    Hard: ['1.23X', '1.55X'],
    Hardcore: ['1.63X', '2.80X'],
};

// --- Component Props Interface ---
interface PredictorPageProps {
    user: User;
    onUpdateUser: (user: User) => void;
}

// --- Component ---
const PredictorPage: React.FC<PredictorPageProps> = ({ user, onUpdateUser }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [prediction, setPrediction] = useState<{ value: string; accuracy: number; steps: number } | null>(null);
    const [lastPredictionValue, setLastPredictionValue] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState('Easy');
    const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const chickenRef = useRef<HTMLDivElement>(null);
    const { t, formatCurrency } = useTranslations();
    const { playSound } = useSound();

    const difficulties = ['Easy', 'Medium', 'Hard', 'Hardcore'];
    const predictionsUsed = user.predictionCount;
    const predictionsLeft = PREDICTION_LIMIT - predictionsUsed;
    const displayedMultipliers = difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers] || difficultyMultipliers.Easy;

    
    useEffect(() => {
        if (prediction && !isGenerating) {
            playSound('predictionReveal');
        }
    }, [prediction, isGenerating, playSound]);

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
        if (predictionsLeft <= 0 || user.awaitingDeposit || isGenerating || prediction) {
            if(!isGenerating && !prediction) onUpdateUser({ ...user, awaitingDeposit: true });
            return;
        }
        
        playSound('getSignal');
        setIsGenerating(true);

        if (chickenRef.current) {
            chickenRef.current.classList.add('running');
            playSound('chickenRun');
        }

        setTimeout(() => {
            const predictionOptions = predictionDataByDifficulty[difficulty] || predictionDataByDifficulty.Easy;
            
            let selectedPrediction: PredictionData;
            do {
                selectedPrediction = predictionOptions[Math.floor(Math.random() * predictionOptions.length)];
            } while (predictionOptions.length > 1 && selectedPrediction.value === lastPredictionValue);
            
            const minAccuracy = 70;
            const maxAccuracy = 99;
            const accuracy = Math.floor(Math.random() * (maxAccuracy - minAccuracy + 1)) + minAccuracy;

            setPrediction({ 
                value: selectedPrediction.value, 
                accuracy, 
                steps: selectedPrediction.steps 
            });
            setLastPredictionValue(selectedPrediction.value);
            onUpdateUser({ ...user, predictionCount: user.predictionCount + 1 });
            
            setIsGenerating(false);
            
            // The chicken is hidden via conditional rendering when `prediction` is set,
            // so we only need to manage the animation class removal for the next run.
            setTimeout(() => {
                if (chickenRef.current) {
                    chickenRef.current.classList.remove('running');
                }
            }, 1000);

        }, 3000); 
    };

    const handleNextRound = () => {
        playSound('nextRound');
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
                 <div className="text-center p-8 dark-card max-w-lg mx-auto">
                     <h3 className="text-2xl font-bold text-white mb-3 page-title">{t('predictor.limitTitle')}</h3>
                     <p className="text-gray-300 mb-6">{t('predictor.limitSubtitle')}</p>
                     <div className="bg-black/20 border-2 border-indigo-500/50 rounded-lg p-4 mb-6">
                         <p className="font-semibold text-white">{t('predictor.whyDeposit')}</p>
                         <p className="text-sm text-gray-300 mt-1">{depositInfo}</p>
                     </div>
                     <button
                        onClick={handleDeposit}
                        className="w-full btn-primary"
                    >
                        {t('predictor.depositNow')}
                    </button>
                    <p className="text-xs text-gray-400 mt-4">{t('predictor.depositNote')}</p>
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
                    
                    {/* Decorative Multipliers - Shown until a prediction result is displayed */}
                    {!prediction && (
                        <>
                           <div className="static-multiplier-container" style={{ left: '50%' }}>
                                <div className="static-multiplier-circle">{displayedMultipliers[0]}</div>
                                <div className="wall-vent"></div>
                            </div>
                            <div className="static-multiplier-container" style={{ left: '83.33%' }}>
                                <div className="static-multiplier-circle">{displayedMultipliers[1]}</div>
                                <div className="wall-vent"></div>
                            </div>
                        </>
                    )}

                    {prediction && !isGenerating && (
                        <div className="result-display-circle-container">
                            <div className="result-display-circle">
                                <span>{prediction.value}</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="floor"></div>
                
                {/* Hen is hidden when a prediction is shown */}
                {!prediction && (
                    <div ref={chickenRef} className="chicken">
                        <img 
                            src="https://i.postimg.cc/mDw7YjT7/bg-edited-gif-f6418d08-29c7-48f8-ae03-bca18b3d46be-GIFSolo-20251103-113356.gif" 
                            alt="Running Chicken" 
                            className="w-full h-full object-contain"
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    </div>
                )}
            </div>

            <footer className="game-footer-dark">
                <div className="control-panel">
                    <div className="panel-row">
                        <div className="panel-item">Accuracy - {prediction ? `${prediction.accuracy}%` : ''}</div>
                        <div className="panel-item">Steps - {prediction ? prediction.steps : ''}</div>
                    </div>
                    <div className="panel-row">
                        <div className="panel-item full-width" style={{flexGrow: 2.5}}>Cashout before this value 👉</div>
                        <div className="panel-item" style={{flexGrow: 1.5}}>{prediction ? prediction.value : ''}</div>
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
                                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
                        onClick={prediction ? handleNextRound : handleGetSignal}
                        disabled={isGenerating}
                        className="btn-get-signal"
                    >
                        {isGenerating ? t('predictor.generating') : (prediction ? t('predictor.nextRound') : t('predictor.getSignal'))}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default PredictorPage;