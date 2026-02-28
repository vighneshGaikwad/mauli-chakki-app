import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { authAPI } from '@/lib/api'

/*
 🎓 LESSON: Simple Login/Register Page
 
 This page handles both login and registration:
 - User enters mobile number and password
 - Can toggle between Login and Register modes
 - If mobile matches ADMIN_MOBILE, user gets admin access
*/

export function LoginPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [mobile, setMobile] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login, user } = useAuth()
    const navigate = useNavigate()

    // If already logged in, redirect
    useEffect(() => {
        if (user) {
            navigate(user.role === 'admin' ? '/admin' : '/', { replace: true })
        }
    }, [user, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validate mobile number
        if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
            setError('Please enter a valid 10-digit mobile number')
            return
        }

        // Validate password
        if (password.length < 4) {
            setError('Password must be at least 4 characters')
            return
        }

        setLoading(true)
        try {
            let result
            if (mode === 'register') {
                result = await authAPI.register(mobile, password, name)
            } else {
                result = await authAPI.login(mobile, password)
            }

            // Save token and user info
            login(result.token, {
                id: result.user.id,
                mobile: result.user.mobile,
                name: result.user.name,
                role: result.user.role as 'user' | 'admin',
            })

            // Redirect based on role
            navigate(result.user.role === 'admin' ? '/admin' : '/', { replace: true })
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/50 px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <img
                        src="/images/logo.png"
                        alt="Mauli Chakki"
                        className="mx-auto h-16 w-auto object-contain"
                    />
                    <h1
                        className="mt-4 text-3xl font-medium"
                        style={{ fontFamily: "'Rozha One', sans-serif", color: 'var(--header-color)' }}
                    >
                        माऊली चक्की फ्रेश आटा
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Freshly milled, just for you
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                    <h2 className="text-lg font-bold text-card-foreground">
                        {mode === 'login' ? 'Log in' : 'Create Account'}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {mode === 'login' 
                            ? 'Enter your credentials to continue' 
                            : 'Register with your mobile number'}
                    </p>

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        {/* Name field (only for register) */}
                        {mode === 'register' && (
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-1.5 block text-sm font-medium text-card-foreground"
                                >
                                    Name (optional)
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60"
                                />
                            </div>
                        )}

                        {/* Mobile Number */}
                        <div>
                            <label
                                htmlFor="mobile"
                                className="mb-1.5 block text-sm font-medium text-card-foreground"
                            >
                                Mobile Number
                            </label>
                            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                <span className="text-sm font-medium text-muted-foreground">+91</span>
                                <div className="h-5 w-px bg-border" />
                                <input
                                    id="mobile"
                                    type="tel"
                                    maxLength={10}
                                    value={mobile}
                                    onChange={(e) => {
                                        setMobile(e.target.value.replace(/\D/g, ''))
                                        setError('')
                                    }}
                                    placeholder="Enter 10-digit number"
                                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-sm font-medium text-card-foreground"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setError('')
                                }}
                                placeholder="Enter password (min 4 chars)"
                                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60"
                            />
                        </div>

                        {error && (
                            <p className="text-xs font-medium text-destructive">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || mobile.length !== 10 || password.length < 4}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            ) : (
                                mode === 'login' ? 'Log in' : 'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Toggle between login and register */}
                    <div className="mt-4 text-center text-sm">
                        {mode === 'login' ? (
                            <p className="text-muted-foreground">
                                Don't have an account?{' '}
                                <button
                                    onClick={() => {
                                        setMode('register')
                                        setError('')
                                    }}
                                    className="font-semibold text-primary hover:text-primary/80"
                                >
                                    Register
                                </button>
                            </p>
                        ) : (
                            <p className="text-muted-foreground">
                                Already have an account?{' '}
                                <button
                                    onClick={() => {
                                        setMode('login')
                                        setError('')
                                    }}
                                    className="font-semibold text-primary hover:text-primary/80"
                                >
                                    Log in
                                </button>
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer text */}
                <p className="mt-6 text-center text-xs text-muted-foreground">
                    By continuing, you agree to our Terms of Service
                </p>
            </div>
        </div>
    )
}
