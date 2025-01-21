import React, { useState, useEffect } from 'react';
import api from '../api';
import '../styles/PublicationDetails.css';
import { sanitizeHtml } from '../utils/sanitizeHtml';

export function PublicationDetails({ pubId, source, onClose, layout = "fixed" }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [subscribedAuthors, setSubscribedAuthors] = useState(new Set());

    useEffect(() => {
        if (!pubId) return;

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/api/pub/?pub_id=${pubId}&source=${source}`);
                const { liked, disliked, saved, subscribed_authors  = [] } = response.data;

                setSubscribedAuthors(new Set(subscribed_authors ));
                setDetails(response.data);
                setLiked(liked || false);
                setDisliked(disliked || false);
                setSaved(saved || false);
            } catch (error) {
                console.error('Error fetching publication details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [pubId, source]);

    const handleAction = async (action, authorId = null) => {
        try {
            const body = { how: action };
            if (authorId) body.author_id = authorId;

            await api.post(`/api/pub/?pub_id=${pubId}&source=${source}`, body);
            switch (action) {
                case "like":
                    if (!liked) {
                        setLiked(true);
                        setDisliked(false);
                    } else {
                        setLiked(false);
                    }
                    break;
                case "dislike":
                    if (!disliked) {
                        setDisliked(true);
                        setLiked(false);
                    } else {
                        setDisliked(false);
                    }
                    break;
                case "save":
                    setSaved((prev) => !prev);
                    break;
                case "subscribe":
                    if (authorId) {
                        setSubscribedAuthors((prev) => new Set([...prev, authorId]));
                    }
                    break;
                case "unsubscribe":
                    if (authorId) {
                        setSubscribedAuthors((prev) => {
                            const updated = new Set(prev);
                            updated.delete(authorId);
                            return updated;
                        });
                    }
                    break;
                default:
                    console.warn(`Unknown action: ${action}`);
            }
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
        }
    };

    if (!pubId) return null;


    return (
        <div className={`publication-details-panel ${layout}`}>
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
                            className='abstract'
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(details.abstract || 'No Abstract Available') }}
                        ></p>
                        <div className="meta-actions">
                            <button
                                className={`meta-button like-button ${liked ? "active" : ""}`}
                                onClick={() => handleAction("like")}
                            >
                                {liked ? "Liked" : "Like"}
                            </button>
                            <button
                                className={`meta-button dislike-button ${disliked ? "active" : ""}`}
                                onClick={() => handleAction("dislike")}
                            >
                                {disliked ? "Disliked" : "Dislike"}
                            </button>
                            <button
                                className={`meta-button ${saved ? "active" : ""}`}
                                onClick={() => handleAction("save")}
                            >
                                {saved ? "Saved" : "Save"}
                            </button>
                        </div>
                        <div className="authors-section">
                            <strong>Authors:</strong>
                            <ul>
                                {Object.entries(details.author).map(([id, name]) => (
                                    <li key={id} className="author-item">
                                        <a href={id} target="_blank" rel="noopener noreferrer">
                                            {name}
                                        </a>
                                        {id && (
                                            <button
                                                className={`subscribe-button ${
                                                    subscribedAuthors.has(id) ? "subscribed" : "not-subscribed"
                                                }`}
                                                onClick={() =>
                                                    handleAction(
                                                        subscribedAuthors.has(id) ? "unsubscribe" : "subscribe",
                                                        id
                                                    )
                                                }
                                            >
                                                {subscribedAuthors.has(id) ? "Unsubscribe" : "Subscribe"}
                                            </button>
                                        )}
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
