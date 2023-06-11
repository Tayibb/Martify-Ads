import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../src/index.scss';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import reportWebVitals from './reportWebVitals';

import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ToastContainer
      position='bottom-right'
      autoClose={3000}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      draggable
      pauseOnFocusLoss={false}
    />
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
