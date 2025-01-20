import React, { useState, useEffect } from 'react';
import { PublicationDetails } from '../components/PublicationDetails';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import api from '../api';
import '../styles/Saved.css';

function Saved() {
    const [savedPublications, setSavedPublications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPubId, setSelectedPubId] = useState(null);
    const [selectedSource, setSelectedSource] = useState('openalex');

    useEffect(() => {
        const fetchSavedPublications = async () => {
            setLoading(true);
            try {
                const response = await api.get('/api/saved');
                setSavedPublications(response.data);
            } catch (error) {
                console.error('Error fetching saved publications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedPublications();
    }, []);

    const handlePublicationClick = (pubId) => {
        setSelectedPubId(pubId.replace('https://openalex.org/', ''));
        setSelectedSource('openalex');
    };

    const handleCloseDetails = () => {
        setSelectedPubId(null);
    };

    return (
        <div className="saved-publications-section">
            <h1>Saved Publications</h1>
            {loading ? (
                <p className="loading-message">Loading saved publications...</p>
            ) : savedPublications.length > 0 ? (
                savedPublications.map((publication, index) => (
                    <div
                        key={index}
                        className="result-card"
                        onClick={() => handlePublicationClick(publication.id)}
                    >
                        <div className="result-content">
                            <p
                                className="result-title"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(publication.title || 'No Title Available') }}
                            ></p>
                            <p>
                                <a className="result-doi" href={publication.doi} target="_blank" rel="noopener noreferrer">
                                    {`DOI: ${publication.doi || 'No DOI Available'}`}
                                </a>
                            </p>
                        </div>
                        <div className="result-meta">
                            <span className="result-type">{publication.type || 'Unknown Type'}</span>
                            <span className="result-year">{publication.publication_year || 'Unknown Year'}</span>
                        </div>
                    </div>
                ))
            ) : (
                <p className="no-results-message">You have no saved publications.</p>
            )}
            {selectedPubId && (
                <PublicationDetails
                    pubId={selectedPubId}
                    source={selectedSource}
                    onClose={handleCloseDetails}
                />
            )}
        </div>
    );
}

export default Saved;