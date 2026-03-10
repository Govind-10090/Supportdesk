import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, 
  Send, 
  AlertCircle, 
  Info,
  Layers,
  Zap
} from 'lucide-react';

export default function NewTicket() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'API Issue',
    priority: 'medium',
    product_module: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tickets', formData);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-[#141414]/40 hover:text-[#141414] transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Dashboard
      </button>

      <div className="bg-white border border-[#141414]/10 rounded-2xl p-10 shadow-sm">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight italic serif">Create Support Ticket</h1>
          <p className="text-[#141414]/60 mt-2">Provide as much detail as possible to help our engineers investigate.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3 flex items-center">
                <Info size={14} className="mr-2" /> Issue Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-4 bg-[#F5F5F0] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#141414] outline-none transition-all"
                placeholder="Brief summary of the problem"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3 flex items-center">
                  <Layers size={14} className="mr-2" /> Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-4 bg-[#F5F5F0] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#141414] outline-none transition-all appearance-none"
                >
                  <option>API Issue</option>
                  <option>Authentication</option>
                  <option>UI Bug</option>
                  <option>Performance Issue</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3 flex items-center">
                  <Zap size={14} className="mr-2" /> Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full p-4 bg-[#F5F5F0] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#141414] outline-none transition-all appearance-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3">Product Module Affected</label>
              <input
                type="text"
                value={formData.product_module}
                onChange={(e) => setFormData({...formData, product_module: e.target.value})}
                className="w-full p-4 bg-[#F5F5F0] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#141414] outline-none transition-all"
                placeholder="e.g. Checkout, Auth Service, Dashboard"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3">Detailed Description</label>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-4 bg-[#F5F5F0] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#141414] outline-none transition-all"
                placeholder="Describe the steps to reproduce, expected behavior, and actual behavior..."
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[#141414]/10 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 text-sm font-bold uppercase tracking-widest hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#141414] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center space-x-2 hover:bg-[#141414]/90 transition-all disabled:opacity-50"
            >
              <Send size={16} />
              <span>{loading ? 'Creating...' : 'Submit Ticket'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#141414] text-white p-6 rounded-2xl flex items-start space-x-4">
        <AlertCircle size={20} className="text-amber-400 mt-1 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-bold mb-1">Before you submit:</p>
          <p className="text-white/60">Check the <Link to="/kb" className="text-white underline">Knowledge Base</Link> to see if your issue has a known solution. This can often resolve problems faster than waiting for an engineer.</p>
        </div>
      </div>
    </div>
  );
}

function Link({ to, children, className }: any) {
  return <a href={to} className={className}>{children}</a>;
}
