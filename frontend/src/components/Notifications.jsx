import React, { useState, useEffect } from 'react';
import '../styles/Notifications.css';

export function Notifications({ isActive, onToggle }) {
    const [notifications, setNotifications] = useState([]);
    // const [isDropdownOpen, setIsDropdownOpen] = useState(false);


    useEffect(() => {
        // Fetch notifications (recent publications from followed authors)
        const fetchNotifications = async () => {
            try {
                const response = await fetch('/api/notifications');
                const data = await response.json();
                setNotifications(data);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []);

    // const toggleDropdown = () => {
    //     setIsDropdownOpen(!isDropdownOpen);
    // };

    return (
        <div className="notifications">
            <button className="notification-bell" onClick={onToggle}>
                <span className="bell-icon">🔔</span>
                {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
            </button>
            {isActive && (
                <div className="dropdown-menu">
                    {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                            <div key={index} className="notification-item">
                                <div className="notification-details">
                                    <p className="notification-title">{notification.title}</p>
                                    <p className="notification-timestamp">{notification.timestamp}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-notifications">No new notifications</p>
                    )}
                </div>
            )}
        </div>
    );
}
