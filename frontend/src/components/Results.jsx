import React from 'react';

export function Results({ results }) {
    return (
        <div className="results-section">
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
    );
}
