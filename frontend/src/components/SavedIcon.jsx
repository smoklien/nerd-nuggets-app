import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SavedIcon.css';

export function SavedIcon({ isActive, onToggle }) {
    const navigate = useNavigate();

    const handleSaveClick = () => {
        navigate("/saved");
    };

    return (
        <img src="/path/to/saved-icon.png" alt="Saved" className="icon" onClick={handleSaveClick} />
    )
}
