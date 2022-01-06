import { createContext } from 'react'

import { ContextValues } from './types'

const FarmingBoxTokenContext = createContext<ContextValues>({
  onBoxApprove: () => {},
  onUSDCApprove: () => {},
  onLPBoxApprove: () => {},
  onUnstakeAndHarvest: () => {},
  onStake: () => {},
  onUnstake: () => {},
  onHarvest: () => {},
  onBoxApproveToQuickSwap: () => {},
  onUSDCTokenApproveToQuickSwap: () => {}
})

export default FarmingBoxTokenContext
