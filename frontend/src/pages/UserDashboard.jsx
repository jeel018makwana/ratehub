import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function UserDashboard() {
  const { logout, user } = useAuth();
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [myRatings, setMyRatings] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [ratingMsg, setRatingMsg] = useState({});

  const fetchStores = async () => {
    const params = new URLSearchParams();
    if (search.name) params.append('name', search.name);
    if (search.address) params.append('address', search.address);
    const res = await api.get(`/stores?${params}`);
    setStores(res.data);
  };

  const fetchMyRatings = async () => {
    try {
      const res = await api.get('/ratings/my');
      const map = {};
      res.data.forEach(r => { map[r.storeId] = r.value; });
      setMyRatings(map);
    } catch {}
  };

  useEffect(() => { fetchStores(); fetchMyRatings(); }, []);

  const submitRating = async (storeId, value) => {
    await api.post('/ratings', { storeId, value });
    setMyRatings(prev => ({ ...prev, [storeId]: value }));
    setRatingMsg(prev => ({ ...prev, [storeId]: 'Saved!' }));
    setTimeout(() => setRatingMsg(prev => ({ ...prev, [storeId]: '' })), 1500);
    fetchStores();
  };

  const handlePasswordUpdate = async () => {
    try {
      await api.patch('/users/me/password', { newPassword });
      setPwMsg('success:Password updated!');
      setNewPassword('');
    } catch (err) {
      setPwMsg('error:' + (err.response?.data?.message || 'Error'));
    }
  };

  const pwType = pwMsg.startsWith('success') ? 'success' : 'error';
  const pwText = pwMsg.split(':').slice(1).join(':');

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
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28 }}>Browse Stores</h1>
          <p style={{ color: 'var(--text3)', fontSize: 14, marginTop: 4 }}>Discover and rate your favorite stores</p>
        </div>
        <div className="filter-bar" style={{ marginBottom: 24 }}>
          <input className="input" placeholder="🔍 Search by name"
            value={search.name} onChange={e => setSearch(s => ({ ...s, name: e.target.value }))} />
          <input className="input" placeholder="📍 Search by address"
            value={search.address} onChange={e => setSearch(s => ({ ...s, address: e.target.value }))} />
          <button className="btn btn-primary" onClick={fetchStores}>Search</button>
        </div>
        {stores.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏪</div>
            <h3>No stores found</h3>
            <p>Try a different search term</p>
          </div>
        ) : (
          <div className="grid-3">
            {stores.map(store => (
              <div className="store-card" key={store.id}>
                <div className="store-name">{store.name}</div>
                <div className="store-address">📍 {store.address}</div>
                <div className="store-rating">
                  Overall: <strong>{store.averageRating ? `★ ${store.averageRating}` : 'No ratings yet'}</strong>
                </div>
                <div className="store-rating" style={{ marginBottom: 14 }}>
                  Your rating: <strong style={{ color: myRatings[store.id] ? 'var(--gold)' : 'var(--text3)' }}>
                    {myRatings[store.id] ? `★ ${myRatings[store.id]}` : 'Not rated'}
                  </strong>
                  {ratingMsg[store.id] && (
                    <span style={{ marginLeft: 8, color: 'var(--accent3)', fontSize: 12 }}>✓ {ratingMsg[store.id]}</span>
                  )}
                </div>
                <div className="stars-container">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} className={`star-btn ${myRatings[store.id] === v ? 'active' : ''}`}
                      onClick={() => submitRating(store.id, v)}>{v}</button>
                  ))}
                </div>
              </div>
            ))}
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
      </div>
    </div>
  );
}