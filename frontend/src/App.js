import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Theme management
const applyTheme = (theme) => {
  const root = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    root.style.setProperty('--bg-primary', '#171717');
    root.style.setProperty('--bg-secondary', '#1f1f1f');
    root.style.setProperty('--bg-tertiary', '#262626');
    root.style.setProperty('--bg-hover', '#2a2a2a');
    root.style.setProperty('--bg-active', '#333333');
    root.style.setProperty('--text-primary', '#fafafc');
    root.style.setProperty('--text-secondary', '#a1a1aa');
    root.style.setProperty('--text-muted', '#71717a');
    root.style.setProperty('--border-color', '#2e2e2e');
  } else {
    root.style.setProperty('--bg-primary', '#ffffff');
    root.style.setProperty('--bg-secondary', '#f5f5f5');
    root.style.setProperty('--bg-tertiary', '#e5e5e5');
    root.style.setProperty('--bg-hover', '#d4d4d4');
    root.style.setProperty('--bg-active', '#c4c4c4');
    root.style.setProperty('--text-primary', '#171717');
    root.style.setProperty('--text-secondary', '#525252');
    root.style.setProperty('--text-muted', '#737373');
    root.style.setProperty('--border-color', '#d4d4d4');
  }
};

// Font size management
const applyFontSize = (size) => {
  const root = document.documentElement;
  const sizes = { small: '14px', medium: '16px', large: '18px' };
  root.style.setProperty('--base-font-size', sizes[size] || '16px');
};

// ==================== ICONS ====================
const SearchIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>);
const ImageGenIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>);
const WebDevIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>);
const VideoIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>);
const BrainIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.1-.9 2-2 2"/><path d="M12 8a4 4 0 0 0-4 4c0 1.1.9 2 2 2"/><path d="M12 14a4 4 0 0 1 4 4c0 1.1-.9 2-2 2"/><path d="M12 22v-2"/><path d="M12 2v2"/></svg>);
const SendIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>);
const MicIcon = ({ active }) => (<svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>);
const AttachIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>);
const PlusIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const MenuIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const SpeakerIcon = ({ muted }) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{muted ? <><path d="M11 5 6 9H2v6h4l5 4V5Z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></> : <><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>}</svg>);
const TrashIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>);
const HistoryIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>);
const SettingsIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>);
const SidebarOpenIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>);
const SidebarCloseIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m16 9-3 3 3 3"/></svg>);
const BackIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>);
const ComputerIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>);
const LayersIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L3.18 12.5"/><path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L3.18 17.5"/></svg>);
const ChatIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
const UserIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>);
const InfoIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>);
const PaletteIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>);
const ChevronRightIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>);
const GlobeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>);
const SparklesIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>);
const DownloadIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);
const CopyIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>);
const CheckIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>);
const FileIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>);
const XIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);

// ==================== NEXA LOGO ====================
const NexaLogo = ({ size = 40 }) => (
  <div className="nexa-logo" style={{ width: size, height: size }}>
    <div className="logo-inner">
      <span>N</span>
    </div>
  </div>
);

// ==================== FEATURE CARD ====================
const FeatureCard = ({ icon, title, onClick, active }) => (
  <button className={`feature-card ${active ? 'active' : ''}`} onClick={onClick}>
    <div className="feature-icon">{icon}</div>
    <span className="feature-title">{title}</span>
  </button>
);

