import React, { useState, useEffect } from 'react';

import '../styles/Home.css';
import api from '../api';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { Filter } from '../components/Filter';
import { Notification } from '../components/Notification';
import { Results } from '../components/Results';
import { Footer } from '../components/Footer';


function Home() {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({ category: '', year: '' });
    const [notification, setNotification] = useState(null);
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const fetchResults = (query) => {
        api.get(
            `/api/search?query=${encodeURIComponent(query)}
            &category=${filters.category}
            &year=${filters.year}`

        )
            .then((response) => response.json())
            .then((data) => setResults(data.publications))
            .catch((error) => console.error("Error:", error));
    };

    useEffect(() => {
        fetchResults();
    }, [query, filters]);

    const handleSearch = (query) => {
        setQuery(query);
        setNotification(`Search executed for query: "${query}"`);
    };

    const handleFilterChange = (name, value) => {//+
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
        setNotification('Filters updated', { ...filters, [name]: value });
    };

    const closeNotification = () => {
        setNotification(null);
    };

    return (
        <div className="home-page">
            <aside className="sidebar">
                <Filter filters={filters} onFilterChange={handleFilterChange} />
                {notification && (
                    <Notification message={notification} onClose={closeNotification} />
                )}
            </aside>
            <main className="content">
                <Header />
                <SearchBar onSearch={handleSearch} />
                <Results results={results} />
                <section className="info-section">
                    <h2>About the Service</h2>
                    <p>
                        This platform aggregates scientific publications from multiple sources,
                        providing a simple and accessible way to search and filter scholarly content.
                    </p>
                </section>
            </main>
        </div>
    );
}

export default Home;
