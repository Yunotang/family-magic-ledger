import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export function AIScanner() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStep(1);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await apiFetch('/ocr/upload', {
        method: 'POST',
        body: formData,
      });
      setOcrResult(data);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('辨識失敗，請重試');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setStep(1);
    
    try {
      const data = await apiFetch('/ai-chat/text', {
        method: 'POST',
        body: JSON.stringify({ text: inputText }),
      });
      setOcrResult(data);
      setStep(2);
      setInputText('');
    } catch (err) {
      console.error(err);
      alert('解析失敗，請換個說法試試');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(String(ocrResult.detected_amount)) * -1, // Expenses are negative
          category: ocrResult.suggested_category || 'Other',
          is_public: isPublic,
          description: ocrResult.description || `AI 辨識結果`,
          trans_date: ocrResult.detected_date ? new Date(ocrResult.detected_date).toISOString() : new Date().toISOString(),
          image_url: ocrResult.image_url || null
        }),
      });
      navigate('/transactions');
    } catch (err) {
      console.error(err);
      alert('儲存失敗');
    }
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-8 pb-10">
      <div className="flex items-center gap-4 mb-2 md:hidden">
        <button onClick={() => navigate(-1)} className="text-castle-gray hover:text-mickey-red transition-colors p-2 hover:bg-surface-container-high/50 rounded-full">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-2xl font-extrabold text-mickey-red tracking-tight">魔法相機</h1>
      </div>

      <div className="flex-1 flex flex-col gap-6 w-full max-w-2xl mx-auto">
        {/* Chat message 1 */}
        <div className="flex gap-4 items-start w-full">
          <div className="w-10 h-10 rounded-full bg-mickey-red text-on-primary flex items-center justify-center flex-shrink-0 animate-bounce">
            <span className="material-symbols-outlined text-sm">smart_toy</span>
          </div>
          <div className="bg-stardust-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-surface-variant flex-1 flex flex-col gap-4">
            <div>
              <p className="font-bold text-lg mb-1 flex items-center gap-1">嗨！今天使用了什麼魔法呢？ <span className="text-magic-gold">✨</span></p>
              <p className="text-sm font-medium text-castle-gray">請上傳收據，或是直接告訴我呦！</p>
            </div>
            {step === 0 && (
              <label className="border-2 border-dashed border-sorcerer-blue/30 hover:border-sorcerer-blue text-sorcerer-blue font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors w-full bg-white cursor-pointer">
                <span className="material-symbols-outlined">add_a_photo</span>
                拍攝或上傳收據施展魔法
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            )}
          </div>
        </div>

        {/* User reply 1 */}
        {step >= 1 && (
          <div className="flex gap-4 items-start w-full justify-end animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-sorcerer-blue text-on-primary rounded-2xl rounded-tr-sm p-3 shadow-md flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">{loading ? 'sync' : 'check'}</span>
              <span className="font-medium text-sm">{loading ? '魔法解析中...' : '已收到資訊'}</span>
            </div>
          </div>
        )}

        {/* Chat message 2 - result */}
        {step >= 2 && ocrResult && (
          <div className="flex gap-4 items-start w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-10 h-10 rounded-full bg-mickey-red text-on-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-sm">smart_toy</span>
            </div>
            <div className="bg-stardust-white rounded-2xl rounded-tl-sm p-4 md:p-6 shadow-[0_10px_30px_rgba(17,60,207,0.08)] flex-1 flex flex-col gap-4">
              <p className="font-bold text-base flex items-center gap-1">我解讀出來囉！幫您整理成這樣，看看對不對呢？ 🪄</p>
              
              <div className="bg-white border-2 border-surface-variant rounded-[20px] p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-sorcerer-blue">auto_awesome</span>
                  <h2 className="text-base font-bold text-sorcerer-blue">AI 解析結果</h2>
                </div>

                <div className="flex items-center justify-between border border-surface-variant rounded-xl p-3 bg-surface-container-lowest">
                  <span className="text-sm font-medium text-castle-gray">日期</span>
                  <span className="text-base">{ocrResult.detected_date || '今天'}</span>
                </div>
                
                <div className="flex items-center justify-between border border-surface-variant rounded-xl p-3 bg-surface-container-lowest">
                  <span className="text-sm font-medium text-castle-gray">類別</span>
                  <span className="text-base">{ocrResult.suggested_category}</span>
                </div>

                <div className="flex items-center justify-between border border-surface-variant rounded-xl p-3 bg-surface-container-lowest">
                  <span className="text-sm font-medium text-castle-gray">摘要</span>
                  <span className="text-base">{ocrResult.description}</span>
                </div>

                <div className="flex items-center justify-between border-2 border-mickey-red/20 rounded-xl p-4 bg-error-container/20">
                  <span className="text-sm font-medium text-castle-gray">金額</span>
                  <span className="text-2xl font-extrabold text-mickey-red flex items-center gap-1"><span className="text-lg">$</span>{ocrResult.detected_amount?.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-castle-gray">帳務歸屬</span>
                  <div className="relative w-48 h-10 bg-surface-variant rounded-full p-1 cursor-pointer flex shadow-inner" onClick={() => setIsPublic(!isPublic)}>
                    <div className={`absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-mickey-red rounded-full shadow-md transition-transform duration-300 ${isPublic ? 'translate-x-0' : 'translate-x-full'}`}></div>
                    <div className={`flex-1 flex items-center justify-center relative z-10 font-bold text-xs transition-colors ${isPublic ? 'text-on-primary' : 'text-castle-gray'}`}><span className="material-symbols-outlined mr-1 text-[16px]">home</span>公帳</div>
                    <div className={`flex-1 flex items-center justify-center relative z-10 font-bold text-xs transition-colors ${!isPublic ? 'text-on-primary' : 'text-castle-gray'}`}><span className="material-symbols-outlined mr-1 text-[16px]">person</span>私帳</div>
                  </div>
                </div>

                <button onClick={handleSave} className="w-full bg-mickey-red text-on-primary py-4 rounded-xl shadow-md hover:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-4 font-bold">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  確認並儲存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input Bottom */}
      <div className="w-full max-w-2xl mx-auto md:fixed md:bottom-8 relative bg-white border border-surface-variant rounded-full p-2 flex items-center shadow-lg mt-8">
        <button className="p-2 text-castle-gray hover:text-sorcerer-blue transition-colors">
          <span className="material-symbols-outlined">mic</span>
        </button>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
          placeholder="輸入：「今天在全聯花了 1250 元」..."
          className="flex-1 bg-transparent border-none focus:outline-none text-base px-2"
        />
        <button 
          onClick={handleTextSubmit}
          disabled={loading || !inputText.trim()}
          className="w-10 h-10 rounded-full bg-sorcerer-blue text-on-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </div>
    </div>
  );
}
