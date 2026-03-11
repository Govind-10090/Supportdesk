import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { KBArticle } from '../types';
import { 
  Search, 
  BookOpen, 
  ChevronRight, 
  ArrowLeft,
  Tag,
  Clock,
  User
} from 'lucide-react';
import { format } from 'date-fns';

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'knowledge_base'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KBArticle)));
    });
    return () => unsubscribe();
  }, []);

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(search.toLowerCase()) ||
    article.content.toLowerCase().includes(search.toLowerCase()) ||
    article.category.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedArticle) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <button 
          onClick={() => setSelectedArticle(null)}
          className="flex items-center text-sm text-[#141414]/40 hover:text-[#141414] transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Knowledge Base
        </button>

        <div className="bg-white border border-[#141414]/10 rounded-2xl p-12 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-[#141414]/5 rounded">
              {selectedArticle.category.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight italic serif mb-8">{selectedArticle.title}</h1>
          
          <div className="prose prose-lg max-w-none text-[#141414]/80 leading-relaxed">
            <p className="whitespace-pre-wrap">{selectedArticle.content}</p>
          </div>

          <div className="mt-12 pt-8 border-t border-[#141414]/10 flex items-center justify-between text-xs text-[#141414]/40">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <User size={14} className="mr-2" />
                <span>Published by <span className="font-medium text-[#141414]">{selectedArticle.author_name}</span></span>
              </div>
              <div className="flex items-center">
                <Clock size={14} className="mr-2" />
                <span>Updated {format(new Date(selectedArticle.created_at), 'MMMM dd, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-5xl font-bold tracking-tight italic serif">How can we help?</h1>
        <p className="text-[#141414]/60">Search our knowledge base for solutions to common issues before creating a ticket.</p>
        <div className="w-full relative mt-4">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/40" />
          <input 
            type="text"
            placeholder="Search for articles, categories, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-[#141414]/10 rounded-2xl text-lg shadow-sm focus:ring-4 focus:ring-[#141414]/5 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div 
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="bg-white border border-[#141414]/10 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#141414]/20 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">{article.category}</span>
              <BookOpen size={16} className="text-[#141414]/20 group-hover:text-[#141414] transition-colors" />
            </div>
            <h3 className="text-lg font-bold italic serif mb-2 group-hover:underline">{article.title}</h3>
            <p className="text-sm text-[#141414]/60 line-clamp-3 mb-4">{article.content}</p>
            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-[#141414] opacity-0 group-hover:opacity-100 transition-all">
              <span>Read Article</span>
              <ChevronRight size={14} className="ml-1" />
            </div>
          </div>
        ))}
        {filteredArticles.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#141414]/40 italic">
            No articles found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
