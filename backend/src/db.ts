// backend/src/db.ts

// --- Configuration Constants (Updated to your NEW deployed IDs) ---

// The Package ID from your successful deployment (Immutable Object)
export const PACKAGE_ID = "0xbd901e7b486babbb8ee42efa6caadfd4bcdd61611c1b35bccc440463c02ed9b5";

// The MultiSigWallet Object ID (TREASURY_ID - Shared Object)
export const TREASURY_ID = "0x47a42ce6e4d465c54db3f3fd903a80798b2d361695c4b2f090558ae2824e1c19";

// List of all authorized wallet owner addresses (Your only address)
export const MULTISIG_WALLET_OWNERS = [
    "0x7aa4262372ebc33202a1e2596a2f5736530bd8289aab4d9f961a4bc5d9e7f050",
];

// Number of signatures required to execute a proposal
export const MULTISIG_THRESHOLD = 1; 


// --- In-Memory Database Structure ---

interface Signature {
    address: string; 
    signature: string; // Base64 encoded signature
}

export interface Proposal {
    id: number;
    recipient: string;
    amount: string; // The amount in MIST
    rawTxBytes: string; // Base64 encoded transaction bytes
    currentSignatures: Signature[];
    isExecuted: boolean; 
    requiredSignatures: number; 
}

// Simple in-memory storage for proposals
const proposals: Proposal[] = [];
let nextProposalId = 1;


// --- Database Functions ---

export function getProposals(): Proposal[] {
    return proposals;
}

export function getProposal(id: string | number): Proposal | undefined {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    return proposals.find(p => p.id === numId);
}

// FIX 1: Change argument order and ensure it matches the 3 arguments sent from server.ts
export function createProposal(
    recipient: string, // Changed position
    amount: string,    // Changed position
    rawTxBytes: string,
): Proposal {
    const newProposal: Proposal = {
        id: nextProposalId++,
        recipient,
        amount,
        rawTxBytes,
        currentSignatures: [], 
        isExecuted: false,
        requiredSignatures: MULTISIG_THRESHOLD,
    };
    proposals.push(newProposal);
    return newProposal;
}

// FIX 2: Change arguments to match the 3 separate values sent from server.ts
export function addSignature(proposalId: string | number, signerAddress: string, signature: string): Proposal | undefined {
    const numId = typeof proposalId === 'string' ? parseInt(proposalId, 10) : proposalId;
    const proposal = getProposal(numId);
    
    if (!proposal) return undefined;

    // We must rebuild the Signature object here from the separate parameters
    const newSignature: Signature = { address: signerAddress, signature: signature };

    // Check if this owner has already signed
    const existingSig = proposal.currentSignatures.find(s => s.address === newSignature.address);
    if (existingSig) {
        return proposal;
    }

    // Only allow signatures from recognized owners
    if (MULTISIG_WALLET_OWNERS.includes(newSignature.address)) {
        proposal.currentSignatures.push(newSignature);
    }
    
    return proposal;
}

// FIX 3: Add the 'success' argument to match the 2 arguments sent from server.ts
export function markExecuted(proposalId: string | number, success: boolean): Proposal | undefined {
    const numId = typeof proposalId === 'string' ? parseInt(proposalId, 10) : proposalId;
    const proposal = getProposal(numId);
    if (proposal) {
        // Mark execution status based on success/failure
        proposal.isExecuted = success; 
    }
    return proposal;
}
