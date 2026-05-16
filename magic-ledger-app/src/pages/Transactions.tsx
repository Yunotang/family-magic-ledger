import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

export function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      try {
        const data = await apiFetch('/transactions');
        setTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, []);

  return (
    <div className="w-full pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-3xl font-extrabold text-on-surface">交易明細</h2>
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-castle-gray">search</span>
          <input 
            type="text" 
            placeholder="搜尋明細、金額或備註..." 
            className="w-full pl-12 pr-4 py-3 rounded-full border border-surface-variant bg-white focus:outline-none focus:ring-2 focus:ring-magic-gold focus:border-transparent transition-shadow shadow-sm font-medium text-sm placeholder:text-castle-gray"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-1/4 flex-shrink-0">
          <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(17,60,207,0.08)]">
            <h3 className="text-xl font-bold text-sorcerer-blue mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">filter_alt</span>
              篩選條件
            </h3>
            {/* ... Filters could be implemented here ... */}
            <p className="text-sm text-castle-gray italic">篩選功能開發中...</p>
          </div>
        </aside>

        {/* Transaction List */}
        <section className="w-full lg:w-3/4 flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-20 font-bold text-castle-gray">召喚紀錄中...</div>
          ) : transactions.length > 0 ? (
            transactions.map((tx: any) => (
              <TransactionCard 
                key={tx.id}
                title={tx.description || tx.category}
                type={tx.is_public ? "公帳" : "私帳"}
                typeColor={tx.is_public ? "bg-secondary-container text-on-secondary-container" : "bg-surface-variant text-on-surface"}
                typeIcon={tx.is_public ? "home" : "person"}
                payer={tx.user_id === 1 ? "您" : "成員"} // Naive check
                time={new Date(tx.trans_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                date={new Date(tx.trans_date).toLocaleDateString()}
                amount={`${tx.amount < 0 ? '-' : ''}$${Math.abs(tx.amount).toLocaleString()}`}
                icon={tx.category === 'Food' || tx.category === '飲食' ? "restaurant" : "payments"}
                iconColor={tx.amount < 0 ? "bg-primary-fixed text-mickey-red" : "bg-secondary-fixed text-sorcerer-blue"}
              />
            ))
          ) : (
            <div className="text-center py-20 text-castle-gray font-medium italic">目前尚無施法紀錄...</div>
          )}
        </section>
      </div>
    </div>
  );
}

function TransactionCard({ title, type, typeColor, typeIcon, payer, time, date, amount, icon, iconColor }: {
  title: string, type: string, typeColor: string, typeIcon: string, payer: string, time: string, date: string, amount: string, icon: string, iconColor: string
}) {
  return (
    <div className="bg-white rounded-[24px] p-4 lg:p-5 flex items-center justify-between shadow-[0_10px_30px_rgba(17,60,207,0.08)] hover:-translate-y-1 transition-transform">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-base text-on-surface">{title}</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${typeColor}`}>
              <span className="material-symbols-outlined text-[12px]">{typeIcon}</span>{type}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-castle-gray">
            <span className="font-bold text-sorcerer-blue">{date}</span>
            <span>• {time}</span>
            <span>• {payer}付款</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xl font-extrabold text-on-surface">{amount}</div>
      </div>
    </div>
  );
}
