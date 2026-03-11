import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Users, 
  Ticket as TicketIcon, 
  Database, 
  BarChart3, 
  Trash2, 
  Edit3, 
  Search,
  Activity,
  PieChart,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activeCollection, setActiveCollection] = useState('users');
  const [dbData, setDbData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, activeCollection), (snapshot) => {
      setDbData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [activeCollection]);

  const fetchStats = async () => {
    try {
      const ticketsSnap = await getDocs(collection(db, 'tickets'));
      const tickets = ticketsSnap.docs.map(doc => doc.data());
      
      const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'engineer')));
      const engineers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const categoryCountsMap: any = {};
      const statusCountsMap: any = {};
      
      tickets.forEach((t: any) => {
        categoryCountsMap[t.category] = (categoryCountsMap[t.category] || 0) + 1;
        statusCountsMap[t.status] = (statusCountsMap[t.status] || 0) + 1;
      });

      const categoryCounts = Object.entries(categoryCountsMap).map(([category, count]) => ({ category, count }));
      
      const engineerWorkload = await Promise.all(engineers.map(async (eng: any) => {
        const count = tickets.filter((t: any) => t.assigned_to === eng.id).length;
        return { name: eng.name, ticket_count: count };
      }));

      setStats({
        totalTickets: tickets.length,
        categoryCounts,
        engineerWorkload
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredData = dbData.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const COLORS = ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444'];

  if (!stats) return <div className="flex items-center justify-center h-64">Loading Analytics...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight italic serif">Admin Console</h1>
          <p className="text-[#141414]/60 mt-1">System-wide analytics and database management.</p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-[#141414]/10 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold italic serif flex items-center">
              <BarChart3 size={20} className="mr-2" /> Issue Categories
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Live Distribution</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryCounts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141410" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#141414', border: 'none', borderRadius: '8px', color: '#fff'}}
                  itemStyle={{color: '#fff'}}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.categoryCounts.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#141414] text-white rounded-2xl p-8 shadow-xl flex flex-col">
          <h2 className="text-xl font-bold italic serif mb-8 flex items-center text-white/80">
            <Activity size={20} className="mr-2" /> Engineer Workload
          </h2>
          <div className="flex-1 space-y-6">
            {stats.engineerWorkload.map((eng: any, index: number) => (
              <div key={eng.name} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span>{eng.name}</span>
                  <span className="text-white/40">{eng.ticket_count} Tickets</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${(eng.ticket_count / stats.totalTickets) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DB Management Section */}
      <div className="bg-white border border-[#141414]/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[#141414]/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold italic serif flex items-center">
              <Database size={20} className="mr-2" /> Database Management
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/40" />
                <input 
                  type="text"
                  placeholder="Search records..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-[#F5F5F0] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#141414] outline-none w-64"
                />
              </div>
              <select 
                value={activeCollection}
                onChange={(e) => setActiveCollection(e.target.value)}
                className="p-2 bg-[#141414] text-white border-none rounded-lg font-bold text-xs uppercase tracking-widest outline-none"
              >
                <option value="users">Users</option>
                <option value="tickets">Tickets</option>
                <option value="knowledge_base">Knowledge Base</option>
                <option value="logs">System Logs</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F0]/50 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">
                {dbData.length > 0 && Object.keys(dbData[0]).map(key => (
                  <th key={key} className="px-6 py-4">{key}</th>
                ))}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/5">
              {filteredData.map((item, i) => (
                <tr key={i} className="hover:bg-[#F5F5F0]/30 transition-colors text-xs">
                  {Object.values(item).map((val: any, j) => (
                    <td key={j} className="px-6 py-4 truncate max-w-[200px]">
                      {typeof val === 'string' && val.length > 50 ? val.substring(0, 50) + '...' : String(val)}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="p-1.5 hover:bg-[#141414] hover:text-white rounded transition-all text-[#141414]/40">
                      <Edit3 size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-red-500 hover:text-white rounded transition-all text-[#141414]/40">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
