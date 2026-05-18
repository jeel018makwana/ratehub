import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get('/dashboard').then(r => setStats(r.data)); }, []);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#6c63ff' },
    { label: 'Total Stores', value: stats.totalStores, icon: '🏪', color: '#ff6584' },
    { label: 'Total Ratings', value: stats.totalRatings, icon: '⭐', color: '#ffd700' },
  ] : [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav className="navbar">
        <div className="navbar-brand">Rate<span>Hub</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text3)' }}>👋 {user?.name?.split(' ')[0]}</span>
          <button className="btn btn-danger" onClick={logout} style={{ padding: '7px 16px' }}>Logout</button>
        </div>
      </nav>
      <div className="page">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 6 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Manage your platform — users, stores, and ratings</p>
        </div>
        <div className="grid-stats">
          {statCards.map((s, i) => (
            <div className="stat-card fade-up" key={s.label} style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
              <div className="stat-number" style={{ color: s.color }}>{s.value ?? '—'}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16, color: 'var(--text2)' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/admin/users">
              <button className="btn btn-primary">👥 Manage Users</button>
            </Link>
            <Link to="/admin/stores">
              <button className="btn btn-success">🏪 Manage Stores</button>
            </Link>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 8, color: 'var(--text2)' }}>Platform Overview</h3>
            <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.8 }}>
              Full control over the platform. Add users, create stores, and monitor all activity.
            </p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 8, color: 'var(--text2)' }}>Rating System</h3>
            <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.8 }}>
              Users rate stores from 1–5. Store owners can view their average ratings and who submitted them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}