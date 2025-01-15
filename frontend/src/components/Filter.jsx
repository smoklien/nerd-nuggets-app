import React from 'react';

export function Filter({ filters, onFilterChange }) {
    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        onFilterChange(name, value);
    };

    return (
        <div className="filter-section">
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
                    onChange={handleFilterChange} />
            </label>
        </div>
    );
}
