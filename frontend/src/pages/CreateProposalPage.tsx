// src/pages/CreateProposalPage.tsx

import React, { useState } from 'react';
import { createNewProposal, Proposal } from '../utils/api';

const CreateProposalPage: React.FC = () => {
    // NOTE: Use your single owner address from db.ts for 'senderAddress'
    const [senderAddress] = useState('0x7aa4262372ebc33202a1e2596a2f5736530bd8289aab4d9f961a4bc5d9e7f050'); 
    const [recipient, setRecipient] = useState('0x0000000000000000000000000000000000000000000000000000000000000000'); // Placeholder address
    const [amount, setAmount] = useState('100000000'); // Amount in MIST (e.g., 0.1 SUI)

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Proposal | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await createNewProposal(recipient, amount, senderAddress);
            setResult(data.proposal);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Applying dark theme card background
        <div className="card" style={{ backgroundColor: '#1F2937' }}> 
            <h2>✨ Create New Proposal (POST /api/proposal/create)</h2>
            <p className="mb-4 text-sm" style={{ color: '#9CA3AF' }}>
                This simulates the transaction and generates the unsigned `rawTxBytes` needed for signing.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                    <label className="font-semibold mb-2 block" style={{ color: '#D1D5DB' }}>
                        Sender Address (Owner)
                    </label>
                    <input 
                        type="text" 
                        value={senderAddress} 
                        // Note: Removed onChange since senderAddress is a static owner address
                        readOnly // Prevent accidental editing of the owner key
                        placeholder="Owner Address"
                        required 
                        className="text-input-readonly" // Use dark theme readonly class
                    />
                </div>
                
                <div className="form-group">
                    <label className="font-semibold mb-2 block" style={{ color: '#D1D5DB' }}>
                        Recipient Address
                    </label>
                    <input 
                        type="text" 
                        value={recipient} 
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="e.g., 0x..."
                        required 
                        className="text-input" // Use dark theme input class
                    />
                </div>
                
                <div className="form-group">
                    <label className="font-semibold mb-2 block" style={{ color: '#D1D5DB' }}>
                        Amount (MIST)
                    </label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g., 100000000 (0.1 SUI)"
                        required 
                        className="text-input" // Use dark theme input class
                    />
                </div>
                
                <button type="submit" className="primary-button" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                    {loading ? 'Creating...' : 'Create Proposal'}
                </button>
            </form>

            {/* ERROR MESSAGE STYLING */}
            {error && (
                <div className="mt-4 py-2 px-4 font-bold" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', borderRadius: '0.5rem' }}>
                    ⚠️ Error: {error}
                </div>
            )}

            {/* SUCCESS MESSAGE & RESULT STYLING */}
            {result && (
                <div className="mt-4 py-4 px-4" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '0.5rem', border: '1px solid #10B981' }}>
                    <h3 style={{ color: '#34D399', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        ✅ Proposal Created! (ID: {result.id})
                    </h3>
                    <p className="text-sm" style={{ color: '#D1D5DB' }}>
                        Raw Tx Bytes (Required for Signing):
                    </p>
                    <code style={{ 
                        display: 'block', 
                        wordWrap: 'break-word', 
                        fontSize: '0.8rem', 
                        opacity: 0.9, 
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: '#111827',
                        color: '#10B981', // Bright green for the bytes
                        borderRadius: '4px'
                    }}>
                        {result.rawTxBytes}
                    </code>
                    <p className="mt-3 font-semibold" style={{ color: '#FCD34D' }}>
                        ➡️ Go to **View Proposals** to sign it (Simulation).
                    </p>
                </div>
            )}
        </div>
    );
};

export default CreateProposalPage;