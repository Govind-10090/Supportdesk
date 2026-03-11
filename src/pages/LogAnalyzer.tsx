import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Log } from '../types';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Info, 
  Bug, 
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';

export default function LogAnalyzer() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filter, setFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Log)));
    });
    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(filter.toLowerCase()) || 
                         (log.stack_trace?.toLowerCase().includes(filter.toLowerCase()));
    const matchesSeverity = severityFilter === 'all' || log.severity.toLowerCase() === severityFilter.toLowerCase();
    return matchesSearch && matchesSeverity;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'error': return <AlertTriangle size={16} className="text-red-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'info': return <Info size={16} className="text-blue-500" />;
      case 'debug': return <Bug size={16} className="text-purple-500" />;
      default: return <FileText size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight italic serif">Log Analyzer</h1>
          <p className="text-[#141414]/60 mt-1">Analyze system logs and investigate stack traces.</p>
        </div>
      </div>

      <div className="bg-white border border-[#141414]/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#141414]/10 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/40" />
            <input 
              type="text"
              placeholder="Search logs or stack traces..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#F5F5F0] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#141414] outline-none"
            />
          </div>
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="p-3 bg-[#F5F5F0] border-none rounded-lg font-bold text-xs uppercase tracking-widest focus:ring-2 focus:ring-[#141414] outline-none"
          >
            <option value="all">All Severities</option>
            <option value="error">Errors Only</option>
            <option value="warning">Warnings</option>
            <option value="info">Info</option>
          </select>
          <button 
            className="p-3 bg-[#141414] text-white rounded-lg hover:bg-[#141414]/90 transition-all"
          >
            Refresh
          </button>
        </div>

        <div className="divide-y divide-[#141414]/5">
          {filteredLogs.map((log) => (
            <div key={log.id} className="group">
              <div 
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                className="p-4 flex items-center space-x-4 hover:bg-[#F5F5F0]/50 cursor-pointer transition-colors"
              >
                <div className="flex-shrink-0">{getSeverityIcon(log.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                      log.severity.toLowerCase() === 'error' ? 'bg-red-100 text-red-700' :
                      log.severity.toLowerCase() === 'warning' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    )}>
                      {log.severity}
                    </span>
                    <span className="text-xs font-mono text-[#141414]/40">
                      {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#141414] truncate mt-1">{log.message}</p>
                </div>
                {log.stack_trace && (
                  <div className="text-[#141414]/20 group-hover:text-[#141414]/40 transition-colors">
                    {expandedLog === log.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                )}
              </div>

              {expandedLog === log.id && log.stack_trace && (
                <div className="px-12 pb-6 bg-[#F5F5F0]/30">
                  <div className="bg-[#141414] text-red-400 p-6 rounded-xl font-mono text-xs overflow-x-auto border border-red-500/20 shadow-inner">
                    <p className="font-bold mb-2 text-white/40 uppercase tracking-widest text-[10px]">Stack Trace</p>
                    <pre className="whitespace-pre-wrap leading-relaxed">{log.stack_trace}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="p-12 text-center text-[#141414]/40 italic">
              No logs found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
