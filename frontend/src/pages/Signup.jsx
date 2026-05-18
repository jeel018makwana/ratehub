import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (form.name.length < 20 || form.name.length > 60) e.name = 'Name must be 20–60 characters';
    if (form.address.length > 400) e.address = 'Address max 400 characters';
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(form.password))
      e.password = 'Must be 8-16 chars with 1 uppercase & 1 special character';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    try {
      await api.post('/users/signup', form);
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Signup failed' });
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'At least 20 characters' },
    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
    { key: 'address', label: 'Address', type: 'text', placeholder: 'Your full address' },
    { key: 'password', label: 'Password', type: 'password', placeholder: '8-16 chars, 1 uppercase, 1 special' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-box fade-up" style={{ maxWidth: 480 }}>
        <div className="auth-logo">Rate<span>Hub</span></div>
        <div className="auth-subtitle">Create your account — it's free</div>
        {success && <div className="alert alert-success">{success}</div>}
        {errors.api && <div className="alert alert-error">{errors.api}</div>}
        <form onSubmit={handleSubmit}>
          {fields.map(f => (
            <div className="form-group" key={f.key}>
              <label className="form-label">{f.label}</label>
              <input className="input" type={f.type} placeholder={f.placeholder}
                value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              {errors[f.key] && <div className="form-error">{errors[f.key]}</div>}
            </div>
          ))}
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 8, fontSize: 15 }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}