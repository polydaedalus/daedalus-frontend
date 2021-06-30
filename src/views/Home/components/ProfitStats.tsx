import React from 'react'
import { Card, CardBody, Heading, Text } from 'platinumfinance'
import BigNumber from 'bignumber.js/bignumber'
import styled from 'styled-components'
import { getBalanceNumber } from 'utils/formatBalance'
import useBlock from 'hooks/useBlock'
import { useTotalSupply, useBurnedBalance } from 'hooks/useTokenBalance'
import useI18n from 'hooks/useI18n'
import { getCakeAddress } from 'utils/addressHelpers'
import CardValue from './CardValue'
import { useFarms, usePriceCakeBusd } from '../../../state/hooks'

const StyledCakeStats = styled(Card)`
  margin-left: auto;
  margin-right: auto;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`

const ProfitStats = () => {
  const totalSupply = useTotalSupply()
  const burnedBalance = useBurnedBalance(getCakeAddress())
  const farms = useFarms()
  const block = useBlock()


  let platinPerBlock = 0
  if (farms && farms[0] && farms[0].platinPerBlock) {
    platinPerBlock = new BigNumber(farms[0].platinPerBlock).div(new BigNumber(10).pow(18)).toNumber()
  }

  return (
    <Heading as="h2" color="secondary" mb="50px" size="xl" style={{ textAlign: 'center' }}>
      Dividend Pool Begins in {Math.max(14504555 - block, 0)} Blocks
    </Heading>
  )
}

export default ProfitStats
