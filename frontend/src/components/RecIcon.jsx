import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RecIcon.css';

export function RecIcon({ isActive, onToggle }) {
    const navigate = useNavigate();

    const handleRecClick = () => {
        navigate("/rec");
    };

    return (
        <img src="/path/to/rec-icon.png" alt="Recs" className="icon" onClick={handleRecClick} />
    )
}
