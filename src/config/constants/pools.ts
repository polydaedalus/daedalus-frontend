import { PoolConfig, QuoteToken, PoolCategory } from './types'

const pools: PoolConfig[] = [
   {
     sousId: 1,
     tokenName: 'WMATIC',
     stakingTokenName: QuoteToken.PLATIN,
     stakingTokenAddress: '0xF13e6278Da0717235BFC84D535C54461e957feED',
     contractAddress: {
       97: '0xd3af5fe61dbaf8f73149bfcfa9fb653ff096029a',
       56: '0x73feaa1eE314F8c655E354234017bE2193C9E24E',
      137: '0xBA13f14f73e88A2Aa264EC3063b32f4b4972E226'
     },
     poolCategory: PoolCategory.COMMUNITY,
     projectLink: 'https://pancakeswap.finance/',
     harvest: true,
     tokenPerBlock: '.062',
     sortOrder: 1,
     isFinished: false,
     tokenDecimals: 18,
   }
  // {
  //   sousId: 1,
  //   tokenName: 'TWT',
  //   stakingTokenName: QuoteToken.SYRUP,
  //   stakingTokenAddress: '0x009cF7bC57584b7998236eff51b98A168DceA9B0',
  //   contractAddress: {
  //     97: '0xAfd61Dc94f11A70Ae110dC0E0F2061Af5633061A',
  //     56: '0xAfd61Dc94f11A70Ae110dC0E0F2061Af5633061A',
  //   },
  //   poolCategory: PoolCategory.CORE,
  //   projectLink: 'https://trustwallet.com/',
  //   harvest: true,
  //   tokenPerBlock: '20',
  //   sortOrder: 999,
  //   isFinished: true,
  //   tokenDecimals: 18,
  // },
]

export default pools
