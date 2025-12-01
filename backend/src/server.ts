// backend/src/server.ts

import express, { Request, Response } from 'express';
import cors from 'cors';

// Import necessary Sui SDK components
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions'; 
import { MultiSigPublicKey } from '@mysten/sui/multisig';
import { PublicKey } from '@mysten/sui/cryptography';
import { Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519'; 
// CRITICAL: Import Base64 utilities for encoding/decoding keys and transaction bytes
import { normalizeSuiAddress, toB64, fromB64 } from '@mysten/sui/utils'; 


// Assuming your db.ts has been updated to match the function signatures:
// createProposal(recipient, amount, rawTxBytes)
// addSignature(proposalId, signerAddress, signature)
// markExecuted(proposalId, success)
import {
    getProposals, getProposal, createProposal, addSignature, markExecuted,
    MULTISIG_WALLET_OWNERS, MULTISIG_THRESHOLD, TREASURY_ID,
} from './db'; 


// --- ⚠️ CRITICAL PUBLIC KEY SETUP ⚠️ ---

// You MUST replace this placeholder with the actual Base64 Public Key for your 
// owner address (0x7aa42623...). This key is required by the Sui network 
// to validate the signature and link it to the multi-sig wallet.
const YOUR_ACTUAL_BASE64_PUBLIC_KEY = "ALTkwk1Qh3HXVuPf7Bir0Ml0N6WL8g/rkPi+F1c+kblV"; // Replace this placeholder!

// --- SETUP ---
const app = express();
const port = 3001;

// Initialize the Sui Client (e.g., using Testnet)
const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

// Correctly structure the public keys for MultiSigPublicKey.
const multiSigPublicKeysWithWeight = MULTISIG_WALLET_OWNERS.map(ownerAddress => {
    
    // FIX for "Received signature from unknown public key": Use the actual key bytes.
    const keyBytes = fromB64(YOUR_ACTUAL_BASE64_PUBLIC_KEY); 
    const key = new Ed25519PublicKey(keyBytes); 
    
    return {
        publicKey: key, 
        weight: 1,
    };
});


const multiSigPublicKey = MultiSigPublicKey.fromPublicKeys({
    threshold: MULTISIG_THRESHOLD,
    publicKeys: multiSigPublicKeysWithWeight,
});


// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json());


// --- ROUTES ---

app.get('/api/multisig/info', (req: Request, res: Response) => {
    res.status(200).json({
        owners: MULTISIG_WALLET_OWNERS,
        threshold: MULTISIG_THRESHOLD,
        treasuryId: TREASURY_ID,
    });
});

app.get('/api/proposals', (req: Request, res: Response) => {
    res.status(200).json(getProposals());
});

// POST /api/proposal/create - Create a new proposal
app.post('/api/proposal/create', async (req: Request, res: Response) => {
    try {
        // FIX: Extract 'senderAddress' to match Postman/Frontend
        const { recipient, amount, senderAddress } = req.body;

        if (!MULTISIG_WALLET_OWNERS.includes(normalizeSuiAddress(senderAddress))) {
            return res.status(403).json({ error: "Forbidden", details: "Sender is not a recognized multi-sig owner." });
        }

        const tx = new Transaction();
        
        // Split a coin from gas and transfer it
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]); 

        tx.transferObjects(
            [coin], 
            tx.pure.address(recipient)
        );

        // Build transaction (returns Uint8Array)
        const rawTxBytesUint8 = await tx.build({ client: suiClient, onlyTransactionKind: true });

        // Convert to Base64 string for storage
        const rawTxBytes = toB64(rawTxBytesUint8); 

        const newProposal = createProposal(recipient, amount, rawTxBytes); 

        res.status(200).json({ proposal: newProposal, details: "Proposal created, awaiting signatures." });

    } catch (error: any) {
        console.error("Error creating proposal:", error);
        res.status(500).json({ error: "Failed to create transaction block.", details: error.message });
    }
});

// POST /api/proposal/:id/sign - Add signature and potentially execute
app.post('/api/proposal/:id/sign', async (req: Request, res: Response) => {
    try {
        const proposalId = parseInt(req.params.id);
        const { signature, signerAddress } = req.body;
        
        let proposal = getProposal(proposalId);
        if (!proposal || proposal.isExecuted) {
            return res.status(404).json({ error: "Not Found", details: "Proposal not found or already executed." });
        }

        const updatedProposal = addSignature(proposalId, signerAddress, signature); 
        if (!updatedProposal) {
            return res.status(400).json({ error: "Bad Request", details: "Signer is not an owner or has already signed." });
        }
        
        if (updatedProposal.currentSignatures.length < updatedProposal.requiredSignatures) {
            return res.status(200).json({ proposal: updatedProposal, details: "Signature recorded, threshold not yet met." });
        }

        // --- EXECUTION LOGIC (THRESHOLD MET) ---

        const partialSignatures: string[] = updatedProposal.currentSignatures.map(s => s.signature);

        // This combines the single signature into a valid multi-sig structure expected by the node
        const combinedSignature = multiSigPublicKey.combinePartialSignatures(
            partialSignatures
        ); 

        const executeResult = await suiClient.executeTransactionBlock({
            transactionBlock: updatedProposal.rawTxBytes, 
            signature: combinedSignature, 
            options: { showEffects: true }, 
            requestType: 'WaitForLocalExecution',
        });

        // Check for execution success/failure by looking at the effects status
        if (executeResult.effects?.status.status !== 'success') {
            
            markExecuted(proposalId, false); 
            
            const errorDetails = executeResult.effects?.status.error || 'Unknown execution error.';
            console.error("Sui Execution Failed:", errorDetails);
            
            return res.status(500).json({ 
                error: "Signature submitted, but execution failed.", 
                details: errorDetails,
                executeResult
            });
        }

        const finalProposal = markExecuted(proposalId, true); 
        res.status(200).json({ 
            proposal: finalProposal, 
            digest: executeResult.digest, 
            details: "Proposal executed successfully." 
        });

    } catch (error: any) {
        console.error("Error processing signature/execution:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});


// --- SERVER START ---
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
