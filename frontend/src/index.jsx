// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { GoogleOAuthProvider } from '@react-oauth/google';
// import App from './App.jsx';
// import './styles/index.css';

// // Get the Google Client ID from environment variables or use a placeholder
// const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
//       <App />
//     </GoogleOAuthProvider>
//   </React.StrictMode>
// );



import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './styles/index.css';

console.log("ENV CLIENT ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);