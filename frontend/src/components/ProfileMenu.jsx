import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfileMenu.css';

export function ProfileMenu({ isActive, onToggle }) {
    // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // const toggleDropdown = () => {
    //     setIsDropdownOpen(!isDropdownOpen);
    // };

    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/logout');
    };
    
    const handleProfile = () => {
        navigate('/profile');
    };

    return (
        <div className="profile-menu">
            <button className="profile-icon" onClick={onToggle}>
                <span className="profile-initial">S</span> {/* Replace 'S' with user's initial */}
            </button>
            {isActive && (
                <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={handleProfile}>
                        My Profile
                    </div>
                    <div className="dropdown-item" onClick={handleLogout}>
                        Log Out
                    </div>
                </div>
            )}
        </div>
    );
}
