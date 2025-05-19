import { getAddress, getNativeBalanceFromAddress, getTokenBalancesFromAddress, getTransactionsFromAddress } from '../stacksblockchain/walletInfo';

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required: string[];
    };
  };
}

export interface ToolHandler {
  definition: ToolDefinition;
  handler: (args: any) => Promise<any>;
}

export const getWalletAddressTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "get_wallet_address",
      description: "Get the connected wallet address.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  handler: async () => {
    try {
      const address = await getAddress();
      return { address };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
};

export const getBalanceTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "get_balance",
      description: "Get the balance of a wallet address. If no address is provided, the connected wallet will be used.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The wallet address to check the balance for. If not provided, the connected wallet address will be used.",
          },
        },
        required: [],
      },
    },
  },
  handler: async (args: { address?: string }) => {
    try {
      const address = args.address || await getAddress();
      const balanceInfo = await getNativeBalanceFromAddress(address);
      return { 
        address, 
        ...balanceInfo
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
};

export const getTokenBalancesTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "get_token_balances",
      description: "Get the token balances of a wallet address. If no address is provided, the connected wallet will be used.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The wallet address to check token balances for. If not provided, the connected wallet address will be used.",
          },
        },
        required: [],
      },
    },
  },
  handler: async (args: { address?: string }) => {
    try {
      const address = args.address || await getAddress();
      const tokensInfo = await getTokenBalancesFromAddress(address);
      return { 
        address, 
        ...tokensInfo
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
};

export const getLastTransactionsTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "get_last_transactions",
      description: "Get the last 10 transactions of a wallet address. If no address is provided, the connected wallet will be used.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The wallet address to get transactions for. If not provided, the connected wallet address will be used.",
          },
        },
        required: [],
      },
    },
  },
  handler: async (args: { address?: string }) => {
    try {
      const address = args.address || await getAddress();
      const txInfo = await getTransactionsFromAddress(address);
      return { 
        address, 
        ...txInfo
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
};

// Group all tools together
export const allTools: Record<string, ToolHandler> = {
  get_wallet_address: getWalletAddressTool,
  get_balance: getBalanceTool,
  get_token_balances: getTokenBalancesTool,
  get_last_transactions: getLastTransactionsTool,
}; 