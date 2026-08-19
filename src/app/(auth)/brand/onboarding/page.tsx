'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Dropdown from '@/components/Dropdown';
import { MAJOR_CATEGORIES } from '@/utils/category';

export default function BrandOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userAuth, setUserAuth] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: MAJOR_CATEGORIES[0].id,
    tax_id: '',
    description: ''
  });

  const categoryOptions = MAJOR_CATEGORIES.map(c => ({ label: c.name, value: c.id }));

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/brand/login');
      } else {
        setUserAuth(user);
        
        // Check if already submitted
        const { data: brand } = await supabase
          .from('brands')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (brand) {
           router.push('/brand/login'); // Or dashboard if approved
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAuth) return;
    
    setLoading(true);
    setError('');

    const supabase = createClient();
    
    // Insert into brands table with status 'pending'
    const { error: dbError } = await supabase
      .from('brands')
      .insert([
        {
          id: userAuth.id,
          name: formData.name,
          category: formData.category,
          tax_id: formData.tax_id,
          description: formData.description,
          status: 'pending'
        }
      ]);

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
    } else {
      // Go to login (which will show pending state)
      router.push('/brand/login?pending=true');
    }
  };

  if (!userAuth) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <h2 className="mt-6 text-center text-3xl font-black text-gray-900 uppercase tracking-tight">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          Tell us about your business. This information will be reviewed by our team.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Brand / Company Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-medium transition-colors"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Primary Category
              </label>
              <div className="mt-1">
                <Dropdown
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(val) => setFormData({...formData, category: val})}
                  variant="bordered"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Business Registration Number / Tax ID
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={formData.tax_id}
                  onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-medium transition-colors"
                  placeholder="e.g. GSTIN / EIN"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Brief Description
              </label>
              <div className="mt-1">
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-medium transition-colors"
                  placeholder="Tell us about the products you sell..."
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-sm font-semibold p-3 rounded-sm border border-red-100">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-sm shadow-sm text-sm font-black text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary uppercase tracking-wider disabled:opacity-50 transition-all"
              >
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
