import { z } from "zod";
import { getAddress, getStxBalance, getTokenBalances, getRecentTransactions } from "../blockchain/wallet";
import { getVelarTokens, getVelarPools } from "../blockchain/velar";
import { getAlexFeeRates, getAlexAvailableTokens, getAlexTokenPrices } from "../blockchain/alexgo";
import { 
  isSbtcEnrolled,
  getSbtcCurrentCycle,
  getSbtcRewardAddress,
  getSbtcRewardsByCycle,
  enrollSbtcIncentives
} from "../blockchain/sbtc";

// Tool for getting the wallet address
export const getWalletAddressTool = {
  name: "get_wallet_address",
  description: "Get the connected wallet address from the mnemonic.",
  parameters: z.object({}).optional(),
  execute: async () => {
    try {
      const address = await getAddress();
      return { address };
    } catch (error) {
      console.error("Error in get_wallet_address:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

// Tool for getting STX balance
export const getBalanceTool = {
  name: "get_stx_balance",
  description: "Get the native STX balance of a wallet. If no address is provided, uses the connected wallet.",
  parameters: z.object({
    address: z.string().optional().describe("The wallet address to check. If not provided, uses the connected wallet.")
  }).optional(),
  execute: async (args?: { address?: string }) => {
    try {
      const address = args?.address || await getAddress();
      const balanceInfo = await getStxBalance(address);
      return { address, ...balanceInfo };
    } catch (error) {
      console.error("Error in get_stx_balance:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

// Tool for getting token balances
export const getTokenBalancesTool = {
  name: "get_token_balances",
  description: "Get all token balances (including sBTC and other SIP-10 tokens) for a wallet address. If no address is provided, uses the connected wallet.",
  parameters: z.object({
    address: z.string().optional().describe("The wallet address to check. If not provided, uses the connected wallet.")
  }).optional(),
  execute: async (args?: { address?: string }) => {
    try {
      const address = args?.address || await getAddress();
      const tokensInfo = await getTokenBalances(address);
      return { address, ...tokensInfo };
    } catch (error) {
      console.error("Error in get_token_balances:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

// Tool for getting recent transactions
export const getRecentTransactionsTool = {
  name: "get_recent_transactions",
  description: "Get the most recent transactions for a wallet address. If no address is provided, uses the connected wallet.",
  parameters: z.object({
    address: z.string().optional().describe("The wallet address to check. If not provided, uses the connected wallet."),
    limit: z.number().optional().describe("Number of transactions to return. Default is 10.")
  }).optional(),
  execute: async (args?: { address?: string, limit?: number }) => {
    try {
      const address = args?.address || await getAddress();
      const limit = args?.limit || 10;
      const txInfo = await getRecentTransactions(address, limit);
      return { address, ...txInfo };
    } catch (error) {
      console.error("Error in get_recent_transactions:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

// === Velar Protocol Tools ===

export const getVelarTokensTool = {
  name: "get_velar_tokens",
  description: "Get information about available tokens on the Velar protocol.",
  parameters: z.object({
    symbol: z.string().optional().describe("Optional token symbol to filter by. If not provided, returns all tokens.")
  }).optional(),
  execute: async (args?: { symbol?: string }) => {
    try {
      const tokenInfo = await getVelarTokens(args?.symbol);
      return tokenInfo;
    } catch (error) {
      console.error("Error in get_velar_tokens:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

export const getVelarPoolsTool = {
  name: "get_velar_pools",
  description: "Get information about liquidity pools on the Velar protocol.",
  parameters: z.object({
    token0: z.string().optional().describe("First token in the pair"),
    token1: z.string().optional().describe("Second token in the pair")
  }).optional(),
  execute: async (args?: { token0?: string, token1?: string }) => {
    try {
      const poolInfo = await getVelarPools(args?.token0, args?.token1);
      return poolInfo;
    } catch (error) {
      console.error("Error in get_velar_pools:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

// === AlexGo Protocol Tools ===

export const getAlexFeeRatesTool = {
  name: "get_alex_fee_rates",
  description: "Get fee rates for swapping between tokens on the AlexGo protocol.",
  parameters: z.object({}).optional(),
  execute: async () => {
    try {
      const feeInfo = await getAlexFeeRates();
      return feeInfo;
    } catch (error) {
      console.error("Error in get_alex_fee_rates:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

export const getAlexAvailableTokensTool = {
  name: "get_alex_available_tokens",
  description: "Get a list of available tokens for swapping on the AlexGo protocol.",
  parameters: z.object({}).optional(),
  execute: async () => {
    try {
      const tokensInfo = await getAlexAvailableTokens();
      return tokensInfo;
    } catch (error) {
      console.error("Error in get_alex_available_tokens:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

export const getAlexTokenPricesTool = {
  name: "get_alex_token_prices",
  description: "Get current token prices from the AlexGo protocol.",
  parameters: z.object({}).optional(),
  execute: async () => {
    try {
      const priceInfo = await getAlexTokenPrices();
      return priceInfo;
    } catch (error) {
      console.error("Error in get_alex_token_prices:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

// === sBTC Protocol Tools ===

export const isSbtcEnrolledTool = {
  name: "is_sbtc_enrolled",
  description: "Check if a wallet is enrolled in sBTC incentives. If no address is provided, uses the connected wallet.",
  parameters: z.object({
    address: z.string().optional().describe("The wallet address to check. If not provided, uses the connected wallet.")
  }).optional(),
  execute: async (args?: { address?: string }) => {
    try {
      const address = args?.address || await getAddress();
      const enrollmentInfo = await isSbtcEnrolled(address);
      return { address, ...enrollmentInfo };
    } catch (error) {
      console.error("Error in is_sbtc_enrolled:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

export const getSbtcCurrentCycleTool = {
  name: "get_sbtc_current_cycle",
  description: "Get the current cycle ID for sBTC rewards.",
  parameters: z.object({}).optional(),
  execute: async () => {
    try {
      const cycleInfo = await getSbtcCurrentCycle();
      return cycleInfo;
    } catch (error) {
      console.error("Error in get_sbtc_current_cycle:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

export const getSbtcRewardAddressTool = {
  name: "get_sbtc_reward_address",
  description: "Get the latest reward address for a wallet enrolled in sBTC incentives. If no address is provided, uses the connected wallet.",
  parameters: z.object({
    address: z.string().optional().describe("The wallet address to check. If not provided, uses the connected wallet.")
  }).optional(),
  execute: async (args?: { address?: string }) => {
    try {
      const address = args?.address || await getAddress();
      const rewardInfo = await getSbtcRewardAddress(address);
      return rewardInfo;
    } catch (error) {
      console.error("Error in get_sbtc_reward_address:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

export const getSbtcRewardsByCycleTool = {
  name: "get_sbtc_rewards_by_cycle",
  description: "Get the sBTC rewards for a specific cycle and address.",
  parameters: z.object({
    cycle: z.number().describe("The cycle ID to check"),
    address: z.string().optional().describe("The wallet address to check. If not provided, uses the connected wallet.")
  }),
  execute: async (args: { cycle: number, address?: string }) => {
    try {
      const address = args.address || await getAddress();
      const rewardsInfo = await getSbtcRewardsByCycle(args.cycle, address);
      return rewardsInfo;
    } catch (error) {
      console.error("Error in get_sbtc_rewards_by_cycle:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

export const enrollSbtcIncentivesTool = {
  name: "enroll_sbtc_incentives",
  description: "Enroll the connected wallet in sBTC incentives.",
  parameters: z.object({}).optional(),
  execute: async () => {
    try {
      const enrollmentResult = await enrollSbtcIncentives();
      return enrollmentResult;
    } catch (error) {
      console.error("Error in enroll_sbtc_incentives:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

// Export all tools
export const tools = [
  // Wallet tools
  getWalletAddressTool,
  getBalanceTool,
  getTokenBalancesTool,
  getRecentTransactionsTool,
  
  // Velar tools
  getVelarTokensTool,
  getVelarPoolsTool,
  
  // AlexGo tools
  getAlexFeeRatesTool,
  getAlexAvailableTokensTool,
  getAlexTokenPricesTool,
  
  // sBTC tools
  isSbtcEnrolledTool,
  getSbtcCurrentCycleTool,
  getSbtcRewardAddressTool,
  getSbtcRewardsByCycleTool,
  enrollSbtcIncentivesTool
]; 