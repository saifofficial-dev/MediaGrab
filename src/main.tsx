import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ignore WebSocket errors in AI Studio iframe environment where HMR is disabled
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const msg = (reason && reason.message) || String(reason || '');
  if (msg.includes('WebSocket') || msg.includes('closed without opened')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
