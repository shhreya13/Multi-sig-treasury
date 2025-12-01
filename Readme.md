**🏦 Sui MultiSig Wallet**


The Sui MultiSig Wallet is a full-stack decentralized application (dApp) designed to secure shared assets on the Sui blockchain using a secure multi-signature consensus mechanism. This system requires a predetermined number of authorized owners to approve any transaction before funds can be released from the Treasury.

✨ Features
Decentralized Security: Uses Sui Move smart contracts to enforce consensus rules on-chain.

Transaction Workflow: Allows authorized owners to create, sign, and execute proposals for SUI transfers.

Multi-Signature Aggregation: The backend handles the cryptographic aggregation of individual owner signatures into a single, valid multi-signature, a core requirement of the Sui SDK.

Responsive Dashboard: A React frontend provides a clear, visually appealing interface for managing the wallet.

🏗️ Architecture Overview
The project is built on three interconnected layers: Sui Move contracts, a Node.js API, and a React frontend.

1. Sui Move Smart Contracts
Deployed as shared objects on the Sui Testnet, these contracts provide the security layer:

Module	Function
multisig::MultiSigWallet	Stores the list of owners and the required signature threshold. Enforces consensus rules.
multisig::Proposal	State object tracking the details of a pending transfer (target, amount) and the collected owner approvals.
multisig::Treasury	The actual vault object that holds the native SUI funds.

Export to Sheets

2. TypeScript Backend (Node.js/Express)
The backend acts as the crucial execution and aggregation service.

Technology: Node.js, Express, @mysten/sui/client, MultiSigPublicKey.

Responsibility: Builds raw Transaction Blocks, fetches on-chain data, collects individual signatures from owners, aggregates them, and submits the final multi-signed transaction to the Sui Testnet.

3. React Frontend
A dark-themed dApp dashboard for owners to interact with the wallet's functionality.

Pages: MultiSig Info (view configuration), Create Proposal (initiate transfer), and View Proposals (sign and execute).

Key Design: Uses a visually appealing dark theme with clear status indicators for pending, ready-to-execute, and executed proposals.

🛠️ Configuration and Setup
1. Key Deployment IDs
These IDs are hardcoded in the backend's src/db.ts file and are essential for the application to interact with your deployed contracts.

Artifact	ID
Sui Package ID	0x88c3d193c016be2d7a6e9d816d7756d4a573ef73ee5821c899cbc37289a87a5e
Treasury Object ID	0xe4b21a7763eda0e4abe6723088207375a744779ba522c9ffed443b2e4987c652
Owner Address	0x7aa4262372ebc33202a1e2596a2f5736530bd8289aab4d9f961a4bc5d9e7f050
Signature Threshold	1

Export to Sheets

2. Running the Application
Ensure you have Node.js (v18+) and npm installed.

Backend (backend/)
Install dependencies:

Bash

npm install
Start the API server:

Bash

npm run start
# Server running on port 3001
Frontend (frontend/)
Install dependencies:

Bash

npm install
Start the React development server:

Bash

npm run dev
# Vite server running on port 5173 (or similar)
Navigate to http://localhost:5173 to access the dashboard.

🚀 Usage Flow
Fund Treasury: Ensure the Treasury Object ID (0xe4b21a77...) holds SUI tokens.

Create Proposal:

Navigate to Create Proposal.

Enter the Recipient Address and Amount (MIST).

Click Create Proposal. The backend builds the raw transaction bytes and creates a Proposal object on Sui.

Sign & Execute:

Navigate to View Proposals.

The new proposal will appear as PENDING.

Click Sign & Execute.

(In a production environment, this would trigger a wallet signature request.)

(In this demo, the frontend simulates a successful signing and updates the local state.)

Since the threshold is 1, the signature immediately triggers the simulated execution, and the status changes to ✅ EXECUTED.

Verification: Check the Sui Testnet Explorer using the transaction digest provided by the backend to confirm the SUI transfer from the Treasury to the recipient.

