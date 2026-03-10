import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Ticket, Comment, User } from '../types';
import { 
  Send, 
  Clock, 
  User as UserIcon, 
  Tag, 
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [engineers, setEngineers] = useState<User[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchTicket();
    if (user.role !== 'customer') {
      fetchEngineers();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      const { data } = await api.get(`/tickets/${id}`);
      setTicket(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngineers = async () => {
    try {
      const { data } = await api.get('/admin/db/users');
      setEngineers(data.filter((u: User) => u.role === 'engineer' || u.role === 'admin'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/tickets/${id}/comments`, { content: newComment });
      setNewComment('');
      fetchTicket();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await api.patch(`/tickets/${id}`, { status });
      fetchTicket();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async (engineerId: number) => {
    try {
      await api.patch(`/tickets/${id}`, { assigned_to: engineerId });
      fetchTicket();
    } catch (err) {
      console.error(err);
    }
  };

  const convertToKB = async () => {
    if (!ticket) return;
    try {
      await api.post('/kb', {
        title: `Solution: ${ticket.title}`,
        content: `Issue: ${ticket.description}\n\nResolution: [Add resolution steps here based on investigation notes]`,
        category: ticket.category
      });
      alert('Converted to Knowledge Base article!');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (!ticket) return <div className="text-center py-12">Ticket not found.</div>;

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-[#141414]/40 hover:text-[#141414] transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#141414]/10 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xs font-mono text-[#141414]/40">#SD-{ticket.id.toString().padStart(4, '0')}</span>
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-[#141414]/5 rounded">
                    {ticket.category.replace('_', ' ')}
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight italic serif">{ticket.title}</h1>
              </div>
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border",
                  ticket.status === 'open' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  ticket.status === 'investigating' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  ticket.status === 'pending' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                  'bg-emerald-100 text-emerald-700 border-emerald-200'
                )}>
                  {ticket.status}
                </span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-[#141414]/80 bg-[#F5F5F0]/50 p-6 rounded-xl border border-[#141414]/5">
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="mt-8 pt-8 border-t border-[#141414]/10 flex items-center justify-between text-xs text-[#141414]/40">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <UserIcon size={14} className="mr-2" />
                  <span>Reported by <span className="font-medium text-[#141414]">{ticket.customer_name}</span></span>
                </div>
                <div className="flex items-center">
                  <Clock size={14} className="mr-2" />
                  <span>Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              <div className="flex items-center">
                <Tag size={14} className="mr-2" />
                <span>Module: <span className="font-medium text-[#141414]">{ticket.product_module || 'N/A'}</span></span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white border border-[#141414]/10 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold italic serif mb-6">Communication History</h2>
            <div className="space-y-6 mb-8">
              {ticket.comments?.map((comment) => (
                <div key={comment.id} className={cn(
                  "flex flex-col space-y-2 p-4 rounded-xl border",
                  comment.user_role === 'customer' ? "bg-white border-[#141414]/10" : "bg-[#141414]/5 border-[#141414]/5 ml-8"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold">{comment.user_name}</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">{comment.user_role}</span>
                    </div>
                    <span className="text-[10px] text-[#141414]/40">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-sm text-[#141414]/80 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
              {ticket.comments?.length === 0 && (
                <div className="text-center py-8 text-[#141414]/40 italic text-sm">
                  No comments yet. Start the conversation.
                </div>
              )}
            </div>

            <form onSubmit={handleAddComment} className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-4 pr-12 border border-[#141414]/10 rounded-xl focus:ring-2 focus:ring-[#141414] outline-none transition-all min-h-[100px] text-sm"
              />
              <button 
                type="submit"
                className="absolute right-3 bottom-3 p-2 bg-[#141414] text-white rounded-lg hover:bg-[#141414]/90 transition-all"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-white border border-[#141414]/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Ticket Controls</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Priority</label>
                <div className="flex items-center space-x-2 p-2 bg-[#F5F5F0] rounded-lg">
                  <AlertCircle size={16} className={cn(
                    ticket.priority === 'critical' ? 'text-red-500' :
                    ticket.priority === 'high' ? 'text-orange-500' :
                    ticket.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                  )} />
                  <span className="text-sm font-bold capitalize">{ticket.priority}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Assigned Engineer</label>
                {user.role === 'customer' ? (
                  <div className="p-2 bg-[#F5F5F0] rounded-lg text-sm font-medium">
                    {ticket.engineer_name || 'Unassigned'}
                  </div>
                ) : (
                  <select 
                    value={ticket.assigned_to || ''}
                    onChange={(e) => handleAssign(Number(e.target.value))}
                    className="w-full p-2 bg-[#F5F5F0] border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#141414] outline-none"
                  >
                    <option value="">Unassigned</option>
                    {engineers.map(eng => (
                      <option key={eng.id} value={eng.id}>{eng.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {user.role !== 'customer' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Update Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['investigating', 'pending', 'resolved'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(status)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                          ticket.status === status ? "bg-[#141414] text-white border-[#141414]" : "bg-white text-[#141414] border-[#141414]/10 hover:border-[#141414]"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {user.role !== 'customer' && ticket.status === 'resolved' && (
                <button 
                  onClick={convertToKB}
                  className="w-full mt-4 flex items-center justify-center space-x-2 p-3 bg-emerald-500 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all"
                >
                  <FileText size={14} />
                  <span>Convert to KB Article</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#141414] text-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-white/60">Quick Tools</h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/debug')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
              >
                <span className="text-xs font-medium">API Debugger</span>
                <ArrowLeft size={14} className="rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
              <button 
                onClick={() => navigate('/logs')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
              >
                <span className="text-xs font-medium">Log Analyzer</span>
                <ArrowLeft size={14} className="rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
