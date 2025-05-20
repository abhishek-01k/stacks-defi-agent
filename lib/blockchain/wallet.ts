import { generateWallet } from "@stacks/wallet-sdk";
import { privateKeyToAddress, fetchCallReadOnlyFunction } from "@stacks/transactions";
import axios from "axios";

// Flag to use mock data when environment variables are not set
const USE_MOCK_DATA = !process.env.NEXT_PUBLIC_WALLET_MNEMONIC || !process.env.NEXT_PUBLIC_HIRO_API_KEY;

// Mock wallet address for testing
const MOCK_WALLET_ADDRESS = "SP3B7FY57XQYZMR14YPYX93XY7K0CVVKEYWWKATV3";

/**
 * Get the address from the mnemonic in the environment file
 * @returns The STX address associated with the mnemonic
 */
export async function getAddress() {
  console.log("getAddress called, using mock:", USE_MOCK_DATA);
  
  if (USE_MOCK_DATA) {
    return MOCK_WALLET_ADDRESS;
  }

  if (!process.env.NEXT_PUBLIC_WALLET_MNEMONIC) {
    throw new Error("NEXT_PUBLIC_WALLET_MNEMONIC environment variable is not set.");
  }

  const wallet = await generateWallet({
    secretKey: process.env.NEXT_PUBLIC_WALLET_MNEMONIC,
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
  console.log("getStxBalance called for", address, "using mock:", USE_MOCK_DATA);
  
  if (USE_MOCK_DATA) {
    // Return mock data for testing
    return {
      total: 2500.75,
      locked: 500.25,
      available: 2000.5,
      formatted: `Total: 2500.75 STX, Locked: 500.25 STX, Available: 2000.5 STX`
    };
  }

  let headers = {};
  if (process.env.NEXT_PUBLIC_HIRO_API_KEY) {
    headers = {
      'X-API-Key': process.env.NEXT_PUBLIC_HIRO_API_KEY
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
    console.error("Error fetching STX balance:", error);
    throw error;
  }
}

/**
 * Get token balances for an address
 * @param address The Stacks address to query
 * @returns Object containing token balances
 */
export async function getTokenBalances(address: string) {
  console.log("getTokenBalances called for", address, "using mock:", USE_MOCK_DATA);
  
  if (USE_MOCK_DATA) {
    // Return mock data for testing
    const tokens = [
      {
        symbol: "USDA",
        balance: 1250.5,
        contractId: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token",
        decimals: 6
      },
      {
        symbol: "sBTC",
        balance: 0.125,
        contractId: "SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin",
        decimals: 8
      },
      {
        symbol: "ALEX",
        balance: 5000,
        contractId: "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token",
        decimals: 8
      }
    ];
    
    return {
      tokens,
      formatted: tokens.map(t => `Token: ${t.symbol}, Balance: ${t.balance}, Token Id: ${t.contractId}`).join('\n')
    };
  }

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
    console.error("Error fetching token balances:", error);
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
  console.log("getRecentTransactions called for", address, "limit:", limit, "using mock:", USE_MOCK_DATA);
  
  if (USE_MOCK_DATA) {
    // Return mock data for testing
    const txList = [
      {
        id: "0x8912450a196dff7308f82d9dd0ea6734c7f28110c5d352e5f2c752a38b7bb4c5",
        from: "SP3B7FY57XQYZMR14YPYX93XY7K0CVVKEYWWKATV3",
        status: "success",
        stxSent: "100.5",
        stxReceived: "0",
        time: "2025-04-15T14:23:45Z"
      },
      {
        id: "0x7524efcb1742d5d3a2f5fdd50637bf11be28a7a7d507b09c94b0f050c17ff65e",
        from: "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS",
        status: "success",
        stxSent: "0",
        stxReceived: "250.75",
        time: "2025-04-12T10:15:32Z"
      },
      {
        id: "0x9a3ebf67a1ab46767d382cf2da81ef4ca27ecc7c8cf83c95c9e45d77c29d91c3",
        from: "SP3B7FY57XQYZMR14YPYX93XY7K0CVVKEYWWKATV3",
        status: "success",
        stxSent: "5.3",
        stxReceived: "0",
        time: "2025-04-10T08:45:11Z"
      }
    ];
    
    return {
      transactions: txList,
      formatted: txList.map(tx => 
        `Id: ${tx.id}, From: ${tx.from}, Status: ${tx.status}, STX Sent: ${tx.stxSent}, STX Received: ${tx.stxReceived}`
      ).join('\n')
    };
  }

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
    console.error("Error fetching transactions:", error);
    throw error;
  }
} 