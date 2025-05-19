import { generateWallet } from "@stacks/wallet-sdk";
import { privateKeyToAddress, fetchCallReadOnlyFunction } from "@stacks/transactions";
import axios from "axios";

/**
 * Get the address from the mnemonic in the environment file
 * @returns The STX address associated with the mnemonic
 */
export async function getAddress() {
  if (!process.env.WALLET_MNEMONIC) {
    throw new Error("WALLET_MNEMONIC environment variable is not set.");
  }

  const wallet = await generateWallet({
    secretKey: process.env.WALLET_MNEMONIC,
    password: '',
  });

  const address = privateKeyToAddress(wallet.accounts[0].stxPrivateKey, 'mainnet');
  return address;
}

/**
 * Get the STX balance from an address
 * @param address The Stacks address to query
 * @returns Object containing balance details
 */
export async function getStxBalance(address: string) {
  let headers = {};
  if (process.env.HIRO_API_KEY) {
    headers = {
      'X-API-Key': process.env.HIRO_API_KEY
    };
  }

  const apiUrl = `https://api.hiro.so/extended/v1/address/${address}/stx`;

  try {
    const { data } = await axios.get(apiUrl, { headers });
    const totalBalance = Number(data.balance) / 10**6;
    const lockedBalance = Number(data.locked) / 10**6;
    const availableBalance = totalBalance - lockedBalance;
    
    return {
      total: totalBalance,
      locked: lockedBalance,
      available: availableBalance,
      formatted: `Total: ${totalBalance} STX, Locked: ${lockedBalance} STX, Available: ${availableBalance} STX`
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get token balances for an address
 * @param address The Stacks address to query
 * @returns Object containing token balances
 */
export async function getTokenBalances(address: string) {
  let headers = {};
  if (process.env.HIRO_API_KEY) {
    headers = {
      'X-API-Key': process.env.HIRO_API_KEY
    };
  }

  const apiUrl = `https://api.hiro.so/extended/v1/address/${address}/balances`;

  try {
    const { data } = await axios.get(apiUrl, { headers });
    const fungibleTokens = data.fungible_tokens;
    const tokens = [];
    
    for (const tokenName in fungibleTokens) {
      const token = fungibleTokens[tokenName];
      const tokenComponents = tokenName.split("::");
      const contract = tokenComponents[0].split(".");
      const contractId = contract[0];
      const contractName = contract[1];
      
      try {
        const decimalResult = await fetchCallReadOnlyFunction({
          contractName: contractName,
          contractAddress: contractId,
          functionName: "get-decimals",
          functionArgs: [],
          senderAddress: address,
          network: "mainnet"
        });
        
        const symbolResult = await fetchCallReadOnlyFunction({
          contractName: contractName,
          contractAddress: contractId,
          functionName: "get-symbol",
          functionArgs: [],
          senderAddress: address,
          network: "mainnet"
        });
        
        const symbol = symbolResult.value.value;
        const decimals = Number(decimalResult.value.value);
        const balance = Number(token.balance) / 10**decimals;
        
        tokens.push({
          symbol,
          balance,
          contractId: tokenComponents[0],
          decimals
        });
      } catch (error) {
        console.error(`Error getting details for token ${tokenName}:`, error);
      }
    }
    
    return {
      tokens,
      formatted: tokens.map(t => `Token: ${t.symbol}, Balance: ${t.balance}, Token Id: ${t.contractId}`).join('\n')
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get the recent transactions for an address
 * @param address The Stacks address to query
 * @param limit The number of transactions to retrieve (default 10)
 * @returns Object containing transaction details
 */
export async function getRecentTransactions(address: string, limit = 10) {
  let headers = {};
  if (process.env.HIRO_API_KEY) {
    headers = {
      'X-API-Key': process.env.HIRO_API_KEY
    };
  }

  const apiUrl = `https://api.hiro.so/extended/v2/addresses/${address}/transactions?limit=${limit}`;

  try {
    const { data } = await axios.get(apiUrl, { headers });
    const transactions = data.results;
    
    const txList = transactions.map(tx => ({
      id: tx.tx.tx_id,
      from: tx.tx.sender_address,
      status: tx.tx.tx_status,
      stxSent: tx.tx.stx_sent,
      stxReceived: tx.tx.stx_received,
      time: tx.tx.burn_block_time_iso
    }));
    
    return {
      transactions: txList,
      formatted: txList.map(tx => 
        `Id: ${tx.id}, From: ${tx.from}, Status: ${tx.status}, STX Sent: ${tx.stxSent}, STX Received: ${tx.stxReceived}`
      ).join('\n')
    };
  } catch (error) {
    throw error;
  }
} 