// src/pages/ProposalsPage.tsx

import React, { useState, useEffect } from 'react';
import { getProposals, Proposal, Signature } from '../utils/api';

const OWNER_ADDRESS = '0x7aa4262372ebc33202a1e2596a2f5736530bd8289aab4d9f961a4bc5d9e7f050'; // The owner address used in your db.ts
const SIGNATURE: Signature = {
    address: OWNER_ADDRESS,
    signature: "AEeS6YLp8683y2iRWtAFXK8V5Qtssd8arOGaZemI8pTY7nhCV3lU17Qvuu575fToLJkMTt1esNwPcdFg6JocwqQ6MNJUIXdX1L3+wYQ9DJD0eli/TP6504VhdXPPc5vQ==",
};


interface ProposalItemProps {
    proposal: Proposal;
    // Handler passed from parent to update the proposals state
    onSign: (proposalId: number, signature: Signature) => void; 
}


const ProposalItem: React.FC<ProposalItemProps> = ({ proposal, onSign }) => {
    const [signing, setSigning] = useState(false);
    const [signStatus, setSignStatus] = useState<'success' | 'executing' | null>(null);
    
    const handleSign = async () => {
        setSigning(true);
        setSignStatus('executing');
        
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        
        // Call the parent handler to locally update the proposal state
        onSign(proposal.id, SIGNATURE);
        
        setSignStatus('success');
        setSigning(false);
    };

    const isSigned = proposal.currentSignatures.some(s => s.address === OWNER_ADDRESS);
    const canSign = !proposal.isExecuted && !isSigned;
    const isReadyToExecute = !proposal.isExecuted && (proposal.currentSignatures.length + 1) >= proposal.requiredSignatures;

    // Enhanced Status Badges using color codes
    const statusText = proposal.isExecuted 
        ? <span className="status-badge" style={{ backgroundColor: '#10B981', color: '#064E3B', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>✅ EXECUTED</span>
        : (isReadyToExecute
            ? <span className="status-badge" style={{ backgroundColor: '#FCD34D', color: '#78350F', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>⚠️ READY TO EXECUTE</span>
            : <span className="status-badge" style={{ backgroundColor: '#EF4444', color: '#7F1D1D', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>⏳ PENDING</span>
        );

    return (
        <div 
            className="proposal-item space-y-3 p-4 rounded-lg" 
            style={{ 
                backgroundColor: '#374151', // Darker background for item
                // Border color based on status
                border: proposal.isExecuted ? '1px solid #10B981' : (isReadyToExecute ? '1px solid #FCD34D' : '1px solid #4B5563') 
            }}
        >
            
            {/* Header and Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#F3F4F6' }}>Proposal ID <span style={{ color: '#60A5FA' }}>#{proposal.id}</span></h3>
                {statusText}
            </div>

            {/* Transaction Details Block */}
            <div style={{ padding: '0.5rem', backgroundColor: '#1F2937', borderRadius: '4px' }}>
                <p className="text-sm" style={{ color: '#D1D5DB' }}>
                    **Amount:** <span style={{ color: '#FBBF24', fontWeight: 'bold' }}>{proposal.amount} MIST</span> 
                    {' | '} 
                    **Recipient:** <code className="text-sm" style={{ color: '#9CA3AF' }}>{proposal.recipient}</code>
                </p>
            </div>

            {/* Signatures */}
            <div className="text-sm">
                <p style={{ color: '#D1D5DB', marginBottom: '0.5rem' }}>
                    **Signatures:** <span style={{ color: '#10B981', fontWeight: 'bold' }}>{proposal.currentSignatures.length}</span> / {proposal.requiredSignatures}
                </p>
                <ul className="signature-list space-y-1" style={{ borderLeft: '3px solid #60A5FA', paddingLeft: '10px' }}>
                    {proposal.currentSignatures.map((sig) => (
                        <li 
                            key={`${proposal.id}-${sig.address}`} 
                            className="text-sm" 
                            style={{ wordWrap: 'break-word', opacity: 0.8, color: '#9CA3AF' }}
                        >
                            🔑 {sig.address}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Success and Execution Feedback */}
            {signStatus === 'executing' && (
                <div style={{ backgroundColor: 'rgba(192, 132, 252, 0.2)', color: '#C084FC', padding: '0.5rem', borderRadius: '0.25rem', fontWeight: 'semibold' }}>
                    ⏳ Signing... Submitting transaction to Sui network.
                </div>
            )}
            {signStatus === 'success' && (
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '0.5rem', borderRadius: '0.25rem', fontWeight: 'semibold' }}>
                    🎉 **SUCCESS!** Signature added and proposal executed .
                </div>
            )}
            
            {/* Sign Button */}
            {canSign && (
                <button 
                    onClick={handleSign} 
                    className="primary-button mt-4" 
                    style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '1rem' }} 
                    disabled={signing}
                >
                    {signing 
                        ? (isReadyToExecute ? 'Executing...' : 'Signing...')
                        : (isReadyToExecute ? '⚡ Sign & Execute' : '✍️ Sign Proposal')
                    }
                </button>
            )}
        </div>
    );
};


const ProposalsPage: React.FC = () => {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProposals = () => {
        setLoading(true);
        setError(null);
        getProposals()
            .then(data => setProposals(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProposals();
    }, []);
    
    const handleSign = (proposalId: number, signature: Signature) => {
        setProposals(prevProposals => 
            prevProposals.map(p => {
                if (p.id === proposalId) {
                    const isAlreadySigned = p.currentSignatures.some(s => s.address === signature.address);
                    
                    if (isAlreadySigned) return p;

                    const newSignatures = [...p.currentSignatures, signature];
                    
                    // Check if the new signature count meets or exceeds the required threshold
                    const isNowExecuted = newSignatures.length >= p.requiredSignatures;
                    
                    return {
                        ...p,
                        currentSignatures: newSignatures,
                        isExecuted: isNowExecuted,
                    };
                }
                return p;
            })
        );
    };

    return (
        <div className="card" style={{ backgroundColor: '#1F2937' }}>
            <h2>📜 View Proposals ( Signing)</h2>
            <p className="mb-4 text-sm" style={{ color: '#9CA3AF' }}>
                This page fetches proposals from your backend, but the **Sign** button  a successful execution entirely in the frontend.
            </p>
            
            {/* Enhanced Refresh Button Styling */}
            <button 
                onClick={fetchProposals} 
                className="primary-button mb-4" 
                style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', backgroundColor: '#4B5563', color: '#D1D5DB' }}
                disabled={loading}
            >
                {loading ? '🔄 Refreshing...' : '🔄 Refresh List (Backend Call)'}
            </button>
            
            {/* Error Message Styling */}
            {error && (
                <div className="mt-4 py-2 px-4 font-bold" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', borderRadius: '0.5rem' }}>
                    ❌ Error fetching proposals: {error}
                </div>
            )}

            <div className="space-y-4">
                {proposals.length === 0 && !loading && !error ? (
                    <p className="text-center text-lg py-4" style={{ color: '#9CA3AF' }}>No proposals found. Create one first!</p>
                ) : (
                    proposals.map(proposal => (
                        <ProposalItem 
                            key={proposal.id} 
                            proposal={proposal} 
                            onSign={handleSign} 
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ProposalsPage;