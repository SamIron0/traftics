import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import Settings from './pages/Settings';
const queryClient = new QueryClient();
export function App() {
    return (<QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />}/>
            <Route path="/sessions" element={<Sessions />}/>
            <Route path="/settings" element={<Settings />}/>
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>);
}
