import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import React from "react";
import ReactDOM from "react-dom/client";
import './App.css'
import App from './App.jsx'
import { store } from './store/store.js'
import { Provider } from 'react-redux';
import OfflineRouteGuard from './components/OfflineRouteGuard.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <OfflineRouteGuard />
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,

)
//? https://project-management-gs.vercel.app/
//? https://task-hub-steel.vercel.app/
//? https://www.youtube.com/watch?v=caf1hPv44qA