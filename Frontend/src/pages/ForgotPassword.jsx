import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../components/UI/Input.jsx'
import Button from '../components/UI/Button.jsx'
import Card from '../components/UI/Card.jsx'
import useAuth from '../stores/useAuth.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: request code, 2: reset password
  const forgotPassword = useAuth((s) => s.forgotPassword)
  const resetPassword = useAuth((s) => s.resetPassword)

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await forgotPassword(email)
      setStep(2)
    } catch (err) {
      setError(err.message || 'Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    setLoading(true)
    
    try {
      await resetPassword(email, code, newPassword)
      setStep(3) // Success
    } catch (err) {
      setError(err.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  if (step === 3) {
    return (
      <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-background to-background">
        <Card className="w-full max-w-md p-6">
          <h1 className="text-2xl font-semibold">Password reset successful</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your password has been reset. You can now sign in with your new password.
          </p>
          <Link to="/login">
            <Button className="w-full mt-6">Go to Sign in</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-background to-background">
        <Card className="w-full max-w-md p-6">
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the verification code sent to {email} and your new password.
          </p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
              {error}
            </div>
          )}
          
          <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
            <div>
              <label className="text-sm text-muted-foreground">Verification Code</label>
              <Input 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                type="text" 
                required 
                disabled={loading}
                placeholder="Enter 6-digit code"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">New Password</label>
              <Input 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                type="password" 
                required 
                disabled={loading}
                minLength={8}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Confirm New Password</label>
              <Input 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                type="password" 
                required 
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Back to Sign in
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-background to-background">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
            {error}
          </div>
        )}
        
        <form className="mt-6 space-y-4" onSubmit={handleRequestCode}>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Code'}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">
            Back to Sign in
          </Link>
        </div>
      </Card>
    </div>
  )
}

