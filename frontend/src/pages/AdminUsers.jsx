import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminUsers() {
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchUsers = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    api.get(`/users?${params}`).then(r => setUsers(r.data));
  };

  useEffect(() => { fetchUsers(); }, []);

  const sorted = [...users].sort((a, b) => {
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
      await api.post('/users', newUser);
      setFormSuccess('User created successfully!');
      setNewUser({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchUsers();
      setTimeout(() => { setShowModal(false); setFormSuccess(''); }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating user');
    }
  };

  const roleBadge = (role) => {
    if (role === 'admin') return <span className="badge badge-admin">Admin</span>;
    if (role === 'store_owner') return <span className="badge badge-owner">Store Owner</span>;
    return <span className="badge badge-user">User</span>;
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
            <h1 className="page-title">Users</h1>
            <div className="page-subtitle">{users.length} registered users</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add User</button>
        </div>
        <div className="filter-bar">
          {['name', 'email', 'address'].map(f => (
            <input key={f} className="input" placeholder={`Filter by ${f}`}
              value={filters[f]} onChange={e => setFilters(p => ({ ...p, [f]: e.target.value }))} />
          ))}
          <select className="input" value={filters.role}
            onChange={e => setFilters(p => ({ ...p, role: e.target.value }))}>
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="store_owner">Store Owner</option>
          </select>
          <button className="btn btn-primary" onClick={fetchUsers}>Apply</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {['id', 'name', 'email', 'address', 'role'].map(h => (
                  <th key={h} onClick={() => handleSort(h)}>
                    {h.toUpperCase()} {sortField === h ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No users found</td></tr>
              ) : sorted.map(u => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text3)', fontFamily: 'monospace' }}>#{u.id}</td>
                  <td style={{ color: 'var(--text)', fontWeight: 500 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.address}</td>
                  <td>{roleBadge(u.role)}</td>
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
              <h2 className="modal-title">Create New User</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {formError && <div className="alert alert-error">{formError}</div>}
            {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
            <form onSubmit={handleCreate}>
              {[
                { key: 'name', label: 'Full Name', type: 'text', ph: 'Min 20 characters' },
                { key: 'email', label: 'Email', type: 'email', ph: 'user@example.com' },
                { key: 'password', label: 'Password', type: 'password', ph: '8-16 chars, uppercase + special' },
                { key: 'address', label: 'Address', type: 'text', ph: 'Full address' },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input className="input" type={f.type} placeholder={f.ph}
                    value={newUser[f.key]} onChange={e => setNewUser({ ...newUser, [f.key]: e.target.value })} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="input" value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="user">Normal User</option>
                  <option value="admin">Admin</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create User</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}