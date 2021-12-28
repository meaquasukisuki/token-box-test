import { createContext } from 'react'

import { ContextValues } from './types'

const FarmingBoxTokenContext = createContext<ContextValues>({
  onApprove: () => {},
  onUnstakeAndHarvest: () => {},
  onStake: () => {},
  onUnstake: () => {},
  onHarvest: () => {},
})

export default FarmingBoxTokenContext
