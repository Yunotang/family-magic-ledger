import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

export function Dashboard() {
  const [summary, setSummary] = useState<any>({ total_expenses: 0, total_income: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [hasHousehold, setHasHousehold] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        console.log("正在檢查魔法家庭狀態...");
        const household = await apiFetch('/households/me');
        setHasHousehold(true);
        
        const summaryData = await apiFetch('/reports/summary');
        setSummary(summaryData);
        
        const txData = await apiFetch('/transactions');
        setRecentTransactions(txData.slice(0, 3));
      } catch (err: any) {
        console.log("偵測到尚未建立家庭 (404)，切換至建立畫面");
        setHasHousehold(false);
      }
    }
    loadData();
  }, []);

  const createHousehold = async () => {
    const name = prompt('請輸入家庭名稱：', '我們的魔法家');
    if (!name) return;
    try {
      await apiFetch('/households', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      window.location.reload();
    } catch (err) {
      alert('建立失敗');
    }
  };

  if (!hasHousehold) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl">house</span>
        </div>
        <h2 className="text-2xl font-bold mb-4">您還不屬於任何家庭</h2>
        <p className="text-castle-gray mb-8">必須建立或加入一個家庭，才能開始施展記帳魔法！</p>
        <button 
          onClick={createHousehold}
          className="bg-mickey-red text-white px-8 py-4 rounded-full font-bold shadow-lg hover:scale-95 transition-transform"
        >
          立刻建立我的魔法家庭
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Hero Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main Balance Card */}
        <div className="col-span-1 md:col-span-8 bg-surface-container-lowest rounded-[24px] p-6 md:p-8 ambient-shadow relative overflow-hidden flex flex-col justify-between min-h-[240px] hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-magic-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-magic-gold" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <h3 className="text-sm font-bold tracking-wider text-castle-gray">家庭總結餘</h3>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface flex items-baseline gap-2">
              <span className="text-sorcerer-blue">$</span>{summary.balance?.toLocaleString() || '0'}
            </h1>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-6 border-t border-surface-variant/50 pt-6 md:border-t-0 md:pt-0">
            <div className="bg-surface-container-low rounded-xl p-4 flex-1">
              <h4 className="text-xs font-medium text-castle-gray mb-1">本月總支出</h4>
              <p className="text-lg font-bold text-mickey-red">${summary.total_expenses?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 flex-1">
              <h4 className="text-xs font-medium text-castle-gray mb-1">本月總收入</h4>
              <p className="text-lg font-bold text-sorcerer-blue">${summary.total_income?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>

        {/* Budget Progress Card */}
        <div className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-[24px] p-6 md:p-8 ambient-shadow flex flex-col justify-center hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
          <h3 className="text-sm font-bold tracking-wider text-castle-gray mb-4 text-center">本月預算魔法條</h3>
          <div className="relative w-40 h-40 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-surface-container"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="text-sorcerer-blue drop-shadow-md"
                strokeDasharray="65, 100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-on-surface">65%</span>
              <span className="text-xs font-medium text-castle-gray mt-1">已使用</span>
            </div>
            <div className="absolute top-2 right-2 text-magic-gold animate-pulse">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-base text-on-surface">剩餘 <span className="font-bold text-sorcerer-blue">$11,800</span></p>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Recent Transactions */}
        <div className="col-span-1 md:col-span-8 bg-surface-container-lowest rounded-[24px] p-6 ambient-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-on-surface">近期施法紀錄</h2>
            <Link to="/transactions" className="text-sm font-bold text-sorcerer-blue hover:text-secondary-container transition-colors">查看全部</Link>
          </div>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? recentTransactions.map((tx: any) => (
              <TransactionRow 
                key={tx.id}
                title={tx.description || tx.category} 
                subtitle={`${new Date(tx.trans_date).toLocaleDateString()} • ${tx.category}`} 
                amount={`${tx.amount < 0 ? '-' : ''}$${Math.abs(tx.amount).toLocaleString()}`} 
                icon={tx.category === 'Food' || tx.category === '飲食' ? "restaurant" : "payments"} 
                colorClass={tx.amount < 0 ? "bg-error-container text-mickey-red" : "bg-secondary-fixed text-sorcerer-blue"} 
              />
            )) : (
              <div className="text-center py-10 text-castle-gray font-medium italic">目前尚無施法紀錄...</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
          <Link to="/quick-add" className="w-full bg-mickey-red text-on-primary rounded-[24px] p-6 ambient-shadow hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(230,36,41,0.3)] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="flex flex-col items-center justify-center gap-3 relative z-10">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              </div>
              <span className="text-xl font-bold">快速記一筆</span>
            </div>
          </Link>

          <Link to="/ai-scanner" className="bg-sorcerer-blue text-on-primary rounded-[24px] p-6 ambient-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between flex-grow">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-magic-gold">document_scanner</span>
                <h3 className="text-lg font-bold">發票魔法掃描</h3>
              </div>
              <p className="text-xs font-medium opacity-90 mb-6">讓精靈為您自動辨識收據內容，省去輸入的麻煩。</p>
            </div>
            <div className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors">
              <span className="material-symbols-outlined">camera_alt</span>
              開啟相機
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ title, subtitle, amount, icon, colorClass }: { title: string, subtitle: string, amount: string, icon: string, colorClass: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <div>
          <h4 className="text-base font-bold text-on-surface">{title}</h4>
          <p className="text-xs font-medium text-castle-gray">{subtitle}</p>
        </div>
      </div>
      <span className="text-lg font-bold text-mickey-red">{amount}</span>
    </div>
  );
}
