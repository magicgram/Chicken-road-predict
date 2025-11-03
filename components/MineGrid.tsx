
import React from 'react';
import type { GridCellState } from '../types';
import BombIcon from './icons/BombIcon';
import StarIcon from './icons/StarIcon';

interface MineGridProps {
    gridState: GridCellState[];
}

const MineGrid: React.FC<MineGridProps> = ({ gridState }) => {
    
    const getCellClasses = (state: GridCellState) => {
        const baseClasses = 'w-full h-full rounded-lg flex items-center justify-center transition-all duration-300';

        switch (state) {
            case 'star':
                // Updated to match image: yellow/orange gradient with white border.
                return `${baseClasses} bg-gradient-to-b from-yellow-400 to-orange-500 border-2 border-white/90`;
            case 'bomb':
                // Updated to match image: black circle on the grid background. Cell itself is transparent.
                return `${baseClasses} bg-transparent`;
            case 'hidden':
            default:
                // This is the "before" state, which is correct.
                return `${baseClasses} bg-[#373d70] shadow-[inset_0_3px_5px_rgba(0,0,0,0.5)] cursor-pointer hover:bg-[#454c8c]`;
        }
    };

    const renderCellContent = (state: GridCellState) => {
        switch (state) {
            case 'bomb':
                return <BombIcon />;
            case 'star':
                return <StarIcon />;
            case 'hidden':
            default:
                // This creates the dark, indented circle inside the hidden cells
                return <div className="w-10 h-10 bg-[#2a2f58] rounded-full shadow-[inset_0_2px_3px_rgba(0,0,0,0.6)]"></div>;
        }
    };

    return (
        // Updated grid background to a lighter, flatter blue to match the image.
        <div className="grid grid-cols-5 gap-2 aspect-square p-3 bg-[#48718f] rounded-lg">
            {gridState.map((state, index) => (
                <div
                    key={index}
                    className={getCellClasses(state)}
                >
                    {renderCellContent(state)}
                </div>
            ))}
        </div>
    );
};

export default MineGrid;
