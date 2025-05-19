import { AlexSDK, Currency } from 'alex-sdk';

/**
 * Get fee rates for swapping between tokens on AlexGo protocol
 * @returns Fee rate information
 */
export async function getAlexFeeRates() {
  try {
    const alex = new AlexSDK();
    const stxToAlexFee = await alex.getFeeRate(Currency.STX, Currency.ALEX);
    const alexToStxFee = await alex.getFeeRate(Currency.ALEX, Currency.STX);
    
    return {
      stxToAlexFee: Number(stxToAlexFee) / 10**8,
      alexToStxFee: Number(alexToStxFee) / 10**8,
      formatted: `Fee rate from STX to ALEX: ${Number(stxToAlexFee) / 10**8} STX\nFee rate from ALEX to STX: ${Number(alexToStxFee) / 10**8} ALEX`
    };
  } catch (error) {
    console.error("Error fetching AlexGo fee rates:", error);
    throw error;
  }
}

/**
 * Get available tokens for swapping on AlexGo protocol
 * @returns Available tokens information
 */
export async function getAlexAvailableTokens() {
  try {
    const alex = new AlexSDK();
    const swappableCurrencies = await alex.fetchSwappableCurrency();
    
    const tokens = swappableCurrencies.map((token: any) => ({
      name: token.name,
      id: token.underlyingToken
    }));
    
    return {
      tokens,
      formatted: tokens.map((t: any) => `Name: ${t.name}, Id: ${t.id}`).join('\n')
    };
  } catch (error) {
    console.error("Error fetching AlexGo available tokens:", error);
    throw error;
  }
}

/**
 * Get token prices from AlexGo protocol
 * @returns Token price information
 */
export async function getAlexTokenPrices() {
  try {
    const alex = new AlexSDK();
    const prices = await alex.getLatestPrices();
    
    const priceList = Object.entries(prices).map(([key, price]) => ({
      token: key,
      price: price
    }));
    
    return {
      prices: priceList,
      formatted: priceList.map((p: any) => `Token: ${p.token}, Price: ${p.price} USD`).join('\n')
    };
  } catch (error) {
    console.error("Error fetching AlexGo token prices:", error);
    throw error;
  }
} 