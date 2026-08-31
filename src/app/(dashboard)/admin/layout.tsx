import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AdminLayoutWrapper from '@/components/Admin/AdminLayoutWrapper';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <AdminLayoutWrapper user={user}>
       {children}
    </AdminLayoutWrapper>
  );
}
