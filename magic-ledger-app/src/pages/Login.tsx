import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const data = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      localStorage.setItem('token', data.access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-[32px] shadow-xl w-full">
        <h2 className="text-3xl font-extrabold text-mickey-red mb-6 text-center italic">Magic Ledger</h2>
        <h3 className="text-xl font-bold mb-6 text-center text-on-surface">魔法登入</h3>
        
        {error && <div className="bg-error-container text-mickey-red p-3 rounded-xl mb-4 text-sm font-bold text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-castle-gray mb-2">魔法郵件</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl border border-surface-variant focus:outline-none focus:border-sorcerer-blue"
              placeholder="example@magic.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-castle-gray mb-2">通關密語</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl border border-surface-variant focus:outline-none focus:border-sorcerer-blue"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="w-full bg-sorcerer-blue text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-[0.98] transition-transform mt-4">
            施展登入魔法
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm font-medium text-castle-gray">
          還沒有帳號嗎？ <Link to="/register" className="text-sorcerer-blue font-bold">立即註冊</Link>
        </p>
      </div>
    </div>
  );
}
