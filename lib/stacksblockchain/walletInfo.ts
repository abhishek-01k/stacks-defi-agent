import { generateWallet } from "@stacks/wallet-sdk";
import { privateKeyToAddress, fetchCallReadOnlyFunction } from "@stacks/transactions";
import axios from "axios";

/**
 * Get the address from the mnemonic in the environment file
 *
 * @returns The STX address
 */
export async function getAddress() {
  // Check if the mnemonic environment variable is set
  if (!process.env.NEXT_PUBLIC_WALLET_MNEMONIC) {
    throw new Error(
      "NEXT_PUBLIC_WALLET_MNEMONIC environment variable is not set. You need to set it to create a wallet client."
    );
  }

  // Create a wallet from the mnemonic
  const wallet = await generateWallet({
    secretKey: process.env.NEXT_PUBLIC_WALLET_MNEMONIC,
    password: '',
  });

  const address = privateKeyToAddress(wallet.accounts[0].stxPrivateKey, 'mainnet');

  return address;
}

/**
 * Get the native balance from an address
 *
 * @returns The STX balance
 */
export async function getNativeBalanceFromAddress(address: string) {
  let header = undefined;
  if (process.env.NEXT_PUBLIC_HIRO_API_KEY) {
    header = {
        headers: {
            'X-API-Key': process.env.NEXT_PUBLIC_HIRO_API_KEY
        }
    };
  }

  const targetPath = `https://api.hiro.so/extended/v1/address/${address}/stx`;

  try {
    const { data } = await axios.get(targetPath, header);
    const totalBalance = Number(data.balance) / 10**6;
    const lockedBalance = Number(data.locked) / 10**6;
    const availableBalance = totalBalance - lockedBalance;
    
    // Return the balance for the account
    return {
      total: totalBalance,
      locked: lockedBalance,
      available: availableBalance,
      formatted: `Total: ${totalBalance}, Locked: ${lockedBalance}, Available: ${availableBalance}`
    };
  } catch (error) {
    throw(error);
  }
}

/**
 * Get the token balances from an address
 *
 * @returns The token balances
 */
export async function getTokenBalancesFromAddress(address: string) {
  let header = undefined;
  if (process.env.HIRO_API_KEY) {
    header = {
        headers: {
            'X-API-Key': process.env.HIRO_API_KEY
        }
    };
  }

  const targetPath = `https://api.hiro.so/extended/v1/address/${address}/balances`;

  try {
    const { data } = await axios.get(targetPath, header);
    const fungibleTokens = data.fungible_tokens;
    let balances = [];
    
    // Return the balance for the account
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
        const formattedBalance = Number(token.balance) / 10**Number(decimalResult.value.value);
        
        balances.push({
          symbol,
          balance: formattedBalance,
          tokenId: tokenComponents[0]
        });
      } catch (error) {
        console.error(`Error getting details for token ${tokenName}:`, error);
      }
    }
    
    return {
      tokens: balances,
      formatted: balances.map(t => `Token: ${t.symbol}, Balance: ${t.balance}, Token Id: ${t.tokenId}`).join('\n')
    };
  } catch (error) {
    throw(error);
  }
}

/**
 * Get the last 10 transactions from an address
 *
 * @returns The transactions
 */
export async function getTransactionsFromAddress(address: string) {
  let header = undefined;
  if (process.env.HIRO_API_KEY) {
    header = {
        headers: {
            'X-API-Key': process.env.HIRO_API_KEY
        }
    };
  }

  const targetPath = `https://api.hiro.so/extended/v2/addresses/${address}/transactions?limit=10`;

  try {
    const { data } = await axios.get(targetPath, header);
    const transactions = data.results;
    
    const txList = transactions.map((tx) => ({
      id: tx.tx.tx_id,
      from: tx.tx.sender_address,
      status: tx.tx.tx_status,
      stxSent: tx.tx.stx_sent,
      stxReceived: tx.tx.stx_received
    }));
    
    return {
      transactions: txList,
      formatted: txList.map(tx => 
        `Id: ${tx.id}, From: ${tx.from}, Status: ${tx.status}, STX Sent: ${tx.stxSent}, STX Received: ${tx.stxReceived}`
      ).join('\n')
    };
  } catch (error) {
    throw(error);
  }
} 