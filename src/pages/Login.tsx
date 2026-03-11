import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { LogIn, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          role: 'customer',
          created_at: new Date().toISOString()
        });
        
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#141414] text-white flex items-center justify-center rounded-full mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter italic serif">SupportDesk</h1>
          <p className="text-[#141414]/60 text-sm mt-2">Enterprise Customer Support Platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-[#141414] focus:ring-2 focus:ring-[#141414] outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-[#141414] focus:ring-2 focus:ring-[#141414] outline-none transition-all"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-[#141414] focus:ring-2 focus:ring-[#141414] outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#141414] text-white p-4 font-bold uppercase tracking-widest hover:bg-[#141414]/90 transition-all flex items-center justify-center space-x-2"
          >
            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            <LogIn size={18} />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-[#141414]/10 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium hover:underline"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
