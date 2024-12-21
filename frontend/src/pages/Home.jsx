import '../styles/Home.css';
import React, { useState } from 'react';

// Components
function Header() {
    return (
        <header className="header">
            <h1>Scientific Aggregation Service</h1>
            <p>Explore, search, and filter scientific publications with ease.</p>
        </header>
    );
}

function SearchBar({ onSearch }) {
    const handleSearch = (event) => {
        if (event.key === 'Enter') {
            onSearch(event.target.value);
        }
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search for scientific publications..."
                onKeyDown={handleSearch}
            />
        </div>
    );
}

function Filter({ filters, onFilterChange }) {
    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        onFilterChange(name, value);
    };

    return (
        <div className="filter-section">
            <h3>Filters</h3>
            <label>
                Category:
                <select name="category" onChange={handleFilterChange}>
                    <option value="">All</option>
                    <option value="biology">Biology</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                </select>
            </label>
            <label>
                Year:
                <input
                    type="number"
                    name="year"
                    placeholder="e.g., 2024"
                    onChange={handleFilterChange}
                />
            </label>
        </div>
    );
}

function Notification({ message, onClose }) {
    return (
        <div className="notification">
            <p>{message}</p>
            <button onClick={onClose}>Close</button>
        </div>
    );
}

function Results({ results }) {
    return (
        <div className="results-section">
            <h3>Search Results</h3>
            <div className="results-list">
                {results.length > 0 ? (
                    results.map((result, index) => (
                        <div key={index} className="result-item">
                            <h4>{result.title}</h4>
                            <p>{result.description}</p>
                        </div>
                    ))
                ) : (
                    <p>No results found. Try adjusting your search or filters.</p>
                )}
            </div>
        </div>
    );
}

function Footer() {
    return (
        <footer className="footer">
            <p>&copy; 2024 NerdNuggets. All rights reserved.</p>
        </footer>
    );
}

// Main Home Component
function Home() {
    const [filters, setFilters] = useState({ category: '', year: '' });
    const [notification, setNotification] = useState(null);
    const [results, setResults] = useState([]);


    const handleSearch = (query) => {
        console.log("Search query:", query);
        // Example notification logic
        setNotification(`Search executed for query: "${query}"`);
        // Mock results for demonstration
        setResults([
            { title: "Publication 1", description: "Description of publication 1." },
            { title: "Publication 2", description: "Description of publication 2." },
            { title: "Publication 3", description: "Description of publication 3." },
        ]);
    };

    const handleFilterChange = (name, value) => {
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
        console.log("Filters updated:", { ...filters, [name]: value });
    };

    const closeNotification = () => {
        setNotification(null);
    };

    return (
        <div className="home-page">
            <Header />
            <main>
                <SearchBar onSearch={handleSearch} />
                <Filter filters={filters} onFilterChange={handleFilterChange} />
                {notification && (
                    <Notification message={notification} onClose={closeNotification} />
                )}
                <Results results={results} />
                <section className="info-section">
                    <h2>About the Service</h2>
                    <p>
                        This platform aggregates scientific publications from multiple sources,
                        providing a simple and accessible way to search and filter scholarly content.
                    </p>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default Home;
