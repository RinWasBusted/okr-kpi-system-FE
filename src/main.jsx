import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-datepicker/dist/react-datepicker.css';
import { RouterProvider } from "react-router-dom";
import router from './routers/router.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import App from './App.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Disable refetch on window focus
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App>
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer />
      </QueryClientProvider>
    </App>
  </StrictMode>,
)