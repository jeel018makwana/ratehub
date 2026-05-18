import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function StoreOwnerDashboard() {
  const { logout, user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [myStore, setMyStore] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    api.get('/stores').then(r => {
      const store = r.data.find(s => s.ownerId === user.id);
      if (store) {
        setMyStore(store);
        setAvgRating(store.averageRating);
        api.get(`/ratings/store/${store.id}`).then(res => setRatings(res.data));
      }
    });
  }, []);

  const handlePasswordUpdate = async () => {
    try {
      await api.patch('/users/me/password', { newPassword });
      setPwMsg('success:Password updated!');
      setNewPassword('');
    } catch (err) {
      setPwMsg('error:' + (err.response?.data?.message || 'Error'));
    }
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = [...ratings].sort((a, b) => {
    const getVal = (obj, field) => {
      if (field === 'createdAt') return new Date(obj[field]);
      if (field === 'user.name') return obj.user?.name ?? '';
      if (field === 'user.email') return obj.user?.email ?? '';
      return obj[field] ?? '';
    };
    const val = getVal(a, sortField) > getVal(b, sortField) ? 1 : -1;
    return sortDir === 'asc' ? val : -val;
  });

  const pwType = pwMsg.startsWith('success') ? 'success' : 'error';
  const pwText = pwMsg.split(':').slice(1).join(':');

  const ratingDistribution = [5, 4, 3, 2, 1].map(v => ({
    star: v,
    count: ratings.filter(r => r.value === v).length,
    pct: ratings.length ? Math.round((ratings.filter(r => r.value === v).length / ratings.length) * 100) : 0,
  }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav className="navbar">
        <div className="navbar-brand">Rate<span>Hub</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text3)' }}>👋 {user?.name?.split(' ')[0]}</span>
          <button className="btn btn-danger" onClick={logout} style={{ padding: '7px 14px' }}>Logout</button>
        </div>
      </nav>
      <div className="page">
        {!myStore ? (
          <div className="empty-state" style={{ marginTop: 80 }}>
            <div className="empty-state-icon">🏪</div>
            <h3>No store linked</h3>
            <p>Ask an admin to link a store to your account.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, marginBottom: 4 }}>{myStore.name}</h1>
              <p style={{ color: 'var(--text3)', fontSize: 14 }}>📍 {myStore.address}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
              {[
                { icon: '⭐', value: avgRating ?? '—', label: 'Average Rating', color: 'var(--gold)' },
                { icon: '👥', value: ratings.length, label: 'Total Ratings', color: 'var(--accent)' },
                { icon: '🏆', value: ratings.filter(r => r.value >= 4).length, label: '4★+ Ratings', color: 'var(--accent3)' },
              ].map(s => (
                <div className="stat-card" key={s.label}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text2)' }}>Rating Distribution</h3>
              {ratingDistribution.map(({ star, count, pct }) => (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ color: 'var(--gold)', width: 24, textAlign: 'right', fontSize: 13 }}>★{star}</span>
                  <div style={{ flex: 1, height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gold)', borderRadius: 4, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ color: 'var(--text3)', fontSize: 12, width: 60 }}>{count} ({pct}%)</span>
                </div>
              ))}
            </div>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Users Who Rated</h2>
            {ratings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3>No ratings yet</h3>
                <p>Users haven't rated your store yet.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {[['user.name','USER'],['user.email','EMAIL'],['value','RATING'],['createdAt','DATE']].map(([f,l]) => (
                        <th key={f} onClick={() => handleSort(f)}>
                          {l} {sortField === f ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(r => (
                      <tr key={r.id}>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{r.user?.name}</td>
                        <td>{r.user?.email}</td>
                        <td>
                          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{'★'.repeat(r.value)}</span>
                          <span style={{ color: 'var(--text3)', marginLeft: 6, fontSize: 12 }}>({r.value}/5)</span>
                        </td>
                        <td style={{ color: 'var(--text3)', fontSize: 13 }}>
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="divider" style={{ margin: '40px 0 28px' }} />
            <div style={{ maxWidth: 420 }}>
              <h2 style={{ fontSize: 18, marginBottom: 16 }}>Update Password</h2>
              {pwMsg && <div className={`alert alert-${pwType}`}>{pwText}</div>}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="input" type="password" placeholder="8-16 chars, uppercase + special"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={handlePasswordUpdate}>Update Password</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}