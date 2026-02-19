import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { SetupRequired } from '@/components/SetupRequired';
import { PublicLayout } from '@/components/public/PublicLayout';
import { MenuPage } from '@/pages/public/MenuPage';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RequireAdmin } from '@/components/admin/RequireAdmin';
import { ProductsPage } from '@/pages/admin/ProductsPage';
import { CategoriesPage } from '@/pages/admin/CategoriesPage';
import { SettingsPage } from '@/pages/admin/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  if (!isSupabaseConfigured) {
    return <SetupRequired />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/menu" replace />} />

        <Route element={<PublicLayout />}>
          <Route path="/menu" element={<MenuPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
