import React from 'react';

const testData = [
    {
        title: "Sample Title 1",
        text: "This is some sample text for the first result.",
        author: "John Doe",
        year: 2023,
    },
    {
        title: "Sample Title 2",
        text: "This is some sample text for the second result.",
        author: "Jane Smith",
        year: 2022,
    },
    {
        title: "Sample Title 2",
        text: "This is some sample text for the second result.",
        author: "Jane Smith",
        year: 2022,
    },
    {
        title: "Sample Title 2",
        text: "This is some sample text for the second result.",
        author: "Jane Smith",
        year: 2022,
    },
    {
        title: "Sample Title 2",
        text: "This is some sample text for the second result.",
        author: "Jane Smith",
        year: 2022,
    },
    {
        title: "Sample Title 2",
        text: "This is some sample text for the second result.",
        author: "Jane Smith",
        year: 2022,
    },
    {
        title: "Sample Title 2",
        text: "This is some sample text for the second result.",
        author: "Jane Smith",
        year: 2022,
    },
    {
        title: "Sample Title 2",
        text: "This is some sample text for the second result.",
        author: "Jane Smith",
        year: 2022,
    },
    {
        title: "Sample Title 2",
        text: "This is some sample text for the second result.",
        author: "Jane Smith",
        year: 2022,
    },
    {
        title: "Sample Title 2",
        text: "This is some sample text for the second result.",
        author: "Jane Smith",
        year: 2022,
    },
    // Add more sample data objects as needed
]

export function Results({ results }) {
    // Use the testData for results when no results are provided
    results = testData;

    return (
        <div className="results-section">
            {results.length > 0 ? (
                results.map((result, index) => (
                    <div key={index} className="result-card">
                        <div className="result-content">
                            <h3 className="result-title">{result.title}</h3>
                            <p className="result-text">{result.text}</p>
                        </div>

                        {/* <h4>{result.title}</h4>
                        <p>{result.description}</p> */}
                        
                        <div className="result-meta">
                            <span className="result-author">{result.author}</span>
                            <span className="result-year">{result.year}</span>
                        </div>
                    </div>
                ))
            ) : (
                <p>No results found. Try adjusting your search or filters.</p>
            )}
        </div>
    );
}
