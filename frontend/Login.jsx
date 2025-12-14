import { useState } from 'react'
import axios from 'axios'
import './App.css'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password
      })
      const { access_token } = response.data
      onLogin(access_token)
    } catch (err) {
      setError('Login falhou. Verifique suas credenciais.')
    }
  }

  return (
    <div className="login-container">
      <div className="card login-card">
        <h2>GDash Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn-login">Entrar</button>
        </form>
      </div>
    </div>
  )
}