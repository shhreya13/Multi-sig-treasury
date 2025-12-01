// src/pages/InfoPage.tsx

import React, { useState, useEffect } from 'react';
import { getMultisigInfo, MultisigInfo } from '../utils/api'; 

const InfoPage: React.FC = () => {
    const [info, setInfo] = useState<MultisigInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        getMultisigInfo()
            .then(data => {
                setInfo(data);
            })
            .catch(err => {
                setError(err.message || "Failed to fetch MultiSig information.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="card" style={{ backgroundColor: '#1F2937' }}><h2>MultiSig Info ℹ️</h2><p style={{ color: '#9CA3AF' }}>Loading configuration...</p></div>;
    }

    if (error) {
        return <div className="card" style={{ backgroundColor: '#1F2937' }}>
            <h2>MultiSig Info ⚠️</h2>
            <p className="text-red font-bold" style={{ color: '#F87171' }}>Error connecting to backend:</p>
            <p style={{ color: '#EF4444' }}>{error}</p>
        </div>;
    }

    return (
        <div className="card" style={{ backgroundColor: '#1F2937' }}>
            <h2>MultiSig Info ℹ️ (GET /api/multisig/info)</h2>
            {info && (
                <div className="space-y-4">
                    
                    <div className="info-block" style={{ borderLeft: '4px solid #FCD34D', paddingLeft: '1rem' }}>
                        <h3 className="text-xl font-bold" style={{ color: '#FCD34D' }}>🔑 Required Signatures (Threshold)</h3>
                        <p className="text-2xl font-mono text-purple" style={{ color: '#C084FC' }}>{info.threshold}</p>
                        <p className="text-sm" style={{ color: '#9CA3AF' }}>Number of signatures required to execute a transaction.</p>
                    </div>

                    <div className="info-block" style={{ borderLeft: '4px solid #10B981', paddingLeft: '1rem' }}>
                        <h3 className="text-xl font-bold" style={{ color: '#10B981' }}>💰 Treasury Object ID</h3>
                        <code className="break-all text-green text-lg" style={{ color: '#34D399' }}>{info.treasuryId}</code>
                        <p className="text-sm" style={{ color: '#9CA3AF' }}>The shared object ID of the MultiSig Wallet, holding the funds.</p>
                    </div>

                    <div className="info-block" style={{ borderLeft: '4px solid #3B82F6', paddingLeft: '1rem' }}>
                        <h3 className="text-xl font-bold" style={{ color: '#3B82F6' }}>👥 Authorized Owners ({info.owners.length})</h3>
                        <ul className="owner-list" style={{ marginTop: '0.5rem' }}>
                            {info.owners.map((owner, index) => (
                                <li key={index} className="owner-address" style={{ marginBottom: '0.25rem' }}>
                                    <code className="break-all" style={{ color: '#60A5FA' }}>{owner}</code>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InfoPage;