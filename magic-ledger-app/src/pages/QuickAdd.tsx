import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export function QuickAdd() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('0');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');

  const handleSave = async () => {
    try {
      await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount) * -1, // Expenses are negative
          category,
          is_public: type === 'public',
          description,
          trans_date: new Date().toISOString(),
        }),
      });
      navigate('/transactions');
    } catch (err) {
      console.error(err);
      alert('儲存失敗');
    }
  };

  const addDigit = (digit: string) => {
    setAmount(prev => (prev === '0' ? digit : prev + digit));
  };

  const clearAmount = () => setAmount('0');
  const backspace = () => setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-4 mb-2 md:hidden">
        <button onClick={() => navigate(-1)} className="text-castle-gray hover:text-mickey-red transition-colors p-2 hover:bg-surface-container-high/50 rounded-full">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-2xl font-extrabold text-mickey-red tracking-tight">快速記帳</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column: OCR Photo Upload */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <Link to="/ai-scanner" className="bg-stardust-white rounded-[24px] shadow-[0_10px_30px_rgba(17,60,207,0.08)] p-6 relative overflow-hidden group min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-sorcerer-blue/30 hover:border-sorcerer-blue transition-colors cursor-pointer text-center flex-1">
            <div className="absolute inset-0 bg-gradient-to-br from-sorcerer-blue/5 to-mickey-red/5 opacity-50"></div>
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-sorcerer-blue mb-4 group-hover:scale-110 group-hover:shadow-lg transition-transform duration-300 relative z-10">
              <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface relative z-10">拍攝或上傳收據</h3>
            <p className="text-xs font-medium text-castle-gray mt-2 relative z-10">魔法 AI 將為您自動辨識金額與日期</p>
          </Link>
        </div>

        {/* Right Column: Entry Form & Keypad */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="bg-stardust-white rounded-[24px] shadow-[0_10px_30px_rgba(17,60,207,0.08)] p-6 md:p-8 flex flex-col gap-5">
            <div className="relative">
              <label className="text-xs font-medium text-castle-gray absolute -top-2 left-4 bg-stardust-white px-1 z-10">消費金額</label>
              <div className="flex items-center bg-surface-container-lowest border-2 border-surface-variant rounded-xl px-4 py-3 focus-within:border-magic-gold transition-all">
                <span className="text-lg text-castle-gray mr-2">$</span>
                <input 
                  type="text" 
                  className="bg-transparent border-none w-full text-2xl font-bold text-on-surface focus:outline-none p-0 text-right" 
                  value={amount}
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-xs font-medium text-castle-gray absolute -top-2 left-4 bg-stardust-white px-1 z-10">類別</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:border-sorcerer-blue appearance-none"
                >
                  <option value="Food">飲食</option>
                  <option value="Transport">交通</option>
                  <option value="Housing">居住</option>
                  <option value="Entertainment">娛樂</option>
                  <option value="Other">其他</option>
                </select>
              </div>
              <div className="relative">
                <label className="text-xs font-medium text-castle-gray absolute -top-2 left-4 bg-stardust-white px-1 z-10">項目描述</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:border-sorcerer-blue"
                  placeholder="晚餐、加油等"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-[20px]">
              <p className="text-sm font-bold tracking-wider text-castle-gray mb-3">帳務歸屬</p>
              <div className="relative w-64 h-14 bg-surface-variant rounded-full p-1 cursor-pointer flex shadow-inner" onClick={() => setType(type === 'public' ? 'private' : 'public')}>
                <div 
                  className={`absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-mickey-red rounded-full shadow-md transition-transform duration-300 ease-in-out ${type === 'private' ? 'translate-x-full' : 'translate-x-0'}`}
                ></div>
                <div className={`flex-1 flex items-center justify-center relative z-10 font-bold transition-colors ${type === 'public' ? 'text-on-primary' : 'text-castle-gray'}`}>
                  <span className="material-symbols-outlined mr-2 text-[20px]">home</span>
                  公帳
                </div>
                <div className={`flex-1 flex items-center justify-center relative z-10 font-bold transition-colors ${type === 'private' ? 'text-on-primary' : 'text-castle-gray'}`}>
                  <span className="material-symbols-outlined mr-2 text-[20px]">person</span>
                  私帳
                </div>
              </div>
            </div>
          </div>

          {/* Numeric Keypad */}
          <div className="bg-surface rounded-[24px] p-4 shadow-sm grid grid-cols-4 gap-3 select-none">
            {['1', '2', '3'].map(num => (
              <button key={num} onClick={() => addDigit(num)} className="bg-surface-container-lowest hover:bg-surface-variant text-2xl font-bold text-on-surface py-4 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center justify-center">
                {num}
              </button>
            ))}
            <button onClick={backspace} className="bg-surface-container-highest hover:bg-surface-variant text-castle-gray py-4 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center justify-center">
              <span className="material-symbols-outlined">backspace</span>
            </button>

            {['4', '5', '6'].map(num => (
              <button key={num} onClick={() => addDigit(num)} className="bg-surface-container-lowest hover:bg-surface-variant text-2xl font-bold text-on-surface py-4 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center justify-center">
                {num}
              </button>
            ))}
            <button onClick={clearAmount} className="bg-surface-container-highest hover:bg-surface-variant text-castle-gray py-4 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center justify-center font-bold text-lg">C</button>

            {['7', '8', '9'].map(num => (
              <button key={num} onClick={() => addDigit(num)} className="bg-surface-container-lowest hover:bg-surface-variant text-2xl font-bold text-on-surface py-4 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center justify-center">
                {num}
              </button>
            ))}
            <button onClick={handleSave} className="row-span-2 bg-mickey-red hover:bg-primary text-on-primary py-4 rounded-xl shadow-md active:scale-95 transition-transform flex flex-col items-center justify-center gap-1">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-sm font-bold tracking-wider">儲存</span>
            </button>

            <button onClick={() => addDigit('0')} className="col-span-2 bg-surface-container-lowest hover:bg-surface-variant text-2xl font-bold text-on-surface py-4 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center justify-center">0</button>
            <button onClick={() => addDigit('.')} className="bg-surface-container-lowest hover:bg-surface-variant text-2xl font-bold text-on-surface py-4 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center justify-center">.</button>
          </div>
        </div>
      </div>
    </div>
  );
}
