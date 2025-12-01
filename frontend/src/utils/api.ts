// src/utils/api.ts

const API_URL = 'http://localhost:3001/api';

export interface Signature {
    address: string; 
    signature: string; // Base64 encoded signature
}

export interface Proposal {
    id: number;
    recipient: string;
    amount: string; 
    rawTxBytes: string;
    currentSignatures: Signature[]; // Changed type to Signature[]
    isExecuted: boolean; 
    requiredSignatures: number; 
}

export interface MultisigInfo {
    owners: string[];
    threshold: number;
    treasuryId: string;
}

// 1. Get Info (GET /api/multisig/info) - CONNECTED TO BACKEND
export async function getMultisigInfo(): Promise<MultisigInfo> {
    const response = await fetch(`${API_URL}/multisig/info`);
    if (!response.ok) throw new Error('Failed to fetch multisig info');
    return response.json();
}

// 2. Get Proposals (GET /api/proposals) - CONNECTED TO BACKEND
export async function getProposals(): Promise<Proposal[]> {
    const response = await fetch(`${API_URL}/proposals`);
    if (!response.ok) throw new Error('Failed to fetch proposals');
    return response.json();
}

// 3. Create Proposal (POST /api/proposal/create) - CONNECTED TO BACKEND
export async function createNewProposal(recipient: string, amount: string, senderAddress: string): Promise<{ proposal: Proposal }> {
    const response = await fetch(`${API_URL}/proposal/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, amount, senderAddress }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create proposal');
    }
    return response.json();
}

// NOTE: The signProposal function has been REMOVED. 
// The signing logic is now handled by a local simulation in ProposalsPage.tsx