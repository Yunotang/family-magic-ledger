import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

export function Reports() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await apiFetch('/reports/summary');
        setSummary(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadSummary();
  }, []);

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
        {/* Public vs Private Ratio */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-[24px] p-6 shadow-[0_10px_30px_rgba(17,60,207,0.08)] flex flex-col items-center hover:-translate-y-1 transition-transform duration-300">
          <h3 className="text-sm font-bold text-on-background self-start mb-6 w-full flex justify-between items-center tracking-wider">
            帳務分佈
          </h3>
          <div className="relative w-48 h-48 mb-8">
             <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-on-background">${summary.total_expenses.toLocaleString()}</span>
              <span className="text-xs font-medium text-castle-gray mt-1">本月支出</span>
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
