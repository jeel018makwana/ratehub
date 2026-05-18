import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminStores() {
  const { logout } = useAuth();
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchStores = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    api.get(`/stores?${params}`).then(r => setStores(r.data));
  };

  useEffect(() => { fetchStores(); }, []);

  const sorted = [...stores].sort((a, b) => {
    const val = (a[sortField] ?? '') > (b[sortField] ?? '') ? 1 : -1;
    return sortDir === 'asc' ? val : -val;
  });

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const payload = { ...newStore };
      if (!payload.ownerId) delete payload.ownerId;
      else payload.ownerId = parseInt(payload.ownerId);
      await api.post('/stores', payload);
      setFormSuccess('Store created!');
      setNewStore({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      setTimeout(() => { setShowModal(false); setFormSuccess(''); }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating store');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav className="navbar">
        <div className="navbar-brand">Rate<span>Hub</span></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin"><button className="btn btn-ghost" style={{ padding: '7px 14px' }}>← Dashboard</button></Link>
          <button className="btn btn-danger" onClick={logout} style={{ padding: '7px 14px' }}>Logout</button>
        </div>
      </nav>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Stores</h1>
            <div className="page-subtitle">{stores.length} registered stores</div>
          </div>
          <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Add Store</button>
        </div>
        <div className="filter-bar">
          {['name', 'address'].map(f => (
            <input key={f} className="input" placeholder={`Filter by ${f}`}
              value={filters[f]} onChange={e => setFilters(p => ({ ...p, [f]: e.target.value }))} />
          ))}
          <button className="btn btn-primary" onClick={fetchStores}>Apply</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {['name', 'email', 'address', 'averageRating'].map(h => (
                  <th key={h} onClick={() => handleSort(h)}>
                    {h === 'averageRating' ? 'RATING' : h.toUpperCase()} {sortField === h ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No stores found</td></tr>
              ) : sorted.map(s => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text)', fontWeight: 500 }}>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.address}</td>
                  <td>{s.averageRating ? <span style={{ color: 'var(--gold)', fontWeight: 600 }}>★ {s.averageRating}</span> : <span style={{ color: 'var(--text3)' }}>No ratings</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add New Store</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {formError && <div className="alert alert-error">{formError}</div>}
            {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
            <form onSubmit={handleCreate}>
              {[
                { key: 'name', label: 'Store Name', type: 'text', ph: 'Min 20 characters' },
                { key: 'email', label: 'Store Email', type: 'email', ph: 'store@example.com' },
                { key: 'address', label: 'Address', type: 'text', ph: 'Full store address' },
                { key: 'ownerId', label: 'Owner ID (optional)', type: 'number', ph: 'User ID of store owner' },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input className="input" type={f.type} placeholder={f.ph}
                    value={newStore[f.key]} onChange={e => setNewStore({ ...newStore, [f.key]: e.target.value })} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }}>Create Store</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}