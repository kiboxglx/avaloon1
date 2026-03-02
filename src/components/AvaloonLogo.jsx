import React from 'react';
import logo from '../assets/logo.png';

const AvaloonLogo = ({ className = "h-10" }) => {
    return (
        <div className={`flex items-center ${className}`}>
            <img src={logo} alt="Avaloon Logo" className="h-full w-auto object-contain" />
        </div>
    );
};

export default AvaloonLogo;
