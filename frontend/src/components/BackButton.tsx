// components/BackButton.tsx

import React from 'react';

interface BackButtonProps {
    onClick: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="back-button bg-transparent text-black p-2 rounded hover:bg-gray-200 transition duration-300 text-xl font-bold"
        >
            &lt; {/* This represents the back icon */}
        </button>
    );
};

export default BackButton;
