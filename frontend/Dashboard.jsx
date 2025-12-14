import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './App.css'

// Registra os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard({ onLogout }) {
  const [weatherData, setWeatherData] = useState([])
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }
      
      // Conecta ao Backend rodando na porta 3000 do host
      const [weatherRes, insightsRes] = await Promise.all([
        axios.get('http://localhost:3000/weather', config),
        axios.get('http://localhost:3000/weather/insights', config)
      ])
      
      setWeatherData(weatherRes.data)
      setInsights(insightsRes.data)
      setLoading(false)
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
      if (error.response && error.response.status === 401) {
        onLogout()
      }
    }
  }

  useEffect(() => {
    fetchData()
    // Atualiza a cada 5 segundos
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="loading">Carregando dados do clima...</div>

  const current = weatherData[0] // O mais recente

  // Prepara os dados comuns
  const reversedData = [...weatherData].reverse();
  const labels = reversedData.map(d => new Date(d.timestamp * 1000).toLocaleTimeString());

  // Gráfico de Temperatura
  const tempChartData = {
    labels,
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: reversedData.map(d => d.temperature),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3 // Deixa a linha um pouco curva
      },
    ],
  };

  // Gráfico de Vento
  const windChartData = {
    labels,
    datasets: [
      {
        label: 'Vento (km/h)',
        data: reversedData.map(d => d.windspeed),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
  };

  return (
    <div className="container">
      <div className="header-actions">
        <h1>GDash - Monitoramento Climático</h1>
        <Link to="/users" className="btn-users">Gerenciar Usuários</Link>
        <button onClick={onLogout} className="btn-logout">Sair</button>
      </div>
      
      {current && (
        <div className="card current-weather">
          <h3>Agora em {current.latitude}, {current.longitude}</h3>
          <h2>{current.temperature}°C</h2>
          <p>Vento: {current.windspeed} km/h</p>
        </div>
      )}

      {insights && (
        <div className="card insights-card">
          <h3>🤖 Insights de IA (Análise em Tempo Real)</h3>
          <p><strong>Resumo:</strong> {insights.summary}</p>
          <p><strong>Tendência:</strong> {insights.trend}</p>
          <p><strong>Status:</strong> {insights.alert}</p>
        </div>
      )}

      <div className="charts-wrapper">
        <div className="chart-container">
          <Line options={{ ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: 'Temperatura' } } }} data={tempChartData} />
        </div>
        <div className="chart-container">
          <Line options={{ ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: 'Vento' } } }} data={windChartData} />
        </div>
      </div>

      <h3>Histórico Recente</h3>
      <div className="export-buttons">
        <a href="http://localhost:3000/weather/export.csv" className="btn-export btn-csv" target="_blank">Exportar CSV</a>
        <a href="http://localhost:3000/weather/export.xlsx" className="btn-export btn-xlsx" target="_blank">Exportar Excel</a>
      </div>

      <table className="history-table">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Temp (°C)</th>
            <th>Vento (km/h)</th>
          </tr>
        </thead>
        <tbody>
          {weatherData.map((data, index) => (
            <tr key={index}>
              <td>{new Date(data.timestamp * 1000).toLocaleTimeString()}</td>
              <td>{data.temperature}</td>
              <td>{data.windspeed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}