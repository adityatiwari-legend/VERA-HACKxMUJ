# VERA Blockchain & Smart Contract Architecture

VERA integrates Ethereum-compatible smart contracts (`VERA.sol`) to anchor critical financial state transitions, enforce multi-signature release thresholds, and provide immutable receipts on public block explorers.

---

## 1. Smart Contract Overview (`VERA.sol`)

The `VERA` smart contract implements non-custodial accounting, escrow caps, and multi-signature authorization:

```solidity
// SPDX-License-Identifier: MIT
contract VERA {
    // Structure defining campaign signers and balances
    struct Campaign {
        bytes32 id;
        uint256 targetAmount;
        uint256 totalDonated;
        uint256 totalReleased;
        uint256 totalAllocated;
        address owner;
        address ngoAdmin;
        address campaignOwner;
        address auditor;
        bool active;
    }

    // Structure defining milestone escrow states
    struct Milestone {
        bytes32 id;
        uint256 amount;
        uint256 releasedAmount;
        uint256 requestedReleaseAmount;
        bool releaseRequested;
        bool released;
        bool failed;
        uint8 approvalCount;
        mapping(address => bool) hasApproved;
    }
}
```

---

## 2. Core Blockchain Operations

### 1. `createCampaign(bytes32 id, uint256 target, address owner, address ngoAdmin, address campaignOwner, address auditor)`
- Registers campaign on-chain with authorized multi-signature signers.
- Enforces unique campaign ID check.

### 2. `donate(bytes32 campaignId) payable`
- Receives native testnet cryptocurrency / simulated wei.
- Enforces non-zero value and increments `totalDonated`.
- Emits `DonationReceived(bytes32 campaignId, address donor, uint256 amount)`.

### 3. `createMilestone(bytes32 campaignId, bytes32 milestoneId, uint256 amount)`
- Sets milestone allocation ceiling.
- **Invariant Enforced**: `totalAllocated + amount <= targetAmount`.

### 4. `requestRelease(bytes32 campaignId, bytes32 milestoneId, uint256 amount)`
- Initiates fund release workflow for an approved milestone.
- Validates that requester is an authorized campaign signer.
- Ensures requested amount does not exceed the milestone allocation.

### 5. `approveRelease(bytes32 campaignId, bytes32 milestoneId)`
- Records a signature from one of the designated signers (`ngoAdmin`, `campaignOwner`, or `auditor`).
- Enforces:
  - Signer must be authorized.
  - One signer cannot approve twice.
- Emits `ReleaseApproved(bytes32 campaignId, bytes32 milestoneId, address approver, uint8 currentApprovals)`.

### 6. `releaseFunds(bytes32 campaignId, bytes32 milestoneId, address payable recipient)`
- **2-of-3 Multi-Signature Threshold**: Can only execute when `approvalCount >= 2`.
- Transfers native funds to the vendor/beneficiary recipient address.
- Updates `totalReleased` and sets `milestone.released = true`.
- Emits `FundsReleased(bytes32 campaignId, bytes32 milestoneId, address recipient, uint256 amount)`.

### 7. `refund(bytes32 campaignId, address payable recipient, uint256 amount, string reason)`
- Allows authorized admin to return capital to donors if a milestone or campaign fails.
- Validates that refund amount does not exceed remaining escrow balance.

---

## 3. Supported Networks & Explorer Links

| Network | Chain ID | Explorer Base URL | RPC Provider |
|---|---|---|---|
| **Ethereum Sepolia Testnet** | `11155111` | `https://sepolia.etherscan.io/tx/{hash}` | Infura / Alchemy |
| **Ethereum Holesky Testnet** | `17000` | `https://holesky.etherscan.io/tx/{hash}` | Public RPC |
| **Polygon Amoy Testnet** | `80002` | `https://amoy.polygonscan.com/tx/{hash}` | Polygon RPC |
| **Hardhat Local Testnet** | `31337` | `http://127.0.0.1:8545/tx/{hash}` | Local Node |

### Explorer URL Helper (`lib/blockchain.ts`):
```typescript
import { getExplorerTxUrl } from '@/lib/blockchain';

// Automatically maps to correct testnet explorer based on NEXT_PUBLIC_CHAIN_ID
const explorerLink = getExplorerTxUrl(process.env.NEXT_PUBLIC_CHAIN_ID, txHash);
```

---

## 4. Testing & Contract Deployment

```bash
# Run 21 Hardhat smart contract tests
npx hardhat test

# Run contract deployment to local testnet or Sepolia
npx hardhat run scripts/deploy.ts --network localhost
# OR
npx hardhat run scripts/deploy.ts --network sepolia
```

---

## 5. Security Principles

1. **Zero Client-Side Private Key Exposure**: Transactions are signed exclusively by the backend signer service using `ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider)`.
2. **Deterministic Bytes32 Identifiers**: Database UUIDs are mapped deterministically to on-chain `bytes32` via `ethers.id(uuid)`.
3. **Tamper-Evident Receipts**: Only actual transaction receipts returned by `tx.wait(1)` are stored in PostgreSQL. VERA never fabricates transaction hashes.
