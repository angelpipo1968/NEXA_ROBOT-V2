import { ProjectFile } from '@/store/useChatStore';

export const saasStarter: ProjectFile[] = [
    {
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nexa SaaS Starter</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Inter', sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    },
    {
        name: 'main.tsx',
        path: 'src/main.tsx',
        language: 'typescript',
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
    },
    {
        name: 'index.css',
        path: 'src/index.css',
        language: 'css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #4f46e5;
  --secondary: #ec4899;
}

body {
  background-color: #f8fafc;
  color: #1e293b;
}`
    },
    {
        name: 'App.tsx',
        path: 'src/App.tsx',
        language: 'typescript',
        content: `import React, { useState } from 'react';
import { Layout, Shield, BarChart3, Users, Settings, LogOut } from 'lucide-react';

// Mock Router
const Router = ({ currentPath, children }: any) => {
  return <>{children}</>;
};

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-white">
        <nav className="border-b bg-white/80 backdrop-blur fixed w-full z-10 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2">
                 <Shield className="text-indigo-600" size={28} />
                 <span className="font-bold text-xl tracking-tight text-slate-900">NexusSaaS</span>
              </div>
              <button 
                onClick={() => setView('dashboard')}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl"
              >
                Launch App
              </button>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight leading-tight">
              Build your next idea <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">faster.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              The ultimate starting point for modern web applications. 
              Pre-configured with authentication, billing, and responsive layouts.
            </p>
            <div className="flex justify-center gap-4">
               <button onClick={() => setView('dashboard')} className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition shadow-indigo-200 shadow-xl">
                 Get Started
               </button>
               <button className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition shadow-sm">
                 View Documentation
               </button>
            </div>
          </div>
          
          <div className="mt-24 grid md:grid-cols-3 gap-8">
             {[
               { title: 'Secure by Default', icon: Shield, desc: 'Enterprise-grade security baked into every component.' },
               { title: 'Analytics Ready', icon: BarChart3, desc: 'Real-time insights dashboard pre-configured.' },
               { title: 'Team Collaboration', icon: Users, desc: 'Built-in roles and permissions for your entire team.' }
             ].map((item, i) => (
               <div key={i} className="p-8 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-slate-100">
                  <item.icon className="text-indigo-600 mb-4" size={32} />
                  <h3 className="text-xl font-bold mb-2 text-slate-900">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
               </div>
             ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-slate-800">
           <Shield className="text-indigo-400" />
           <span className="font-bold text-lg">Nexus</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
           <a href="#" className="flex items-center gap-3 px-4 py-3 bg-indigo-600 rounded-xl text-white font-medium shadow-lg shadow-indigo-900/20">
             <Layout size={20} /> Dashboard
           </a>
           <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition">
             <Users size={20} /> Customers
           </a>
           <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition">
             <BarChart3 size={20} /> Analytics
           </a>
           <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition">
             <Settings size={20} /> Settings
           </a>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => setView('landing')} className="flex items-center gap-2 text-slate-400 hover:text-white w-full px-4 py-2">
             <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
         <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
            <div className="flex gap-3">
               <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">JD</div>
            </div>
         </div>

         <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div className="text-slate-500 text-sm font-medium mb-1">Total Revenue</div>
               <div className="text-3xl font-bold text-slate-900">$45,231.89</div>
               <div className="text-emerald-500 text-sm mt-2 flex items-center gap-1">↑ 20.1% from last month</div>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div className="text-slate-500 text-sm font-medium mb-1">Active Users</div>
               <div className="text-3xl font-bold text-slate-900">2,345</div>
               <div className="text-emerald-500 text-sm mt-2 flex items-center gap-1">↑ 180 new users</div>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div className="text-slate-500 text-sm font-medium mb-1">Bounce Rate</div>
               <div className="text-3xl font-bold text-slate-900">24.5%</div>
               <div className="text-rose-500 text-sm mt-2 flex items-center gap-1">↓ 2.4% from last week</div>
            </div>
         </div>

         <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-96 flex items-center justify-center text-slate-400">
             <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <p>Analytics Chart Placeholder</p>
             </div>
         </div>
      </main>
    </div>
  );
}
`
    }
];
