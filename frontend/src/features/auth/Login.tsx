import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { AUTH_ERRORS } from '@/types/auth'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
    // Modes: 'email-signin', 'email-signup', 'phone', 'otp'
    const [mode, setMode] = useState<'email-signin' | 'email-signup' | 'phone' | 'otp'>('email-signin')

    // Form State
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState('')

    // UI State
    const [countdown, setCountdown] = useState(0)
    const [validationError, setValidationError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const {
        signInWithOTP, verifyOTP, signInWithPassword, signUpWithPassword,
        loading, error, clearError, user
    } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [user, navigate])

    useEffect(() => {
        let timer: number
        if (countdown > 0) {
            timer = window.setInterval(() => setCountdown(c => c - 1), 1000)
        }
        return () => clearInterval(timer)
    }, [countdown])

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()
        setValidationError(null)
        setSuccessMessage(null)

        if (!email || !password) {
            setValidationError("Please fill in all fields")
            return
        }

        if (mode === 'email-signup') {
            const { error } = await signUpWithPassword(email, password)
            if (!error) {
                setSuccessMessage("Account created! Please check your email to verify (or just sign in if testing).")
                // In dev mode/supabase placeholder, it might auto-confirm or not.
                // If it auto-confirms, we can auto-login? supabase.auth.signUp often auto-logs in if email confirm is off.
            }
        } else {
            await signInWithPassword(email, password)
        }
    }

    const sanitizePhone = (phone: string) => phone.replace(/[\s\-()]/g, '')

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()
        setValidationError(null)

        const cleanPhone = sanitizePhone(phoneNumber)
        if (!/^\+[1-9]\d{1,14}$/.test(cleanPhone)) {
            setValidationError('Please enter a valid phone number in E.164 format (e.g., +1234567890)')
            return
        }

        const { error } = await signInWithOTP(cleanPhone)
        if (!error) {
            setMode('otp')
            setCountdown(60)
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()
        const cleanPhone = sanitizePhone(phoneNumber)
        await verifyOTP(cleanPhone, otp)
    }

    const switchMode = (newMode: typeof mode) => {
        clearError()
        setValidationError(null)
        setSuccessMessage(null)
        setMode(newMode)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4 animate-fade-in relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

            <Card className="w-full max-w-md border-primary/50 shadow-[0_0_50px_rgba(0,240,255,0.1)] backdrop-blur-xl bg-black/40">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl glitch-effect" data-text="Identify">
                        Identify
                    </CardTitle>
                    <CardDescription className="text-primary/80 font-mono text-xs uppercase tracking-widest">
                        SkillOS Secure Gateway v2.5
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Alerts */}
                    {(error || validationError) && (
                        <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-md text-destructive text-sm flex items-center gap-2">
                            <span>⚠</span>
                            {validationError || (error?.message === 'Rate limit exceeded' ? AUTH_ERRORS.RATE_LIMIT : error?.message)}
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-md text-green-500 text-sm flex items-center gap-2">
                            <span>✓</span>
                            {successMessage}
                        </div>
                    )}

                    {/* EMAIL MODES */}
                    {(mode === 'email-signin' || mode === 'email-signup') && (
                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-mono text-muted-foreground uppercase">Email Address</Label>
                                <Input
                                    type="email"
                                    placeholder="user@skillos.app"
                                    className="font-mono bg-black/50 border-primary/30 focus-visible:ring-primary/50"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-mono text-muted-foreground uppercase">Password</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="font-mono bg-black/50 border-primary/30 focus-visible:ring-primary/50"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <Button type="submit" className="w-full font-bold tracking-wider" variant="neon" disabled={loading}>
                                {loading ? 'PROCESSING...' : (mode === 'email-signup' ? 'REGISTER NEW ID' : 'AUTHENTICATE')}
                            </Button>

                            <div className="text-center text-xs text-muted-foreground font-mono space-y-2">
                                <button type="button" onClick={() => switchMode(mode === 'email-signin' ? 'email-signup' : 'email-signin')} className="hover:text-primary transition-colors underline decoration-dotted">
                                    {mode === 'email-signin' ? 'Create new credentials' : 'Already have credentials?'}
                                </button>
                                <div className="pt-2 border-t border-white/5">
                                    <button type="button" onClick={() => switchMode('phone')} className="text-primary/70 hover:text-primary transition-colors">
                                        Use Comm Link (Phone) Instead
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* PHONE MODES */}
                    {(mode === 'phone' || mode === 'otp') && (
                        <>
                            {mode === 'phone' ? (
                                <form onSubmit={handleSendOTP} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-mono text-muted-foreground uppercase">Comm Link (E.164)</Label>
                                        <Input
                                            placeholder="+1234567890"
                                            className="font-mono text-lg bg-black/50 border-primary/30 focus-visible:ring-primary/50"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full font-bold tracking-wider" variant="neon" disabled={loading}>
                                        {loading ? 'INITIATING...' : 'ESTABLISH LINK'}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOTP} className="space-y-4">
                                    <div className="space-y-2 text-center">
                                        <Label className="text-xs font-mono text-muted-foreground uppercase">One-Time Security Token</Label>
                                        <Input
                                            className="font-mono text-3xl text-center tracking-[0.5em] bg-black/50 border-primary/30 focus-visible:ring-primary/50 h-16"
                                            placeholder="000000"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            disabled={loading}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full font-bold tracking-wider" variant="neon" disabled={loading}>
                                        {loading ? 'DECRYPTING...' : 'AUTHENTICATE'}
                                    </Button>
                                    <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
                                        <button type="button" onClick={() => switchMode('phone')} className="hover:text-primary transition-colors">← CHANGE FREQ</button>
                                        <button type="button" onClick={() => handleSendOTP({ preventDefault: () => { } } as any)} disabled={countdown > 0} className={countdown > 0 ? 'opacity-50' : 'hover:text-primary transition-colors'}>
                                            {countdown > 0 ? `RETRY IN ${countdown}s` : 'RESEND TOKEN'}
                                        </button>
                                    </div>
                                </form>
                            )}
                            <div className="text-center text-xs text-muted-foreground font-mono pt-4 border-t border-white/5">
                                <button type="button" onClick={() => switchMode('email-signin')} className="text-primary/70 hover:text-primary transition-colors">
                                    Use Standard Email Protocol
                                </button>
                            </div>
                        </>
                    )}
                </CardContent>
                <CardFooter className="justify-center border-t border-white/5 pt-4">
                    <p className="text-[10px] text-muted-foreground font-mono">SECURE CONNECTION // ENCRYPTED</p>
                </CardFooter>
            </Card>
        </div>
    )
}
