import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, username, password }),
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-[32px] shadow-xl w-full">
        <h2 className="text-3xl font-extrabold text-mickey-red mb-6 text-center italic">Magic Ledger</h2>
        <h3 className="text-xl font-bold mb-6 text-center text-on-surface">魔法註冊</h3>
        
        {error && <div className="bg-error-container text-mickey-red p-3 rounded-xl mb-4 text-sm font-bold text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-castle-gray mb-2">顯示名稱</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 rounded-xl border border-surface-variant focus:outline-none focus:border-sorcerer-blue"
              placeholder="您的法號"
              required
            />
          </div>
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
          <button type="submit" className="w-full bg-mickey-red text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-[0.98] transition-transform mt-4">
            完成魔法註冊
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm font-medium text-castle-gray">
          已有帳號？ <Link to="/login" className="text-mickey-red font-bold">立即登入</Link>
        </p>
      </div>
    </div>
  );
}
