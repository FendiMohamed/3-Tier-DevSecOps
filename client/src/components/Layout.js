import React, { useState, useEffect } from 'react';
import logo from '../logo.svg';
import InfoPopup from './InfoPopup';
import AnimatedBanner from './AnimatedBanner';

const QUOTES = [
  'Focus on being productive instead of busy. – Tim Ferriss',
  'It always seems impossible until it is done. – Nelson Mandela',
  'Do the hard things first.',
  'What gets scheduled gets done.',
  'Small progress is still progress.',
  'Your future is created by what you do today.'
];

function Layout({ children }) {
  const [showInfo, setShowInfo] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [, setTick] = useState(0); // re-render for clock

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const cycleQuote = () => setQuoteIndex(i => (i + 1) % QUOTES.length);
  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));
  const currentQuote = QUOTES[quoteIndex];
  return (
    <div className="app-layout">
      <header className="app-header slide-down">
        <div className="brand">
          <img src={logo} alt="DevOps Shack logo" className="logo" />
          <div>
            <h1 className="brand-title">TaskForge</h1>
            <p className="nav-subtitle">Collaborative Todo Workspace</p>
          </div>
        </div>
      </header>
  <AnimatedBanner message="Welcome to TaskForge – Plan. Focus. Ship. ✅" />
      <div className="app-body">
        <aside className="sidebar slide-in-left">
          <h3>Focus Panel</h3>
          <div className="focus-time" aria-label="Current time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <blockquote className="motivation">{currentQuote}</blockquote>
          <div className="sidebar-actions">
            <button type="button" onClick={cycleQuote}>New Quote</button>
            <button type="button" onClick={toggleTheme}>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</button>
          </div>
        </aside>
        <main className="main-content fade-in">
          {children}
        </main>
      </div>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} TaskForge. All rights reserved.</p>
      </footer>

      <button className="help-btn" onClick={() => setShowInfo(true)}>?</button>
      {showInfo && <InfoPopup onClose={() => setShowInfo(false)} />}

      <div className="bubble-container">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bubble" />
        ))}
      </div>
      <div className="star-container">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="star" />
        ))}
      </div>
    </div>
  );
}

export default Layout;
