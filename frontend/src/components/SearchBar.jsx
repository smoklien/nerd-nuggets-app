import React, { useState, useEffect } from 'react';

export function SearchBar({ onSearch }) {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        if (query.trim()) {
            onSearch(query);
        }
    };

    const handleKeydown = (event) => {
        if (event.key === 'Enter' && query.trim()) {
            onSearch(query);
        }
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search for publications"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeydown}
            />
            <button onClick={handleSearch} className='search-button'>Search</button>
        </div>
    );
}
