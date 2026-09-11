import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

import { VERA_ABI } from './contracts/VERA_ABI';
import { BlockchainStatus } from '@/types';

export interface BlockchainOperationResult {
  success: boolean;
  status: BlockchainStatus;
  txHash?: string;
  blockNumber?: number;
  error?: string;
  data?: any;
}

const DEFAULT_RPC = 'http://127.0.0.1:8545';

/**
 * Returns whether blockchain credentials and contract address are configured
 */
export function isBlockchainConfigured(): boolean {
  return Boolean(
    process.env.BLOCKCHAIN_RPC_URL &&
    process.env.BLOCKCHAIN_PRIVATE_KEY &&
    process.env.CONTRACT_ADDRESS
  );
}

/**
 * Helper to convert UUID or string ID to deterministic bytes32 hex
 */
export function idToBytes32(id: string): string {
  if (!id) throw new Error('ID cannot be empty');
  return ethers.id(id);
}

/**
 * Get configured JSON-RPC provider with static network to avoid retry loops when offline
 */
export function getProvider(): ethers.JsonRpcProvider {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || DEFAULT_RPC;
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);
  return new ethers.JsonRpcProvider(rpcUrl, chainId, {
    staticNetwork: true,
  });
}

/**
 * Get authenticated server-side signer.
 * Strictly server-side only; never expose private key to browser.
 */
export function getSigner(customPrivateKey?: string): ethers.Wallet {
  const privateKey = customPrivateKey || process.env.BLOCKCHAIN_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('BLOCKCHAIN_PRIVATE_KEY is not configured');
  }
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Load VERA smart contract instance
 */
export function getContract(signerOrProvider?: ethers.Signer | ethers.Provider): ethers.Contract {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('CONTRACT_ADDRESS is not configured');
  }
  const providerOrSigner = signerOrProvider || getSigner();
  return new ethers.Contract(contractAddress, VERA_ABI, providerOrSigner);
}

/**
 * Get block explorer link for a transaction hash
 */
export function getExplorerTxUrl(chainId: number | string | undefined, txHash: string): string {
  if (!txHash) return '#';
  const id = Number(chainId || process.env.NEXT_PUBLIC_CHAIN_ID || 31337);
  switch (id) {
    case 11155111:
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    case 17000:
      return `https://holesky.etherscan.io/tx/${txHash}`;
    case 80002:
      return `https://amoy.polygonscan.com/tx/${txHash}`;
    case 31337:
    case 1337:
      return `/explorer/tx/${txHash}`;
    default:
      return `https://sepolia.etherscan.io/tx/${txHash}`;
  }
}

/**
 * Get human-readable network name for a chain ID
 */
export function getNetworkName(chainId: number | string | undefined): string {
  const id = Number(chainId || process.env.NEXT_PUBLIC_CHAIN_ID || 31337);
  switch (id) {
    case 11155111:
      return 'Ethereum Sepolia Testnet';
    case 17000:
      return 'Ethereum Holesky Testnet';
    case 80002:
      return 'Polygon Amoy Testnet';
    case 31337:
    case 1337:
      return 'Hardhat Local Testnet (Chain ID 31337)';
    default:
      return `Testnet (Chain ID ${id})`;
  }
}

/**
 * Get block explorer link for an address
 */
export function getExplorerAddressUrl(chainId: number | string | undefined, address: string): string {
  if (!address) return '#';
  const id = Number(chainId || process.env.NEXT_PUBLIC_CHAIN_ID || 31337);
  switch (id) {
    case 11155111:
      return `https://sepolia.etherscan.io/address/${address}`;
    case 17000:
      return `https://holesky.etherscan.io/address/${address}`;
    case 80002:
      return `https://amoy.polygonscan.com/address/${address}`;
    case 31337:
    case 1337:
      return `http://127.0.0.1:8545/address/${address}`;
    default:
      return `https://sepolia.etherscan.io/address/${address}`;
  }
}

/**
 * Ensure an address is a valid Ethereum address, or return a deterministic fallback
 */
function ensureAddress(addr?: string | null, fallback?: string): string {
  if (addr && ethers.isAddress(addr)) {
    return addr;
  }
  if (fallback && ethers.isAddress(fallback)) {
    return fallback;
  }
  // Default to zero address or signer address
  return ethers.ZeroAddress;
}

/**
 * Register a campaign on-chain
 */
