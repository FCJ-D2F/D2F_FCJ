import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Input from '../components/UI/Input.jsx'
import Button from '../components/UI/Button.jsx'
import Card from '../components/UI/Card.jsx'
import useAuth from '../stores/useAuth.js'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const register = useAuth((s) => s.register)
  const confirmSignUp = useAuth((s) => s.confirmSignUp)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    setLoading(true)
    
    try {
      await register(email, password)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await confirmSignUp(email, verificationCode)
      navigate('/login', { state: { message: 'Account verified! Please sign in.' } })
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-background to-background">
        <Card className="w-full max-w-md p-6">
          <h1 className="text-2xl font-semibold">Verify your email</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We've sent a verification code to {email}. Please enter it below.
          </p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
              {error}
            </div>
          )}
          
          <form className="mt-6 space-y-4" onSubmit={handleConfirm}>
            <div>
              <label className="text-sm text-muted-foreground">Verification Code</label>
              <Input 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value)} 
                type="text" 
                required 
                disabled={loading}
                placeholder="Enter 6-digit code"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-background to-background">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign up for IoT Monitor</p>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
            {error}
          </div>
        )}
        
        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              type="email" 
              required 
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Password</label>
            <Input 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              required 
              disabled={loading}
              minLength={8}
            />
            <p className="mt-1 text-xs text-muted-foreground">Must be at least 8 characters</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Confirm Password</label>
            <Input 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              type="password" 
              required 
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  )
}