// ==================== MESSAGE COMPONENT ====================
const Message = ({ message, onSpeak, settings }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  
  const copyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Render image if present
  const renderContent = () => {
    if (message.image) {
      return (
        <div className="message-with-image">
          <p className="message-text-content">{message.content.split('![')[0]}</p>
          <img src={message.image} alt="Generated" className="generated-image" />
        </div>
      );
    }
    
    // Check for code blocks
    if (message.content.includes('```')) {
      const parts = message.content.split(/(```[\s\S]*?```)/g);
      return parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/```\w*\n?/g, '').replace(/```$/g, '');
          return (
            <pre key={i} className="code-block">
              <code>{code}</code>
            </pre>
          );
        }
        return <span key={i}>{part}</span>;
      });
    }
    
    return message.content;
  };
  
  return (
    <div className={`message ${isUser ? 'user' : 'assistant'}`} data-testid={`message-${message.id}`}>
      {!isUser && settings?.showAvatars !== false && (
        <div className="message-avatar">
          <NexaLogo size={32} />
        </div>
      )}
      <div className="message-content">
        <div className="message-text">{renderContent()}</div>
        {!isUser && (
          <div className="message-actions">
            <button onClick={() => onSpeak(message.content)} className="action-btn" title="Escuchar">
              <SpeakerIcon muted={false} />
            </button>
            <button onClick={copyText} className="action-btn" title="Copiar">
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== SETTINGS COMPONENT ====================
const SettingsPage = ({ onClose, settings, setSettings, onClearAllChats }) => {
  const [activeSection, setActiveSection] = useState('general');
  const [availableVoices, setAvailableVoices] = useState([]);
  
  useEffect(() => {
    // Load available browser voices
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      const spanishVoices = voices.filter(v => v.lang.includes('es'));
      setAvailableVoices(spanishVoices.length > 0 ? spanishVoices : voices.slice(0, 10));
    };
    
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);
  
  const menuItems = [
    { id: 'general', icon: <SettingsIcon />, label: 'General' },
    { id: 'interface', icon: <ComputerIcon />, label: 'Interfaz' },
    { id: 'models', icon: <LayersIcon />, label: 'Modelos' },
    { id: 'chats', icon: <ChatIcon />, label: 'Chats' },
    { id: 'personalization', icon: <PaletteIcon />, label: 'Personalizacion' },
    { id: 'account', icon: <UserIcon />, label: 'Cuenta' },
    { id: 'about', icon: <InfoIcon />, label: 'Sobre nosotros' },
  ];

  // Apply theme when changed
  const handleThemeChange = (theme) => {
    setSettings({...settings, theme});
    applyTheme(theme);
    localStorage.setItem('nexa_settings', JSON.stringify({...settings, theme}));
  };
  
  // Apply font size when changed
  const handleFontSizeChange = (fontSize) => {
    setSettings({...settings, fontSize});
    applyFontSize(fontSize);
    localStorage.setItem('nexa_settings', JSON.stringify({...settings, fontSize}));
  };
  
  // Handle voice selection
  const handleVoiceChange = (voiceName) => {
    const voice = availableVoices.find(v => v.name === voiceName);
    setSettings({...settings, voiceId: voiceName, voiceName: voice?.name || voiceName});
    localStorage.setItem('nexa_settings', JSON.stringify({...settings, voiceId: voiceName, voiceName: voice?.name || voiceName}));
  };
  
  // Handle setting change and save to localStorage
  const handleSettingChange = (key, value) => {
    const newSettings = {...settings, [key]: value};
    setSettings(newSettings);
    localStorage.setItem('nexa_settings', JSON.stringify(newSettings));
  };

  return (
    <div className="settings-overlay">
      <div className="settings-container">
        <header className="settings-header">
          <button className="back-btn" onClick={onClose}>
            <BackIcon />
          </button>
          <h1 className="settings-title">Configuracion</h1>
        </header>
        
        <div className="settings-body">
          <nav className="settings-sidebar">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`settings-menu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="settings-content">
            {activeSection === 'general' && (
              <div className="settings-section">
                <h2 className="section-title">General</h2>
                
                <div className="setting-item">
                  <label className="setting-label">Tema</label>
                  <div className="setting-control">
                    <div className="segmented-control">
                      <button 
                        className={`segment ${settings.theme === 'system' ? 'active' : ''}`}
                        onClick={() => handleThemeChange('system')}
                        data-testid="theme-system-btn"
                      >Sistema</button>
                      <button 
                        className={`segment ${settings.theme === 'light' ? 'active' : ''}`}
                        onClick={() => handleThemeChange('light')}
                        data-testid="theme-light-btn"
                      >Claro</button>
                      <button 
                        className={`segment ${settings.theme === 'dark' ? 'active' : ''}`}
                        onClick={() => handleThemeChange('dark')}
                        data-testid="theme-dark-btn"
                      >Oscuro</button>
                    </div>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">Lenguaje</label>
                  <div className="setting-control">
                    <select 
                      className="setting-select"
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      data-testid="language-select"
                    >
                      <option value="es">Espanol</option>
                      <option value="en">English</option>
                      <option value="pt">Portugues</option>
                      <option value="fr">Francais</option>
                    </select>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">Voz</label>
                  <div className="setting-control clickable" onClick={() => setActiveSection('voice')}>
                    <span className="setting-value">{settings.voiceName || 'Predeterminada'}</span>
                    <ChevronRightIcon />
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">Voz automatica</label>
                  <div className="setting-control">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={settings.autoSpeak}
                        onChange={(e) => handleSettingChange('autoSpeak', e.target.checked)}
                        data-testid="auto-speak-toggle"
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">Velocidad de voz</label>
                  <div className="setting-control">
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2" 
                      step="0.1"
                      value={settings.speechRate}
                      onChange={(e) => handleSettingChange('speechRate', parseFloat(e.target.value))}
                      className="setting-range"
                      data-testid="speech-rate-slider"
                    />
                    <span className="range-value">{settings.speechRate}x</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'interface' && (
              <div className="settings-section">
                <h2 className="section-title">Interfaz</h2>
                
                <div className="setting-item">
                  <label className="setting-label">Tamano de fuente</label>
                  <div className="setting-control">
                    <div className="segmented-control">
                      <button 
                        className={`segment ${settings.fontSize === 'small' ? 'active' : ''}`}
                        onClick={() => handleFontSizeChange('small')}
                        data-testid="font-small-btn"
                      >Pequeno</button>
                      <button 
                        className={`segment ${settings.fontSize === 'medium' ? 'active' : ''}`}
                        onClick={() => handleFontSizeChange('medium')}
                        data-testid="font-medium-btn"
                      >Mediano</button>
                      <button 
                        className={`segment ${settings.fontSize === 'large' ? 'active' : ''}`}
                        onClick={() => handleFontSizeChange('large')}
                        data-testid="font-large-btn"
                      >Grande</button>
                    </div>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">Mostrar avatares</label>
                  <div className="setting-control">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={settings.showAvatars}
                        onChange={(e) => handleSettingChange('showAvatars', e.target.checked)}
                        data-testid="show-avatars-toggle"
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">Animaciones</label>
                  <div className="setting-control">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={settings.animations}
                        onChange={(e) => handleSettingChange('animations', e.target.checked)}
                        data-testid="animations-toggle"
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'models' && (
              <div className="settings-section">
                <h2 className="section-title">Modelos</h2>
                
                <div className="setting-item">
                  <label className="setting-label">Modelo de chat</label>
                  <div className="setting-control">
                    <select 
                      className="setting-select"
                      value={settings.chatModel}
                      onChange={(e) => handleSettingChange('chatModel', e.target.value)}
                      data-testid="chat-model-select"
                    >
                      <option value="gpt-4.1">GPT-4.1</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-3.5">GPT-3.5</option>
                    </select>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">Modelo de imagen</label>
                  <div className="setting-control">
                    <select 
                      className="setting-select"
                      value={settings.imageModel}
                      onChange={(e) => handleSettingChange('imageModel', e.target.value)}
                      data-testid="image-model-select"
                    >
                      <option value="gpt-image-1">GPT Image 1</option>
                      <option value="dall-e-3">DALL-E 3</option>
                    </select>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">Creatividad</label>
                  <div className="setting-control">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                      className="setting-range"
                      data-testid="temperature-slider"
                    />
                    <span className="range-value">{settings.temperature}</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'chats' && (
              <div className="settings-section">
                <h2 className="section-title">Chats</h2>
                
                <div className="setting-item">
                  <label className="setting-label">Guardar historial</label>
                  <div className="setting-control">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={settings.saveHistory}
                        onChange={(e) => handleSettingChange('saveHistory', e.target.checked)}
                        data-testid="save-history-toggle"
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">Mensajes de contexto</label>
                  <div className="setting-control">
                    <select 
                      className="setting-select"
                      value={settings.contextMessages}
                      onChange={(e) => handleSettingChange('contextMessages', parseInt(e.target.value))}
                      data-testid="context-messages-select"
                    >
                      <option value="5">5 mensajes</option>
                      <option value="10">10 mensajes</option>
                      <option value="20">20 mensajes</option>
                      <option value="50">50 mensajes</option>
                    </select>
                  </div>
                </div>
                
                <div className="setting-item danger">
                  <label className="setting-label">Borrar todos los chats</label>
                  <div className="setting-control">
                    <button 
                      className="danger-btn" 
                      onClick={onClearAllChats}
                      data-testid="clear-all-chats-btn"
                    >Borrar todo</button>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'personalization' && (
              <div className="settings-section">
                <h2 className="section-title">Personalizacion</h2>
                
                <div className="setting-item">
                  <label className="setting-label">Nombre del asistente</label>
                  <div className="setting-control">
                    <input 
                      type="text"
                      className="setting-input"
                      value={settings.assistantName}
                      onChange={(e) => handleSettingChange('assistantName', e.target.value)}
                      placeholder="NEXA"
                      data-testid="assistant-name-input"
                    />
                  </div>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">Tu nombre</label>
                  <div className="setting-control">
                    <input 
                      type="text"
                      className="setting-input"
                      value={settings.userName}
                      onChange={(e) => handleSettingChange('userName', e.target.value)}
                      placeholder="Usuario"
                      data-testid="user-name-input"
                    />
                  </div>
                </div>
                
                <div className="setting-item full-width">
                  <label className="setting-label">Instrucciones personalizadas</label>
                  <textarea 
                    className="setting-textarea"
                    value={settings.customInstructions}
                    onChange={(e) => handleSettingChange('customInstructions', e.target.value)}
                    placeholder="Describe como quieres que NEXA responda..."
                    rows={4}
                    data-testid="custom-instructions-textarea"
                  />
                </div>
              </div>
            )}
            
            {activeSection === 'account' && (
              <div className="settings-section">
                <h2 className="section-title">Cuenta</h2>
                <div className="account-info">
                  <div className="account-avatar">
                    <UserIcon />
                  </div>
                  <div className="account-details">
                    <h3>Usuario Local</h3>
                    <p>Sesion activa</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'about' && (
              <div className="settings-section">
                <h2 className="section-title">Sobre nosotros</h2>
                <div className="about-content">
                  <div className="about-logo">
                    <NexaLogo size={60} />
                  </div>
                  <h3>NEXA AI Assistant</h3>
                  <p className="version">Version 3.0.0</p>
                  <p className="description">
                    NEXA es un asistente de inteligencia artificial avanzado con capacidades de voz, 
                    generacion de imagenes, creacion de paginas web y mas.
                  </p>
                  <div className="about-links">
                    <a href="#" className="about-link">Terminos de uso</a>
                    <a href="#" className="about-link">Politica de privacidad</a>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'voice' && (
              <div className="settings-section">
                <h2 className="section-title">Seleccionar Voz</h2>
                <div className="voice-list">
                  {availableVoices.length > 0 ? (
                    availableVoices.map(voice => (
                      <button
                        key={voice.name}
                        className={`voice-item ${settings.voiceId === voice.name ? 'active' : ''}`}
                        onClick={() => handleVoiceChange(voice.name)}
                        data-testid={`voice-${voice.name}`}
                      >
                        <div className="voice-info">
                          <span className="voice-name">{voice.name}</span>
                          <span className="voice-lang">{voice.lang}</span>
                        </div>
                        {settings.voiceId === voice.name && <span className="check-mark">✓</span>}
                      </button>
                    ))
                  ) : (
                    <p className="no-voices">Cargando voces disponibles...</p>
                  )}
                </div>
                <button className="back-to-general" onClick={() => setActiveSection('general')}>
                  <BackIcon /> Volver a General
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================
function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [showFeatureMenu, setShowFeatureMenu] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'es',
    autoSpeak: true,
    speechRate: 1.0,
    fontSize: 'medium',
    showAvatars: true,
    animations: true,
    chatModel: 'gpt-4.1',
    imageModel: 'gpt-image-1',
    temperature: 0.7,
    saveHistory: true,
    contextMessages: 10,
    assistantName: 'NEXA',
    userName: '',
    customInstructions: '',
    voiceId: 'default',
    voiceName: 'Predeterminada'
  });
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const featureMenuRef = useRef(null);

  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('nexa_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({...prev, ...parsed}));
        setAutoSpeak(parsed.autoSpeak ?? true);
        applyTheme(parsed.theme || 'dark');
        applyFontSize(parsed.fontSize || 'medium');
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

  // Close feature menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (featureMenuRef.current && !featureMenuRef.current.contains(event.target)) {
        setShowFeatureMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize speech
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setSpeechSupported(true);
      synthRef.current.onvoiceschanged = () => synthRef.current.getVoices();
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';
      recognitionRef.current.onresult = (event) => { setInputText(event.results[0][0].transcript); setIsListening(false); };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
      setRecognitionSupported(true);
    }
  }, []);

  useEffect(() => {
    const initSession = async () => {
      const storedSessionId = localStorage.getItem('nexa_session_id');
      if (storedSessionId) { setSessionId(storedSessionId); await loadSession(storedSessionId); } else { await createNewSession(); }
      await loadSessions();
    };
    initSession();
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadSessions = async () => { try { const response = await axios.get(`${API}/sessions`); setSessions(response.data.sessions || []); } catch (error) { console.error('Error:', error); } };
  const loadSession = async (sid) => { try { const response = await axios.get(`${API}/sessions/${sid}`); setMessages(response.data.messages || []); } catch (error) { await createNewSession(); } };
  
  const createNewSession = async () => {
    try {
      const response = await axios.post(`${API}/sessions`);
      const newSessionId = response.data.session_id;
      setSessionId(newSessionId);
      localStorage.setItem('nexa_session_id', newSessionId);
      setMessages([]);
      setActiveFeature(null);
      await loadSessions();
      return newSessionId;
    } catch (error) {
      const fallbackId = `local-${Date.now()}`;
      setSessionId(fallbackId);
      localStorage.setItem('nexa_session_id', fallbackId);
      return fallbackId;
    }
  };

  const switchSession = async (sid) => { setSessionId(sid); localStorage.setItem('nexa_session_id', sid); await loadSession(sid); };
  const deleteSession = async (sid, e) => { e.stopPropagation(); try { await axios.delete(`${API}/sessions/${sid}`); if (sid === sessionId) await createNewSession(); await loadSessions(); } catch (error) { console.error('Error:', error); } };

  const speak = useCallback((text) => {
    if (!speechSupported) {
      console.log('Speech not supported');
      return;
    }
    
    // Cancel any ongoing speech
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    
    // Clean text - remove markdown and emojis
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_/g, '')
      .replace(/`/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!cleanText) return;
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = settings.language === 'es' ? 'es-ES' : settings.language === 'en' ? 'en-US' : 'es-ES';
    utterance.pitch = 1.0;
    utterance.rate = settings.speechRate || 1.0;
    utterance.volume = 1.0;
    
    // Get voices and select based on settings
    const voices = synthRef.current.getVoices();
    if (settings.voiceId && settings.voiceId !== 'default') {
      const selectedVoice = voices.find(v => v.name === settings.voiceId);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } else {
      const defaultVoice = voices.find(v => v.lang.includes(settings.language || 'es'));
      if (defaultVoice) {
        utterance.voice = defaultVoice;
      }
    }
    
    utterance.onstart = () => {
      console.log('Speaking started');
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      console.log('Speaking ended');
      setIsSpeaking(false);
    };
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsSpeaking(false);
    };
    
    synthRef.current.speak(utterance);
  }, [speechSupported, settings.speechRate, settings.voiceId, settings.language]);

  const toggleListening = () => {
    if (!recognitionSupported) { alert('Reconocimiento de voz no soportado.'); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); } else { try { recognitionRef.current.start(); setIsListening(true); } catch (error) { console.error('Error:', error); } }
  };

  const handleFeatureClick = (feature) => {
    setActiveFeature(activeFeature === feature ? null : feature);
    setShowFeatureMenu(false);
    
    if (feature === 'image') setInputText('Genera una imagen de ');
    else if (feature === 'web') setInputText('Crea una pagina web sobre ');
    else if (feature === 'video') setInputText('Crea un guion de video sobre ');
    else if (feature === 'search') {
      setIsSearchMode(true);
      setIsThinkingMode(false);
      setInputText('');
    }
    else if (feature === 'thinking') {
      setIsThinkingMode(true);
      setIsSearchMode(false);
      setInputText('');
    }
    inputRef.current?.focus();
  };
  
  // Clear all chats
  const clearAllChats = async () => {
    if (window.confirm('¿Seguro que quieres borrar todos los chats?')) {
      try {
        for (const session of sessions) {
          await axios.delete(`${API}/sessions/${session.session_id}`);
        }
        await createNewSession();
        await loadSessions();
      } catch (error) {
        console.error('Error clearing chats:', error);
      }
    }
  };
  
  // Remove uploaded file
  const removeUploadedFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    
    const userMessage = { 
      id: `user-${Date.now()}`, 
      role: 'user', 
      content: inputText.trim() + (uploadedFiles.length > 0 ? `\n[Archivos adjuntos: ${uploadedFiles.map(f => f.name).join(', ')}]` : ''),
      timestamp: new Date().toISOString() 
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setUploadedFiles([]);
    setIsLoading(true);
    
    try {
      // Check if it's a special feature request
      let endpoint = `${API}/chat`;
      let payload = { 
        message: currentInput, 
        session_id: sessionId, 
        include_history: true, 
        creative_mode: isThinkingMode || activeFeature === 'thinking',
        search_mode: isSearchMode,
        custom_instructions: settings.customInstructions,
        user_name: settings.userName,
        assistant_name: settings.assistantName
      };
      
      // Handle image generation
      if (activeFeature === 'image' || (currentInput.toLowerCase().includes('genera') && currentInput.toLowerCase().includes('imagen'))) {
        endpoint = `${API}/generate/image`;
        const prompt = currentInput.replace(/genera una imagen de/i, '').replace(/genera imagen de/i, '').trim();
        payload = { prompt: prompt || currentInput, style: 'realistic' };
        const response = await axios.post(endpoint, payload);
        if (response.data.success && response.data.image_base64) {
          const assistantMsg = { 
            id: `assistant-${Date.now()}`, 
            role: 'assistant', 
            content: `He generado esta imagen para ti:`, 
            timestamp: new Date().toISOString(),
            image: `data:image/png;base64,${response.data.image_base64}`
          };
          setMessages(prev => [...prev, assistantMsg]);
          if (autoSpeak) {
            setTimeout(() => speak('He generado la imagen que pediste'), 500);
          }
        }
      } 
      // Handle website generation
      else if (activeFeature === 'web' || (currentInput.toLowerCase().includes('crea') && currentInput.toLowerCase().includes('pagina'))) {
        endpoint = `${API}/generate/website`;
        const prompt = currentInput.replace(/crea una pagina web sobre/i, '').replace(/crea pagina web/i, '').trim();
        payload = { prompt: prompt || currentInput, style: 'modern' };
        const response = await axios.post(endpoint, payload);
        if (response.data.success) {
          const codeContent = `He creado tu pagina web!\n\n**HTML:**\n\`\`\`html\n${response.data.html}\n\`\`\`\n\n**CSS:**\n\`\`\`css\n${response.data.css}\n\`\`\`${response.data.js ? `\n\n**JavaScript:**\n\`\`\`javascript\n${response.data.js}\n\`\`\`` : ''}`;
          setMessages(prev => [...prev, { 
            id: `assistant-${Date.now()}`, 
            role: 'assistant', 
            content: codeContent, 
            timestamp: new Date().toISOString(),
            websiteData: response.data
          }]);
          if (autoSpeak) {
            setTimeout(() => speak('He creado tu pagina web. Puedes ver el codigo generado.'), 500);
          }
        }
      } 
      // Handle video script generation
      else if (activeFeature === 'video' || (currentInput.toLowerCase().includes('guion') || currentInput.toLowerCase().includes('video'))) {
        endpoint = `${API}/generate/video-script`;
        const prompt = currentInput.replace(/crea un guion de video sobre/i, '').replace(/guion de video/i, '').trim();
        payload = { prompt: prompt || currentInput, duration: '1 minute' };
        const response = await axios.post(endpoint, payload);
        if (response.data.success) {
          setMessages(prev => [...prev, { 
            id: `assistant-${Date.now()}`, 
            role: 'assistant', 
            content: response.data.script, 
            timestamp: new Date().toISOString()
          }]);
          if (autoSpeak) {
            setTimeout(() => speak(response.data.script.substring(0, 200)), 500);
          }
        }
      } 
      // Regular chat
      else {
        const response = await axios.post(endpoint, payload);
        const assistantResponse = response.data.response;
        setMessages(prev => [...prev, { 
          id: response.data.message_id || `assistant-${Date.now()}`, 
          role: 'assistant', 
          content: assistantResponse, 
          timestamp: new Date().toISOString() 
        }]);
        
        // Auto speak response
        if (autoSpeak) {
          setTimeout(() => speak(assistantResponse), 500);
        }
      }
      
      await loadSessions();
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        id: `error-${Date.now()}`, 
        role: 'assistant', 
        content: 'Error al procesar tu mensaje. Intenta de nuevo.', 
        timestamp: new Date().toISOString() 
      }]);
    } finally { 
      setIsLoading(false); 
      setActiveFeature(null);
      setIsSearchMode(false);
      setIsThinkingMode(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    for (const file of files) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`El archivo ${file.name} es demasiado grande. Maximo 10MB.`);
        continue;
      }
      
      // Add to uploaded files list
      const fileObj = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      };
      
      setUploadedFiles(prev => [...prev, fileObj]);
      
      // If it's an image, try to upload to server
      if (file.type.startsWith('image/')) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await axios.post(`${API}/upload/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log('Image uploaded:', response.data);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    }
    
    e.target.value = '';
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewSession}>
            <PlusIcon />
            <span>Nueva conversacion</span>
          </button>
        </div>
        
        <div className="sidebar-content">
          <div className="sessions-section">
            <div className="section-title">
              <HistoryIcon />
              <span>Historial</span>
            </div>
            <div className="sessions-list">
              {sessions.slice(0, 20).map((session) => (
                <div
                  key={session.session_id}
                  className={`session-item ${session.session_id === sessionId ? 'active' : ''}`}
                  onClick={() => switchSession(session.session_id)}
                >
                  <span className="session-title">{session.title || 'Nueva conversacion'}</span>
                  <button className="delete-session-btn" onClick={(e) => deleteSession(session.session_id, e)}>
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <button className="settings-btn" onClick={() => setShowSettings(true)}>
            <SettingsIcon />
            <span>Configuracion</span>
          </button>
        </div>
      </aside>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPage 
          onClose={() => setShowSettings(false)} 
          settings={settings}
          setSettings={setSettings}
          onClearAllChats={clearAllChats}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="main-header">
          <button className="toggle-sidebar-btn" onClick={() => setShowSidebar(!showSidebar)} title={showSidebar ? 'Cerrar sidebar' : 'Abrir sidebar'}>
            {showSidebar ? <SidebarCloseIcon /> : <SidebarOpenIcon />}
          </button>
          <div className="header-title">
            <NexaLogo size={32} />
            <span>NEXA</span>
          </div>
          <div className="header-actions">
            <button 
              className={`voice-toggle ${autoSpeak ? 'active' : ''}`} 
              onClick={() => setAutoSpeak(!autoSpeak)}
              title={autoSpeak ? 'Desactivar voz automatica' : 'Activar voz automatica'}
            >
              <SpeakerIcon muted={!autoSpeak} />
              <span className="voice-label">{autoSpeak ? 'Voz ON' : 'Voz OFF'}</span>
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="chat-area">
          {messages.length === 0 ? (
            <div className="welcome-container">
              <div className="welcome-content">
                <NexaLogo size={80} />
                <h1 className="welcome-title">Donde quieres empezar?</h1>
                
                <div className="features-grid">
                  <FeatureCard icon={<BrainIcon />} title="Pensamiento" onClick={() => handleFeatureClick('thinking')} active={activeFeature === 'thinking'} />
                  <FeatureCard icon={<GlobeIcon />} title="Buscar" onClick={() => handleFeatureClick('search')} active={activeFeature === 'search'} />
                  <FeatureCard icon={<ImageGenIcon />} title="Crear Imagen" onClick={() => handleFeatureClick('image')} active={activeFeature === 'image'} />
                  <FeatureCard icon={<WebDevIcon />} title="Crear Web" onClick={() => handleFeatureClick('web')} active={activeFeature === 'web'} />
                  <FeatureCard icon={<VideoIcon />} title="Crear Video" onClick={() => handleFeatureClick('video')} active={activeFeature === 'video'} />
                </div>
              </div>
            </div>
          ) : (
            <div className="messages-container">
              {messages.map((msg) => (
                <Message key={msg.id} message={msg} onSpeak={speak} settings={settings} />
              ))}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-avatar"><NexaLogo size={32} /></div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="input-area">
          {/* Active Mode Indicator */}
          {(isThinkingMode || isSearchMode || activeFeature) && (
            <div className="active-mode-indicator">
              {isThinkingMode && <><SparklesIcon /> Modo Pensamiento Activo</>}
              {isSearchMode && <><GlobeIcon /> Modo Busqueda Activo</>}
              {activeFeature === 'image' && <><ImageGenIcon /> Generando Imagen</>}
              {activeFeature === 'web' && <><WebDevIcon /> Creando Web</>}
              {activeFeature === 'video' && <><VideoIcon /> Creando Video</>}
              <button className="clear-mode-btn" onClick={() => { setIsThinkingMode(false); setIsSearchMode(false); setActiveFeature(null); }}>
                <XIcon />
              </button>
            </div>
          )}
          
          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files-preview">
              {uploadedFiles.map((file, index) => (
                <div key={file.id} className="uploaded-file-item">
                  <FileIcon />
                  <span className="file-name">{file.name}</span>
                  <button className="remove-file-btn" onClick={() => removeUploadedFile(index)}>
                    <XIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <form className="input-form" onSubmit={sendMessage}>
            {/* Feature Menu Button (Plus) */}
            <div className="feature-menu-container" ref={featureMenuRef}>
              <button 
                type="button" 
                className={`input-action-btn feature-menu-btn ${showFeatureMenu ? 'active' : ''}`} 
                onClick={() => setShowFeatureMenu(!showFeatureMenu)}
                data-testid="feature-menu-btn"
              >
                <PlusIcon />
              </button>
              
              {showFeatureMenu && (
                <div className="feature-dropdown-menu" data-testid="feature-dropdown">
                  <button type="button" onClick={() => { fileInputRef.current?.click(); setShowFeatureMenu(false); }}>
                    <AttachIcon /> Adjuntar archivo
                  </button>
                  <button type="button" onClick={() => handleFeatureClick('image')}>
                    <ImageGenIcon /> Generar imagen
                  </button>
                  <button type="button" onClick={() => handleFeatureClick('web')}>
                    <WebDevIcon /> Crear pagina web
                  </button>
                  <button type="button" onClick={() => handleFeatureClick('video')}>
                    <VideoIcon /> Crear guion de video
                  </button>
                </div>
              )}
            </div>
            
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple accept="image/*,.pdf,.doc,.docx,.txt" />
            
            {/* Thinking Mode Button */}
            <button 
              type="button" 
              className={`input-action-btn mode-btn ${isThinkingMode ? 'active' : ''}`}
              onClick={() => { setIsThinkingMode(!isThinkingMode); setIsSearchMode(false); }}
              title="Modo Pensamiento Profundo"
              data-testid="thinking-mode-btn"
            >
              <SparklesIcon />
            </button>
            
            {/* Search Mode Button */}
            <button 
              type="button" 
              className={`input-action-btn mode-btn ${isSearchMode ? 'active' : ''}`}
              onClick={() => { setIsSearchMode(!isSearchMode); setIsThinkingMode(false); }}
              title="Modo Busqueda"
              data-testid="search-mode-btn"
            >
              <GlobeIcon />
            </button>
            
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isThinkingMode ? "Piensa profundamente sobre..." : isSearchMode ? "Buscar informacion sobre..." : "Escribe tu mensaje..."}
              className="chat-input"
              disabled={isLoading}
              data-testid="chat-input"
            />
            
            <button 
              type="button" 
              className={`input-action-btn ${isListening ? 'recording' : ''}`} 
              onClick={toggleListening}
              title="Grabar voz"
              data-testid="mic-btn"
            >
              <MicIcon active={isListening} />
            </button>
            
            <button 
              type="submit" 
              className="send-btn" 
              disabled={!inputText.trim() || isLoading}
              data-testid="send-btn"
            >
              <SendIcon />
            </button>
          </form>
          
          <p className="input-hint">NEXA puede cometer errores. Verifica la informacion importante.</p>
        </div>
      </main>
    </div>
  );
}

export default App;
