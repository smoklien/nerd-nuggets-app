import React, { useState, useEffect } from 'react';
import api from '../api';
import '../styles/PublicationDetails.css';
import { sanitizeHtml } from '../utils/sanitizeHtml';

export function PublicationDetails({ pubId, source, onClose }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!pubId) return;

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/api/pub/?pub_id=${pubId}&source=${source}`);
                setDetails(response.data);
            } catch (error) {
                console.error('Error fetching publication details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [pubId, source]);

    if (!pubId) return null;

    return (
        <div className="publication-details-panel">
            <button className="close-button" onClick={onClose}>
                ✖
            </button>
            {loading ? (
                <p className="loading-message">Loading details...</p>
            ) : (
                details && (
                    <div className="publication-details-content">
                        <h2
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(details.title || 'No Title Available') }}
                        ></h2>
                        <p>
                            <strong>DOI:</strong>{' '}
                            <a href={details.doi} target="_blank" rel="noopener noreferrer">
                                {`DOI: ${details.doi || 'No DOI Available'}`}
                            </a>
                        </p>
                        <p>
                            <strong>Publication Year:</strong> {details.publication_year}
                        </p>
                        <p>
                            <strong>Abstract:</strong>
                        </p>
                        <p
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(details.abstract || 'No Abstract Available') }}
                        ></p>
                        <div className="authors-section">
                            <strong>Authors:</strong>
                            <ul>
                                {Object.entries(details.author).map(([id, name]) => (
                                    <li key={id}>
                                        <a href={id} target="_blank" rel="noopener noreferrer">
                                            {name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
