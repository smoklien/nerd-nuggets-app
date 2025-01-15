import { useState } from "react";
import api from '../api';
import { useNavigate } from 'react-router-dom'
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import '../styles/Form.css'

function Form({ route, method }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const name = method === 'login' ? 'Login' : 'Register'

    const handleSubmit = async (event) => {
        setLoading(true)
        event.preventDefault()

        try {
            const response = await api.post(route, { username, password })

            if (method === 'login') {
                const { access, refresh } = response.data
                localStorage.setItem(ACCESS_TOKEN, access)
                localStorage.setItem(REFRESH_TOKEN, refresh)
                navigate('/')
            } else {
                navigate('/login')
            }
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="form-container">
                <h1>{name}</h1>
                <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Username"
                    className="form-input"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    className="form-input"
                />
                <button type="submit" className="form-button" disabled={loading}>
                    {loading ? 'Loading...' : name}
                </button>
            </form>
            <div className="form-toggle">
                {method === 'login' ? (
                    <p>
                        Don't have an account?{' '}
                        <span onClick={() => navigate('/register')} className="form-link">
                            Register here
                        </span>
                    </p>
                ) : (
                    <p>
                        Already have an account?{' '}
                        <span onClick={() => navigate('/login')} className="form-link">
                            Login here
                        </span>
                    </p>
                )}
            </div>
        </div>
    );

    // return <form onSubmit={handleSubmit} className="form-container">
    //     <h1>{name}</h1>
    //     <input
    //         type="text"
    //         value={username}
    //         onChange={(event) => setUsername(event.target.value)}
    //         placeholder="Username"
    //         className="form-input"
    //     />
    //     <input
    //         type="password"
    //         value={password}
    //         onChange={(event) => setPassword(event.target.value)}
    //         placeholder="Password"
    //         className="form-input"
    //     />
    //     <button type="submit" className="form-button">
    //         {name}
    //     </button> 
    // </form>
}

export default Form