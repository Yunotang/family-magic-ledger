import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

export function Reports() {
  const [summary, setSummary] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiFetch('/reports/summary');
        setSummary(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const fetchAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const data = await apiFetch('/reports/analysis');
      setAiAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
      setAiAnalysis('召喚 AI 顧問失敗，請稍後再試。');
    } finally {
      setLoadingAi(false);
    }
  };

  if (!summary) return <div className="p-20 text-center font-bold text-castle-gray">讀取魔法報表中...</div>;

  const categories = Object.entries(summary.categories || {});

  return (
    <div className="w-full max-w-6xl space-y-6 pb-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-on-background mb-2">統計報表中心</h2>
          <p className="text-sm font-medium text-castle-gray">探索家族支出的魔法秘密</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* AI Financial Insight Card */}
        <div className="md:col-span-12 bg-gradient-to-br from-sorcerer-blue to-secondary-container rounded-[32px] p-8 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <span className="material-symbols-outlined text-magic-gold text-3xl animate-pulse">auto_awesome</span>
              </div>
              <h3 className="text-xl font-bold">AI 魔法理財顧問</h3>
            </div>
            
            {aiAnalysis ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-in fade-in slide-in-from-bottom-4">
                <p className="whitespace-pre-line leading-relaxed text-lg">
                  {aiAnalysis}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-4">
                <p className="text-lg opacity-90 italic">「想知道如何透過魔法優化您的家計嗎？」</p>
                <button 
                  onClick={fetchAiAnalysis}
                  disabled={loadingAi}
                  className="bg-magic-gold text-sorcerer-blue px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {loadingAi ? '正在解讀數據中...' : '施展 AI 分析魔法'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Public vs Private Ratio */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-[24px] p-6 shadow-[0_10px_30px_rgba(17,60,207,0.08)] flex flex-col items-center hover:-translate-y-1 transition-transform duration-300">
          <h3 className="text-sm font-bold text-on-background self-start mb-6 w-full flex justify-between items-center tracking-wider">
            帳務分佈
          </h3>
          <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
             <div className="text-center">
              <span className="text-3xl font-extrabold text-on-background block">${summary.total_expenses.toLocaleString()}</span>
              <span className="text-xs font-medium text-castle-gray mt-1">本月總支出</span>
            </div>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-[24px] p-6 shadow-[0_10px_30px_rgba(17,60,207,0.08)] flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <h3 className="text-sm font-bold tracking-wider mb-6">支出分類詳情</h3>
          <div className="flex flex-col gap-4">
            {categories.length > 0 ? categories.map(([name, amount]: any) => (
              <div key={name} className="flex justify-between items-center p-4 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-sorcerer-blue"></div>
                  <span className="font-bold">{name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-castle-gray text-sm">{(amount / summary.total_expenses * 100).toFixed(1)}%</span>
                  <span className="font-extrabold text-mickey-red">${amount.toLocaleString()}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 italic text-castle-gray">目前尚無分類數據</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
