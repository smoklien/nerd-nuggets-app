import React, { useState, useEffect } from "react";
import api from "../api";
import { PublicationDetails } from "../components/PublicationDetails";
import "../styles/Rec.css";

function Rec() {
    const [publication, setPublication] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchRecommendation = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/rec/");
            setPublication(response.data);
        } catch (error) {
            console.error("Error fetching recommendation:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendation();
    }, []);

    return (
        <div className="recommendation-page">
            <button className="back-button" onClick={() => window.history.back()}>
                ← Back
            </button>
            {loading ? (
                <p className="loading-message">Fetching your recommendation...</p>
            ) : (
                publication && (
                    <PublicationDetails
                        pubId={publication.id.replace("https://openalex.org/", "")}
                        source="openalex"
                        onClose={() => {}}
                        layout="relative" // Specify inline layout
                    />
                )
            )}
            <button
                className="new-recommendation-button"
                onClick={fetchRecommendation}
                disabled={loading}
            >
                {loading ? "Loading..." : "Recommend New Publication"}
            </button>
        </div>
    );
}

export default Rec;
