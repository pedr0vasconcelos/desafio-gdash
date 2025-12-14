import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import './App.css'

export default function Users() {
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/users', config)
      setUsers(response.data)
    } catch (err) {
      console.error("Erro ao buscar usuários", err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        // Modo Edição
        const dataToUpdate = { ...formData }
        if (!dataToUpdate.password) delete dataToUpdate.password // Não envia senha vazia na edição
        
        await axios.put(`http://localhost:3000/users/${editingId}`, dataToUpdate, config)
        setEditingId(null)
      } else {
        // Modo Criação
        await axios.post('http://localhost:3000/users', formData, config)
      }
      
      setFormData({ name: '', email: '', password: '' })
      fetchUsers()
      setError('')
    } catch (err) {
      setError('Erro ao salvar usuário. Verifique os dados.')
    }
  }

  const handleEdit = (user) => {
    setEditingId(user._id)
    // Preenche o formulário, mas deixa a senha vazia (só preenche se quiser alterar)
    setFormData({ name: user.name, email: user.email, password: '' })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este usuário?')) {
      try {
        await axios.delete(`http://localhost:3000/users/${id}`, config)
        fetchUsers()
      } catch (err) {
        console.error("Erro ao deletar", err)
      }
    }
  }

  return (
    <div className="container">
      <div className="header-actions">
        <h1>Gerenciamento de Usuários</h1>
        <Link to="/" className="btn-back">Voltar ao Dashboard</Link>
      </div>

      <div className="card">
        <h3>{editingId ? 'Editar Usuário' : 'Novo Usuário'}</h3>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="user-form">
          <input 
            placeholder="Nome" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
          />
          <input 
            placeholder="Email" 
            type="email" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
          />
          <input 
            placeholder={editingId ? "Nova Senha (opcional)" : "Senha"} 
            type="password" 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required={!editingId} 
          />
          <button type="submit" className="btn-create">{editingId ? 'Atualizar' : 'Adicionar'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({name:'', email:'', password:''}) }} className="btn-cancel">Cancelar</button>}
        </form>
      </div>

      <div className="card">
        <h3>Usuários Cadastrados</h3>
        <table className="history-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <button onClick={() => handleEdit(user)} className="btn-edit">Editar</button>
                  <button onClick={() => handleDelete(user._id)} className="btn-delete">Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}