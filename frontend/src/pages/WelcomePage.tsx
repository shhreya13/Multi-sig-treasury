// src/pages/WelcomePage.tsx

import React from 'react';

const WelcomePage: React.FC = () => {
  return (
    <div className="card" style={{ backgroundColor: '#1F2937' }}> 
      
      <h1>
        Welcome to the MultiSig Wallet Dashboard 🏦
      </h1>
      
      <p className="text-lg mb-6" style={{ color: '#D1D5DB' }}>
        This is a demo interface for interacting with your Sui Move MultiSig smart contracts.
      </p>

      <div className="space-y-4">
        <h3 style={{ color: '#9CA3AF' }}>🚀 How to Use This Dashboard:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
                <b style={{ color: '#FFE5B4' }}>MultiSig Info ℹ️</b>: View the wallet's owners, the required signature threshold, and the Treasury Object ID.
            </li>
            <li>
                <b style={{ color: '#FFE5B4' }}>Create Proposal ✨</b>: Initiate a new transfer transaction and view the resulting raw transaction bytes.
            </li>
            <li>
                <b style={{ color: '#FFE5B4' }}>View Proposals 📜</b>: See all pending proposals. You can sign a proposal here.
            </li>
        </ul>
      </div>

      <p className="text-sm mt-6 text-gray-400">
        To make this application fully functional, ensure your backend server is running and the placeholder keys in `server.ts` are updated to real Base64 public keys.
      </p>
    </div>
  );
};

export default WelcomePage;