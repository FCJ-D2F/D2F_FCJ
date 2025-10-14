import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Input from '../components/UI/Input.jsx'
import Button from '../components/UI/Button.jsx'
import Card from '../components/UI/Card.jsx'
import useAuth from '../stores/useAuth.js'

export default function Login() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password')
  const loginMock = useAuth((s) => s.loginMock)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const onSubmit = async (e) => {
    e.preventDefault()
    await loginMock(email, password)
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-background to-background">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Use any email/password to continue.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Password</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          <Button type="submit" className="w-full">Continue</Button>
        </form>
      </Card>
    </div>
  )
}
