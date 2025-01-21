import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PublicationDetails } from './PublicationDetails';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { MAX_DELAY_INDEX, STAGGER_DELAY } from '../constants';

import api from '../api';

const testData = [
    {
        "title": "K+ channels and gap junctions in the modulation of corporal smooth muscle tone.",
        "id": "https://openalex.org/W2418595429",
        "doi": null,
        "publication_year": 2000,
        "type": "article"
    }
]


export function Results({ query, filters}) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedPubId, setSelectedPubId] = useState(null);
    const [selectedSource, setSelectedSource] = useState('openalex');

    const debounceRef = useRef(null);
    const observerRef = useRef(null);
    const fetchLockRef = useRef(false);

    // Use the testData for results when no results are provided
    // results = testData;

    const handlePublicationClick = (pubId) => {
        setSelectedPubId(pubId.replace('https://openalex.org/', ''));
        setSelectedSource('openalex'); // Adjust source as needed
    };

    const handleCloseDetails = () => {
        setSelectedPubId(null);
    };

    /**
    * Fetches results from the API
    * @param {number} newPage - The page number to fetch
    * @param {boolean} reset - Whether to reset results (for new searches)
    */
    const fetchResults = useCallback(
        async (newPage = 1, reset = false) => {
            if (!query || fetchLockRef.current) return;
            console.log(`Fetching results for page ${newPage}, reset: ${reset}`); // Debug log

            fetchLockRef.current = true; // Lock to prevent duplicate requests

            if (reset) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }


            try {
                const response = await api.get(
                    `/api/search/?query=${query}&filter=${filters.category}&year=${filters.year}&page=${newPage}`
                );
                const data = response.data;

                if (reset) {
                    console.log("Setting results for new search:", data);
                    setResults(data); // Replace results for new search
                } else {
                    console.log("Appending results:", data);
                    setResults((prevResults) => [...prevResults, ...data]); // Append results
                }

                setHasMore(data.length > 0);
                setPage(newPage);
            } catch (error) {
                console.error('Error fetching results:', error);
            } finally {
                fetchLockRef.current = false; // Unlock after request
                reset ? setLoading(false) : setLoadingMore(false);
            }
        },
        [query, filters]
    );

    /**
    * Triggers fetching the next page of results
    */
    const loadMoreResults = useCallback(() => {
        if (!loading && !loadingMore && hasMore) {
            fetchResults(page + 1, false);
        }
    }, [fetchResults, loading, loadingMore, hasMore, page]);

    /**
    * Observes the "load more" trigger element
    */
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                console.log('IntersectionObserver triggered:', entries[0].isIntersecting);

                if (
                    entries[0].isIntersecting &&
                    hasMore &&
                    !loadingMore &&
                    !loading
                ) {
                    if (debounceRef.current) clearTimeout(debounceRef.current);

                    debounceRef.current = setTimeout(() => {
                        loadMoreResults();
                    }, 1000); // Add debounce to prevent rapid requests
                }
            },
            { threshold: 1.0 }
        );

        if (observerRef.current) observer.observe(observerRef.current);

        return () => {
            if (observerRef.current) observer.unobserve(observerRef.current);
        };
    }, [hasMore, loading, loadingMore, loadMoreResults]);

    /**
    * Fetch initial results when query or filters change
    */
    useEffect(() => {
        setPage(1);
        setResults([]);
        setHasMore(true);
        fetchResults(1, true);
    }, [query, filters, fetchResults]);

    return (
        <div className="results-section">
            {loading && <p className="loading-message">Loading results...</p>}
            {results.map((result, index) => (
                <div
                    key={index}
                    className="result-card"
                    onClick={() => handlePublicationClick(result.id)}
                    style={{
                        "--animation-delay": `${(index % MAX_DELAY_INDEX) * STAGGER_DELAY}s`, // Modulo for repeating delays
                    }}
                >
                    <div className="result-content">
                        <p
                            className="result-title"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(result.title || 'No Title Available') }}
                        ></p>
                        <p>
                            <a className="result-doi" href={result.doi} target="_blank" rel="noopener noreferrer">
                                {`DOI: ${result.doi || 'No DOI Available'}`}
                            </a>
                        </p>
                    </div>
                    <div className="result-meta">
                        <span className="result-type">{result.type || 'Unknown Type'}</span>
                        <span className="result-year">{result.publication_year || 'Unknown Year'}</span>
                    </div>
                </div>
            ))}
            {selectedPubId && (
                <PublicationDetails
                    pubId={selectedPubId}
                    source={selectedSource}
                    onClose={handleCloseDetails}
                />
            )}
            {loadingMore && <p className="loading-more-message">Loading more results...</p>}
            {!hasMore && !loadingMore && results.length > 0 && (
                <p className="end-message">No more results available.</p>
            )}
            {!hasMore && results.length === 0 && (
                <p className="no-results-message">No results found. Try a different search.</p>
            )}
            <div ref={observerRef} className="observer-trigger" />
        </div>
    );
}