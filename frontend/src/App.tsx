// src/App.tsx
import React, { useState } from 'react';
import WelcomePage from './pages/WelcomePage';
import InfoPage from './pages/InfoPage';
import CreateProposalPage from './pages/CreateProposalPage';
import ProposalsPage from './pages/ProposalsPage';
import './App.css'; // Import global CSS

// Define the available routes
type Route = 'welcome' | 'info' | 'create' | 'proposals' | 'simulation';

// Simple Navigation Component
const Nav: React.FC<{ current: Route, setRoute: (r: Route) => void }> = ({ current, setRoute }) => {
  const navItems: { label: string, route: Route }[] = [
    { label: 'Welcome', route: 'welcome' },
    { label: 'MultiSig Info', route: 'info' },
    { label: 'Create Proposal', route: 'create' },
    { label: 'View Proposals', route: 'proposals' },
   
  ];

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
        {navItems.map(item => (
          <button
            key={item.route}
            onClick={() => setRoute(item.route)}
            className={`nav-item ${current === item.route ? 'active' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};


const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>('welcome');

  const renderPage = () => {
    switch (currentRoute) {
      case 'info':
        return <InfoPage />;
      case 'create':
        return <CreateProposalPage />;
      case 'proposals':
        return <ProposalsPage />;
      case 'welcome':
      default:
        return <WelcomePage />;
    }
  };

  return (
    <div className="app-container">
      <Nav current={currentRoute} setRoute={setCurrentRoute} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;