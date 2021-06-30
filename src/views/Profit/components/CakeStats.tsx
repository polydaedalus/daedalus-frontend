import React from 'react'
import { Card, CardBody, Heading, Text } from 'platinumfinance'
import BigNumber from 'bignumber.js/bignumber'
import styled from 'styled-components'
import { getBalanceNumber } from 'utils/formatBalance'
import useBlock from 'hooks/useBlock'
import { useTotalSupply, useBurnedBalance } from 'hooks/useTokenBalance'
import useI18n from 'hooks/useI18n'
import { getCakeAddress } from 'utils/addressHelpers'
import CardValue from '../../Home/components/CardValue'
import { useFarms, usePriceCakeBusd } from '../../../state/hooks'

const StyledCakeStats = styled(Card)`
  margin-left: auto;
  margin-right: auto;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  font-size: 14px;
  justify-content: space-between;
  margin-bottom: 8px;
`

const CakeStats = () => {
  const totalSupply = useTotalSupply()
  const burnedBalance = useBurnedBalance(getCakeAddress())
  const farms = useFarms()
  const block = useBlock()
  const circSupply = totalSupply ? totalSupply.minus(burnedBalance) : new BigNumber(0)
  const blocksTillProfit = new BigNumber(141000 * 1000000000000000000).minus(circSupply)

  let platinPerBlock = 0
  if (farms && farms[0] && farms[0].platinPerBlock) {
    platinPerBlock = new BigNumber(farms[0].platinPerBlock).div(new BigNumber(10).pow(18)).toNumber()
  }

  return (
    <Heading as="h3">
      {blocksTillProfit && (
        <CardValue
          fontSize="24px"
          value={Math.max(14504555 - block, 0)}
          decimals={0}
          prefix="Blocks until profit sharing "
        />
      )} 
    </Heading>
  )
}

export default CakeStats
