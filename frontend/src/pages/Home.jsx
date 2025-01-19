import React, { useState, useEffect, useCallback } from 'react';

import '../styles/Home.css';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { Filter } from '../components/Filter';
import { Notifications } from '../components/Notifications';
import { ProfileMenu } from '../components/ProfileMenu';
import { Results } from '../components/Results';
import { InfoSection } from '../components/InfoSection';


function Home() {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({ category: '', year: '' });
    const [showResults, setShowResults] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const handleSearch = (query) => {
        setQuery(query);
        setShowResults(true);
    };
 
    const handleFilterChange = (name, value) => {
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };
  
    const handleDropdownToggle = (dropdownName) => {
        setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
    };

    const closeDropdown = () => {
        setActiveDropdown(null);
    };

    return (
        <div className="home-page" onClick={closeDropdown}>
            <aside className="sidebar">
                <Filter filters={filters} onFilterChange={handleFilterChange} />
            </aside>
            <main className={`content ${showResults ? 'results-mode' : ''}`}>
                {!showResults && <Header />}
                <SearchBar onSearch={handleSearch} />
                {showResults && <Results query={query} filters={filters} />}
                {!showResults && <InfoSection />}
            </main>
            <header className="top-bar" onClick={(e) => e.stopPropagation()}>
                <Notifications
                    isActive={activeDropdown === 'notifications'}
                    onToggle={() => handleDropdownToggle('notifications')}
                />
                <ProfileMenu
                    isActive={activeDropdown === 'profile'}
                    onToggle={() => handleDropdownToggle('profile')}
                />
            </header>
        </div>
    );
}

export default Home;
