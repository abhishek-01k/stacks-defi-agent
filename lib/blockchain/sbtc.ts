import { fetchCallReadOnlyFunction, Cl, privateKeyToAddress, makeContractCall, broadcastTransaction } from '@stacks/transactions';
import { generateWallet } from "@stacks/wallet-sdk";
import { sBTC_CONTRACT_ADDRESS, sBTC_CONTRACT_NAME } from "./constants";

/**
 * Check if a wallet is enrolled in sBTC incentives
 * @param address Stacks address to check
 * @returns Enrollment status
 */
export async function isSbtcEnrolled(address: string) {
  try {
    // Check current cycle enrollment
    const isCurrentEnrolledResult = await fetchCallReadOnlyFunction({
      contractName: sBTC_CONTRACT_NAME,
      contractAddress: sBTC_CONTRACT_ADDRESS,
      functionName: "is-enrolled-this-cycle",
      functionArgs: [Cl.principal(address)],
      senderAddress: address,
      network: "mainnet"
    });

    const isCurrentEnrolled = isCurrentEnrolledResult.type === "response" 
      ? isCurrentEnrolledResult.value.type === "bool" && isCurrentEnrolledResult.value.value
      : false;

    // Check next cycle enrollment
    const isNextCycleEnrolledResult = await fetchCallReadOnlyFunction({
      contractName: sBTC_CONTRACT_NAME,
      contractAddress: sBTC_CONTRACT_ADDRESS,
      functionName: "is-enrolled-in-next-cycle",
      functionArgs: [Cl.principal(address)],
      senderAddress: address,
      network: "mainnet"
    });

    const isNextCycleEnrolled = isNextCycleEnrolledResult.type === "response" 
      ? isNextCycleEnrolledResult.value.type === "bool" && isNextCycleEnrolledResult.value.value
      : false;

    return {
      currentCycle: isCurrentEnrolled,
      nextCycle: isNextCycleEnrolled,
      formatted: `Enrolled for current cycle: ${isCurrentEnrolled ? 'Yes' : 'No'}, Enrolled for next cycle: ${isNextCycleEnrolled ? 'Yes' : 'No'}`
    };
  } catch (error) {
    console.error("Error checking sBTC enrollment:", error);
    throw error;
  }
}

/**
 * Get the current cycle ID for sBTC rewards
 * @returns Current cycle information
 */
export async function getSbtcCurrentCycle() {
  try {
    if (!process.env.WALLET_MNEMONIC) {
      throw new Error("WALLET_MNEMONIC environment variable is not set.");
    }
    
    // Create a wallet from the mnemonic
    const wallet = await generateWallet({
      secretKey: process.env.WALLET_MNEMONIC,
      password: '',
    });
    const address = privateKeyToAddress(wallet.accounts[0].stxPrivateKey, 'mainnet');

    const currentCycleResult = await fetchCallReadOnlyFunction({
      contractName: sBTC_CONTRACT_NAME,
      contractAddress: sBTC_CONTRACT_ADDRESS,
      functionName: "current-cycle-id",
      functionArgs: [],
      senderAddress: address,
      network: "mainnet"
    });

    if (currentCycleResult.type !== "response") {
      throw new Error("Failed to get current cycle ID");
    }

    const cycleId = currentCycleResult.value.value;

    return {
      cycleId,
      formatted: `Current sBTC rewards cycle ID: ${cycleId}`
    };
  } catch (error) {
    console.error("Error getting sBTC current cycle:", error);
    throw error;
  }
}

/**
 * Get the latest reward address for a wallet
 * @param address Stacks address to check
 * @returns Reward address information
 */
export async function getSbtcRewardAddress(address: string) {
  try {
    const rewardAddressResult = await fetchCallReadOnlyFunction({
      contractName: sBTC_CONTRACT_NAME,
      contractAddress: sBTC_CONTRACT_ADDRESS,
      functionName: "get-latest-reward-address",
      functionArgs: [Cl.principal(address)],
      senderAddress: address,
      network: "mainnet"
    });

    if (rewardAddressResult.type !== "response") {
      throw new Error("Failed to get reward address");
    }

    const rewardAddress = rewardAddressResult.value.value;

    return {
      address,
      rewardAddress,
      formatted: `The reward address for ${address} is ${rewardAddress}`
    };
  } catch (error) {
    console.error("Error getting sBTC reward address:", error);
    throw error;
  }
}

/**
 * Get rewards for a specific cycle and address
 * @param cycle Cycle ID to check
 * @param address Stacks address to check
 * @returns Reward amount information
 */
export async function getSbtcRewardsByCycle(cycle: number, address: string) {
  try {
    const rewardsResult = await fetchCallReadOnlyFunction({
      contractName: sBTC_CONTRACT_NAME,
      contractAddress: sBTC_CONTRACT_ADDRESS,
      functionName: "reward-amount-for-cycle-and-address",
      functionArgs: [Cl.uint(cycle), Cl.principal(address)],
      senderAddress: address,
      network: "mainnet"
    });

    if (rewardsResult.type !== "response") {
      throw new Error("Failed to get reward amount");
    }

    const rawRewards = rewardsResult.value.value;
    const rewards = Number(rawRewards) / 10**8;

    return {
      cycle,
      address,
      rewards,
      formatted: `sBTC rewards for cycle ${cycle} and address ${address}: ${rewards} sBTC`
    };
  } catch (error) {
    console.error("Error getting sBTC rewards by cycle:", error);
    throw error;
  }
}

/**
 * Enroll a wallet in sBTC incentives
 * @returns Enrollment transaction result
 */
export async function enrollSbtcIncentives() {
  try {
    if (!process.env.WALLET_MNEMONIC) {
      throw new Error("WALLET_MNEMONIC environment variable is not set.");
    }
    
    // Create a wallet from the mnemonic
    const wallet = await generateWallet({
      secretKey: process.env.WALLET_MNEMONIC,
      password: '',
    });
    const address = privateKeyToAddress(wallet.accounts[0].stxPrivateKey, 'mainnet');

    const transaction = await makeContractCall({
      contractName: sBTC_CONTRACT_NAME,
      contractAddress: sBTC_CONTRACT_ADDRESS,
      functionName: "enroll",
      functionArgs: [Cl.principal(address)],
      senderKey: wallet.accounts[0].stxPrivateKey,
      validateWithAbi: true,
      network: "mainnet",
      postConditions: [],
    });
    
    const txResult = await broadcastTransaction({ transaction, network: "mainnet" });
    
    return {
      success: txResult.txid ? true : false,
      txid: txResult.txid,
      formatted: `Successfully enrolled in sBTC incentives. Transaction ID: ${txResult.txid}`
    };
  } catch (error) {
    console.error("Error enrolling in sBTC incentives:", error);
    throw error;
  }
} 