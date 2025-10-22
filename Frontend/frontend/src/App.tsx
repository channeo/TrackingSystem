// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Box } from '@mui/material';
import TrackingTable from './components/TrackingTable';
import WalletDetail from './components/WalletDetail';
import TokenDetail from './components/TokenDetail';

// Tạo QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, 
      retry: 1, 
      refetchOnWindowFocus: false, 
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)' }}>
          <Routes>
            <Route path="/" element={<TrackingTable />} />
            <Route path="/wallet/:address" element={<WalletDetail />} />
            <Route path="/wallet/:address/token/:token" element={<TokenDetail />} />
          </Routes>
        </Box>
      </Router>
    </QueryClientProvider>
  );
}

export default App;