import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const INITIAL = { name: '', email: '', address: '', password: '' };

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (form.name.length < 20 || form.name.length > 60)
      e.name = 'Name must be 20–60 characters';
    if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Enter a valid email';
    if (form.address.length > 400)
      e.address = 'Address must be under 400 characters';
    if (form.password.length < 8 || form.password.length > 16)
      e.password = 'Password must be 8–16 characters';
    else if (!/[A-Z]/.test(form.password))
      e.password = 'Password must have at least one uppercase letter';
    else if (!/[^A-Za-z0-9]/.test(form.password))
      e.password = 'Password must have at least one special character';
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(errs => ({ ...errs, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');
    try {
      await signup(form);
      navigate('/stores');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg
        || err.response?.data?.message
        || 'Registration failed';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join StoreRate to rate local stores.</p>

        {serverError && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {[
            { field: 'name',     label: 'Full Name',     type: 'text',     hint: '20–60 characters' },
            { field: 'email',    label: 'Email',          type: 'email',    hint: '' },
            { field: 'address',  label: 'Address',        type: 'text',     hint: 'Max 400 characters' },
            { field: 'password', label: 'Password',       type: 'password', hint: '8–16 chars, 1 uppercase, 1 special' },
          ].map(({ field, label, type, hint }) => (
            <div className="form-group" key={field}>
              <label className="form-label">{label}</label>
              <input
                className={`form-input ${errors[field] ? 'error' : ''}`}
                type={type}
                value={form[field]}
                onChange={handleChange(field)}
                autoComplete={field}
              />
              {errors[field] && <span className="form-error">{errors[field]}</span>}
              {hint && !errors[field] && <span className="form-hint">{hint}</span>}
            </div>
          ))}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
