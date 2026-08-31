"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { FileEdit, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DraftsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('product_drafts')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Failed to load drafts');
      console.error(error);
    } else {
      setDrafts(data || []);
    }
    setLoading(false);
  };

  const deleteDraft = async (id: string) => {
    const { error } = await supabase.from('product_drafts').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete draft');
    } else {
      toast.success('Draft deleted');
      setDrafts(drafts.filter(d => d.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Product Drafts</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Pick up where you left off. Up to 10 drafts are saved automatically.</p>
        </div>
        <button 
          onClick={() => router.push('/admin/products/add')}
          className="bg-[#6A43FB] hover:bg-[#5a35e0] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-[#6A43FB]/20"
        >
          <Plus size={18} /> New Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-[#6A43FB] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <FileEdit size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Drafts Found</h3>
          <p className="text-gray-500 max-w-md mx-auto">You don't have any saved drafts. Start creating a new product and it will auto-save here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft) => (
            <div key={draft.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#6A43FB]/20 transition-all flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-[#6A43FB]/10 text-[#6A43FB] p-3 rounded-2xl">
                  <FileEdit size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {formatDistanceToNow(new Date(draft.updated_at))} ago
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                {draft.title || 'Untitled Draft'}
              </h3>
              
              <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">
                {draft.form_data?.description || 'No description provided yet.'}
              </p>
              
              <div className="flex gap-3 mt-auto">
                <button 
                  onClick={() => router.push(`/admin/products/add?draftId=${draft.id}`)}
                  className="flex-1 bg-gray-50 hover:bg-[#6A43FB]/10 hover:text-[#6A43FB] text-gray-700 font-bold py-2.5 rounded-xl transition-colors text-sm"
                >
                  Continue Editing
                </button>
                <button 
                  onClick={() => deleteDraft(draft.id)}
                  className="p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                  title="Delete draft"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
