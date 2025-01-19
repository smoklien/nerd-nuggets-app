import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Profile.css";

function Profile() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSave = async (event) => {
        setLoading(true);
        event.preventDefault();

        try {
            await api.put("/api/profile", { name, password }); // Adjust API endpoint as needed
            alert("Profile updated successfully!");
            navigate("/");
        } catch (error) {
            alert("Error updating profile: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/");
    };

    return (
        <div className="form-wrapper">
            <form onSubmit={handleSave} className="form-container">
                <h1>Edit Profile</h1>
                <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="New Name"
                    className="form-input"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="New Password"
                    className="form-input"
                />
                <div className="button-group">
                    <button
                        type="button"
                        className="form-button cancel-button"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="form-button"
                        disabled={loading || (!name && !password)}
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Profile;
