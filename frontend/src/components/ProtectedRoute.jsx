import { Navigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

import api from '../api'
import { REFRESH_TOKEN, ACCESS_TOKEN } from '../constants'
import { useState, useEffect } from 'react';

function ProtectedRoute({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null)
    
    useEffect(() => {
        authenticateUser().catch(() => setIsAuthenticated(false) )
    }, [])

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN)

        try {
            const response = await api.post('/api/token/refresh/', { refresh: refreshToken })

            if (response.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, response.data.access)
                setIsAuthenticated(true)
            } else {
                setIsAuthenticated(false)
            }
        } catch (error) {
            console. log(error)
            setIsAuthenticated(false)
        }
    }

    const authenticateUser = async () => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN)

        if (!accessToken) {
            setIsAuthenticated(false)
            return
        }

        const decodedToken = jwtDecode(accessToken)
        const tokenExpiration = decodedToken.exp
        const currentTime = Date.now() / 1000

        if (tokenExpiration < currentTime) {
            await refreshAccessToken()
        } else {
            setIsAuthenticated(true)
        }
    }

    if (isAuthenticated === null) {
        return <div>Loading...</div>
    }

    return isAuthenticated ? children : <Navigate to='/login' />
}

export default ProtectedRoute
