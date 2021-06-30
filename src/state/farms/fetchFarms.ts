import BigNumber from 'bignumber.js'
import erc20 from 'config/abi/erc20.json'
import masterchefABI from 'config/abi/masterchef.json'
import multicall from 'utils/multicall'
import { getMasterChefAddress } from 'utils/addressHelpers'
import farmsConfig from 'config/constants/farms'
import { QuoteToken } from '../../config/constants/types'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

const valueinBTC = async() => {
  const farmConfig = farmsConfig.find(f=>f.tokenSymbol==="WBTC");
  const lpAdress = farmConfig.lpAddresses[CHAIN_ID]
  const calls = [
    // Balance of token in the LP contract
    {
      address: farmConfig.tokenAddresses[CHAIN_ID],
      name: 'balanceOf',
      params: [lpAdress],
    },
    // Balance of quote token on LP contract
    {
      address: farmConfig.quoteTokenAdresses[CHAIN_ID],
      name: 'balanceOf',
      params: [lpAdress],
    },
    // Balance of LP tokens in the master chef contract
    {
      address: farmConfig.isTokenOnly ? farmConfig.tokenAddresses[CHAIN_ID] : lpAdress,
      name: 'balanceOf',
      params: [getMasterChefAddress()],
    },
    // Total supply of LP tokens
    {
      address: lpAdress,
      name: 'totalSupply',
    },
    // Token decimals
    {
      address: farmConfig.tokenAddresses[CHAIN_ID],
      name: 'decimals',
    },
    // Quote token decimals
    {
      address: farmConfig.quoteTokenAdresses[CHAIN_ID],
      name: 'decimals',
    },
  ]

  const [
    tokenBalanceLP,
    quoteTokenBlanceLP,
    lpTokenBalanceMC,
    lpTotalSupply,
    tokenDecimals,
    quoteTokenDecimals,
  ] = await multicall(erc20, calls)

  const tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP)).times(new BigNumber(10).pow(2))

  return(tokenPriceVsQuote.toNumber())

}

const fetchFarms = async () => {
  
  const data = await Promise.all(
    farmsConfig.map(async (farmConfig) => {
      const lpAdress = farmConfig.lpAddresses[CHAIN_ID]
      const calls = [
        // Balance of token in the LP contract
        {
          address: farmConfig.tokenAddresses[CHAIN_ID],
          name: 'balanceOf',
          params: [lpAdress],
        },
        // Balance of quote token on LP contract
        {
          address: farmConfig.quoteTokenAdresses[CHAIN_ID],
          name: 'balanceOf',
          params: [lpAdress],
        },
        // Balance of LP tokens in the master chef contract
        {
          address: farmConfig.isTokenOnly ? farmConfig.tokenAddresses[CHAIN_ID] : lpAdress,
          name: 'balanceOf',
          params: [getMasterChefAddress()],
        },
        // Total supply of LP tokens
        {
          address: lpAdress,
          name: 'totalSupply',
        },
        // Token decimals
        {
          address: farmConfig.tokenAddresses[CHAIN_ID],
          name: 'decimals',
        },
        // Quote token decimals
        {
          address: farmConfig.quoteTokenAdresses[CHAIN_ID],
          name: 'decimals',
        },
      ]

      const [
        tokenBalanceLP,
        quoteTokenBlanceLP,
        lpTokenBalanceMC,
        lpTotalSupply,
        tokenDecimals,
        quoteTokenDecimals,
      ] = await multicall(erc20, calls)



    
      let tokenAmount
      let lpTotalInQuoteToken
      let tokenPriceVsQuote


      
      if (farmConfig.isTokenOnly) {
        tokenAmount = new BigNumber(lpTokenBalanceMC).div(new BigNumber(10).pow(tokenDecimals))
        // if (farmConfig.tokenSymbol === QuoteToken.BUSD && farmConfig.quoteTokenSymbol === QuoteToken.BUSD) {
          if((farmConfig.tokenSymbol === QuoteToken.PLATIN || farmConfig.tokenSymbol === QuoteToken.WMATIC || farmConfig.tokenSymbol === QuoteToken.QUICK || farmConfig.tokenSymbol === QuoteToken.WETH)&& farmConfig.quoteTokenSymbol === QuoteToken.BUSD)
          {
           tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP)).times(new BigNumber(10).pow(12))
         }
         else if (farmConfig.tokenSymbol === QuoteToken.WBTC) {
          tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP)).times(new BigNumber(10).pow(2))
         } 
        else {
          tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP))
        }

        // ??? ERROR
        lpTotalInQuoteToken = tokenAmount.times(tokenPriceVsQuote)
      }
      else {
        // Ratio in % a LP tokens that are in staking, vs the total number in circulation
        const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))
        // Total value in staking in quote token value
        // lpTotalInQuoteToken = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(10).pow(quoteTokenDecimals))

        // Amount of token in the LP that are considered staking (i.e amount of token * lp ratio)
        tokenAmount = new BigNumber(tokenBalanceLP).div(new BigNumber(10).pow(tokenDecimals)).times(lpTokenRatio)
        const quoteTokenAmount = new BigNumber(quoteTokenBlanceLP)
           .div(new BigNumber(10).pow(quoteTokenDecimals))
           .times(lpTokenRatio)

        if (tokenAmount.comparedTo(0) > 0) {
          tokenPriceVsQuote = quoteTokenAmount.div(tokenAmount)
        } else {
          tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP))
        }

        // Total value in staking in quote token value
        lpTotalInQuoteToken = tokenAmount.times(tokenPriceVsQuote)
      }
      
      const [info, totalAllocPoint, platinPerBlock] = await multicall(masterchefABI, [
        {
          address: getMasterChefAddress(),
          name: 'poolInfo',
          params: [farmConfig.pid],
        },
        {
          address: getMasterChefAddress(),
          name: 'totalAllocPoint',
        },
        {
          address: getMasterChefAddress(),
          name: 'platinPerBlock',
        },
      ])

      const allocPoint = new BigNumber(info.allocPoint._hex)
      const poolWeight = allocPoint.div(new BigNumber(totalAllocPoint))

      return {
        ...farmConfig,
        tokenAmount: tokenAmount.toJSON(),
        // quoteTokenAmount: quoteTokenAmount,
        lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
        lpTotalInBTC: lpTotalInQuoteToken.div(await valueinBTC()).toJSON(),
        tokenPriceVsQuote: tokenPriceVsQuote.toJSON(),
        poolWeight: poolWeight.toNumber(),
        multiplier: `${allocPoint.div(100).toString()}X`,
        depositFeeBP: info.depositFeeBP,
        platinPerBlock: new BigNumber(platinPerBlock).toNumber(),
      }
    }),
  )
  // console.log('data: ', data)
  return data
}

export default fetchFarms