export async function onChainCreateCampaign(params: {
  campaignId: string;
  targetAmount: number;
  ownerAddress?: string | null;
  ngoAdminAddress?: string | null;
  campaignOwnerAddress?: string | null;
  auditorAddress?: string | null;
  signerKey?: string;
}): Promise<BlockchainOperationResult> {
  if (!isBlockchainConfigured()) {
    return {
      success: false,
      status: 'NOT_SUBMITTED',
      error: 'Blockchain environment is not configured'
    };
  }

  try {
    const signer = getSigner(params.signerKey);
    const contract = getContract(signer);
    const b32CampaignId = idToBytes32(params.campaignId);

    const owner = ensureAddress(params.ownerAddress, signer.address);
    const ngoAdmin = ensureAddress(params.ngoAdminAddress, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
    const campaignOwner = ensureAddress(params.campaignOwnerAddress, '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
    const auditor = ensureAddress(params.auditorAddress, '0x90F79bf6EB2c4f870365E785982E1f101E93b906');

    const tx = await contract.createCampaign(
      b32CampaignId,
      BigInt(params.targetAmount),
      owner,
      ngoAdmin,
      campaignOwner,
      auditor
    );

    const receipt = await tx.wait(1);

    return {
      success: true,
      status: 'CONFIRMED',
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error: any) {
    console.error('[onChainCreateCampaign] Error:', error.message || error);
    return {
      success: false,
      status: 'FAILED',
      error: error.message || 'Blockchain transaction failed'
    };
  }
}

/**
 * Record a donation on-chain with native testnet ETH / wei
 */
export async function onChainDonate(params: {
  campaignId: string;
  amount: number;
  donorSignerKey?: string;
}): Promise<BlockchainOperationResult> {
  if (!isBlockchainConfigured()) {
    return {
      success: false,
      status: 'NOT_SUBMITTED',
      error: 'Blockchain environment is not configured'
    };
  }

  try {
    const signer = getSigner(params.donorSignerKey);
    const contract = getContract(signer);
    const b32CampaignId = idToBytes32(params.campaignId);

    // Donate with native value matching amount (in wei)
    const tx = await contract.donate(b32CampaignId, {
      value: BigInt(params.amount)
    });

    const receipt = await tx.wait(1);

    return {
      success: true,
      status: 'CONFIRMED',
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error: any) {
    console.error('[onChainDonate] Error:', error.message || error);
    return {
      success: false,
      status: 'FAILED',
      error: error.message || 'Blockchain donation failed'
    };
  }
}

/**
 * Register a milestone on-chain
 */
export async function onChainCreateMilestone(params: {
  campaignId: string;
  milestoneId: string;
  amount: number;
  signerKey?: string;
}): Promise<BlockchainOperationResult> {
  if (!isBlockchainConfigured()) {
    return {
      success: false,
      status: 'NOT_SUBMITTED',
      error: 'Blockchain environment is not configured'
    };
  }

  try {
    const signer = getSigner(params.signerKey);
    const contract = getContract(signer);
    const b32CampId = idToBytes32(params.campaignId);
    const b32MsId = idToBytes32(params.milestoneId);

    const tx = await contract.createMilestone(b32CampId, b32MsId, BigInt(params.amount));
    const receipt = await tx.wait(1);

    return {
      success: true,
      status: 'CONFIRMED',
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error: any) {
    console.error('[onChainCreateMilestone] Error:', error.message || error);
    return {
      success: false,
      status: 'FAILED',
      error: error.message || 'Milestone on-chain registration failed'
    };
  }
}

/**
 * Request fund release on-chain for an approved milestone
 */
export async function onChainRequestRelease(params: {
  campaignId: string;
  milestoneId: string;
  amount: number;
  signerKey?: string;
}): Promise<BlockchainOperationResult> {
  if (!isBlockchainConfigured()) {
    return {
      success: false,
      status: 'NOT_SUBMITTED',
      error: 'Blockchain environment is not configured'
    };
  }

  try {
    const signer = getSigner(params.signerKey);
    const contract = getContract(signer);
    const b32CampId = idToBytes32(params.campaignId);
    const b32MsId = idToBytes32(params.milestoneId);

    const tx = await contract.requestRelease(b32CampId, b32MsId, BigInt(params.amount));
    const receipt = await tx.wait(1);

    return {
      success: true,
      status: 'CONFIRMED',
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error: any) {
    console.error('[onChainRequestRelease] Error:', error.message || error);
    return {
      success: false,
      status: 'FAILED',
      error: error.message || 'Release request failed on-chain'
    };
  }
}

/**
 * Submit a 2-of-3 multisig approval on-chain
 */
export async function onChainApproveRelease(params: {
  campaignId: string;
  milestoneId: string;
  approverAddress?: string | null;
  signerKey?: string;
}): Promise<BlockchainOperationResult> {
  if (!isBlockchainConfigured()) {
    return {
      success: false,
      status: 'NOT_SUBMITTED',
      error: 'Blockchain environment is not configured'
    };
  }

  try {
    const signer = getSigner(params.signerKey);
    const contract = getContract(signer);
    const b32CampId = idToBytes32(params.campaignId);
    const b32MsId = idToBytes32(params.milestoneId);

    let tx;
    if (params.approverAddress && ethers.isAddress(params.approverAddress)) {
      tx = await contract.approveReleaseFor(b32CampId, b32MsId, params.approverAddress);
    } else {
      tx = await contract.approveRelease(b32CampId, b32MsId);
    }
    const receipt = await tx.wait(1);

    return {
      success: true,
      status: 'CONFIRMED',
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error: any) {
    console.error('[onChainApproveRelease] Error:', error.message || error);
    return {
      success: false,
      status: 'FAILED',
      error: error.message || 'Release approval failed on-chain'
    };
  }
}

/**
 * Execute fund release on-chain once 2-of-3 multisig threshold is reached
 */
export async function onChainReleaseFunds(params: {
  campaignId: string;
  milestoneId: string;
  recipientAddress?: string | null;
  signerKey?: string;
}): Promise<BlockchainOperationResult> {
  if (!isBlockchainConfigured()) {
    return {
      success: false,
      status: 'NOT_SUBMITTED',
      error: 'Blockchain environment is not configured'
    };
  }

  try {
    const signer = getSigner(params.signerKey);
    const contract = getContract(signer);
    const b32CampId = idToBytes32(params.campaignId);
    const b32MsId = idToBytes32(params.milestoneId);

    const recipient = ensureAddress(params.recipientAddress, signer.address);

    const tx = await contract.releaseFunds(b32CampId, b32MsId, recipient);
    const receipt = await tx.wait(1);

    return {
      success: true,
      status: 'CONFIRMED',
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error: any) {
    console.error('[onChainReleaseFunds] Error:', error.message || error);
    return {
      success: false,
      status: 'FAILED',
      error: error.message || 'On-chain fund release failed'
    };
  }
}

/**
 * Issue on-chain refund for a failed milestone or cancelled campaign
 */
export async function onChainRefund(params: {
  campaignId: string;
  recipientAddress?: string | null;
  amount: number;
  reason: string;
  signerKey?: string;
}): Promise<BlockchainOperationResult> {
  if (!isBlockchainConfigured()) {
    return {
      success: false,
      status: 'NOT_SUBMITTED',
      error: 'Blockchain environment is not configured'
    };
  }

  try {
    const signer = getSigner(params.signerKey);
    const contract = getContract(signer);
    const b32CampId = idToBytes32(params.campaignId);

    const recipient = ensureAddress(params.recipientAddress, signer.address);

    const tx = await contract.refund(b32CampId, recipient, BigInt(params.amount), params.reason);
    const receipt = await tx.wait(1);

    return {
      success: true,
      status: 'CONFIRMED',
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error: any) {
    console.error('[onChainRefund] Error:', error.message || error);
    return {
      success: false,
      status: 'FAILED',
      error: error.message || 'On-chain refund failed'
    };
  }
}

/**
 * Query on-chain campaign state
 */
export async function onChainGetCampaign(campaignId: string) {
  if (!isBlockchainConfigured()) return null;
  try {
    const provider = getProvider();
    const contract = getContract(provider);
    const b32CampId = idToBytes32(campaignId);
    const data = await contract.getCampaign(b32CampId);
    return {
      owner: data[0],
      targetAmount: Number(data[1]),
      totalDonated: Number(data[2]),
      totalReleased: Number(data[3]),
      totalAllocated: Number(data[4]),
      active: data[5]
    };
  } catch (error) {
    return null;
  }
}

/**
 * Query on-chain milestone state
 */
export async function onChainGetMilestone(campaignId: string, milestoneId: string) {
  if (!isBlockchainConfigured()) return null;
  try {
    const provider = getProvider();
    const contract = getContract(provider);
    const b32CampId = idToBytes32(campaignId);
    const b32MsId = idToBytes32(milestoneId);
    const [milestone, currentApprovals] = await contract.getMilestone(b32CampId, b32MsId);
    return {
      amount: Number(milestone.amount),
      releasedAmount: Number(milestone.releasedAmount),
      requestedReleaseAmount: Number(milestone.requestedReleaseAmount),
      releaseRequested: milestone.releaseRequested,
      released: milestone.released,
      failed: milestone.failed,
      currentApprovals: Number(currentApprovals)
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get live blockchain stats (current block number, network, contract)
 */
export async function getLiveBlockchainStats() {
  try {
    const provider = getProvider();
    const blockNumber = await provider.getBlockNumber();
    return {
      connected: true,
      blockNumber,
      network: process.env.BLOCKCHAIN_NETWORK || 'Hardhat Localnet',
      contractAddress: process.env.CONTRACT_ADDRESS || null,
    };
  } catch {
    return {
      connected: false,
      blockNumber: 194821,
      network: 'Hardhat Localnet (Offline)',
      contractAddress: process.env.CONTRACT_ADDRESS || null,
    };
  }
}
