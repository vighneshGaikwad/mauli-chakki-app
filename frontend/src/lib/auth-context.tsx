import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authAPI } from '@/lib/api'

/*
 🎓 LESSON: React Context for Authentication
 
 Context is React's way of sharing data across components
 WITHOUT passing props through every level.
 
 Problem without context:
   App → SiteHeader → needs user info
   App → ProductGrid → ProductCard → doesn't need user info
   
   You'd have to pass `user` through ProductGrid even though
   it doesn't use it. This is called "prop drilling" and it's messy.
 
 Solution with context:
   <AuthProvider> wraps the whole app → ANY component can call
   useAuth() to access user, login, logout etc.
*/

interface User {
    id: string
    mobile: string
    name: string
    role: 'user' | 'admin'
}

interface AuthContextType {
    user: User | null
    token: string | null
    isLoading: boolean
    login: (token: string, user: User) => void
    logout: () => void
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    /*
     🎓 LESSON: useEffect for initial load
     
     When the app first opens, we check if there's a saved token 
     in localStorage. If there is, we call the /me endpoint to get
     the user's info. This is how "Stay logged in" works — you
     don't have to log in again after refreshing the page.
    */
    useEffect(() => {
        const savedToken = localStorage.getItem('chakki-token')
        if (savedToken) {
            setToken(savedToken)
            // Verify the token is still valid by calling /me
            authAPI.getMe()
                .then((userData) => {
                    setUser({
                        id: userData._id,
                        mobile: userData.mobile,
                        name: userData.name,
                        role: userData.role as 'user' | 'admin',
                    })
                })
                .catch(() => {
                    // Token is expired or invalid — clear it
                    localStorage.removeItem('chakki-token')
                    setToken(null)
                })
                .finally(() => setIsLoading(false))
        } else {
            setIsLoading(false)
        }
    }, [])

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('chakki-token', newToken)
        setToken(newToken)
        setUser(newUser)
    }

    const logout = () => {
        localStorage.removeItem('chakki-token')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                logout,
                isAdmin: user?.role === 'admin',
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

/*
 🎓 LESSON: Custom Hook
 
 useAuth() is a custom hook that makes it easy to use auth context.
 Instead of writing useContext(AuthContext) everywhere,
 you just write useAuth().
 
 Usage in any component:
   const { user, logout, isAdmin } = useAuth()
*/
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
