import axios from "axios";
import { VELAR_BASE_URL } from "./constants";

/**
 * Get information about available tokens on Velar protocol
 * @param symbol Optional token symbol to filter by
 * @returns Array of token information
 */
export async function getVelarTokens(symbol?: string) {
  const symbolParam = symbol || "all";
  const apiUrl = `${VELAR_BASE_URL}/tokens?symbol=${symbolParam}`;
  
  try {
    const { data } = await axios.get(apiUrl);
    
    const tokens = data.map((token: any) => ({
      symbol: token.symbol,
      name: token.name,
      contractAddress: token.contractAddress,
      price: token.price,
      website: token.socialLinks?.website || 'N/A'
    }));
    
    return {
      tokens,
      formatted: tokens.map((t: any) => 
        `Symbol: ${t.symbol}, Name: ${t.name}, Price: ${t.price}, Address: ${t.contractAddress}, Website: ${t.website}`
      ).join('\n')
    };
  } catch (error) {
    console.error("Error fetching Velar tokens:", error);
    throw error;
  }
}

/**
 * Get information about available pools on Velar protocol
 * @param token0 Optional first token in the pair
 * @param token1 Optional second token in the pair
 * @returns Array of pool information
 */
export async function getVelarPools(token0?: string, token1?: string) {
  let apiUrl = `${VELAR_BASE_URL}/pools`;

  if (token0 && token1) {
    apiUrl = `${apiUrl}/${token0}/${token1}`;
  }
  
  try {
    const { data } = await axios.get(apiUrl);
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Unexpected response format from Velar API");
    }
    
    const pools = data.data.map((pool: any) => ({
      symbol: pool.symbol,
      token0Symbol: pool.token0Symbol,
      token1Symbol: pool.token1Symbol,
      tvlUsd: pool.stats?.tvl_usd?.value || 'N/A'
    }));
    
    return {
      pools,
      formatted: pools.map((p: any) => 
        `Symbol: ${p.symbol}, Token Pair: ${p.token0Symbol}-${p.token1Symbol}, Total Value Locked (USD): ${p.tvlUsd}`
      ).join('\n')
    };
  } catch (error) {
    console.error("Error fetching Velar pools:", error);
    throw error;
  }
} 