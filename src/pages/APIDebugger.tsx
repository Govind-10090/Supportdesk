import React, { useState } from 'react';
import api from '../services/api';
import { Terminal, Send, Play, Clock, Shield, Globe, Code } from 'lucide-react';

export default function APIDebugger() {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/debug', {
        url,
        method,
        headers: JSON.parse(headers),
        body: method !== 'GET' ? JSON.parse(body) : undefined
      });
      setResponse(data);
    } catch (err: any) {
      setResponse({ error: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight italic serif">API Debugger</h1>
          <p className="text-[#141414]/60 mt-1">Simulate and test API endpoints for technical investigation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Panel */}
        <div className="bg-white border border-[#141414]/10 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-4">
            <select 
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="p-3 bg-[#F5F5F0] border-none rounded-lg font-bold text-sm focus:ring-2 focus:ring-[#141414] outline-none"
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
            <div className="flex-1 relative">
              <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/40" />
              <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F5F5F0] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#141414] outline-none font-mono"
                placeholder="https://api.example.com/v1/resource"
              />
            </div>
            <button 
              onClick={handleSend}
              disabled={loading}
              className="bg-[#141414] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center space-x-2 hover:bg-[#141414]/90 transition-all disabled:opacity-50"
            >
              {loading ? <Clock size={16} className="animate-spin" /> : <Play size={16} />}
              <span>Send</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2 flex items-center">
                <Shield size={12} className="mr-1" /> Headers (JSON)
              </label>
              <textarea 
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                className="w-full p-4 bg-[#141414] text-emerald-400 font-mono text-xs rounded-xl h-32 outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {method !== 'GET' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2 flex items-center">
                  <Code size={12} className="mr-1" /> Request Body (JSON)
                </label>
                <textarea 
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-4 bg-[#141414] text-blue-400 font-mono text-xs rounded-xl h-48 outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Response Panel */}
        <div className="bg-[#141414] text-white rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[600px]">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Response</h2>
            {response && (
              <div className="flex items-center space-x-4">
                <span className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded",
                  response.status >= 200 && response.status < 300 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                )}>
                  STATUS: {response.status}
                </span>
                <span className="text-[10px] font-bold text-white/40">
                  TIME: {response.duration}ms
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-6 overflow-auto font-mono text-xs">
            {response ? (
              <pre className="whitespace-pre-wrap text-emerald-400">
                {JSON.stringify(response.data || response.error, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4">
                <Terminal size={48} />
                <p className="text-sm font-medium">Send a request to see the response</p>
              </div>
            )}
          </div>

          {response?.headers && (
            <div className="p-6 border-t border-white/10 bg-white/5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Response Headers</h3>
              <pre className="text-[10px] text-white/60 overflow-x-auto">
                {JSON.stringify(response.headers, null, 2)}
              </pre>
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
