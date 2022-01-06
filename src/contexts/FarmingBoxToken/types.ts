export interface ContextValues {
    isBoxApproved?: boolean
    isUSDCTokenApproved?:boolean
    isLPBoxApproved?:boolean
    isBoxApproving?:boolean
    isLPBoxApproving?:boolean
    isUSDCTokenApproving?:boolean
    isBoxApprovedToQuickSwap?:boolean
    isUSDCTokenApprovedToQuickSwap?:boolean
    isBoxApprovingToQuickSwap?:boolean
    isUSDCTokenApprovingToQuickSwap?:boolean
    isPoolActive?: boolean
    onBoxApprove: () => void
    onUSDCApprove: () => void
    onLPBoxApprove: () => void
    onBoxApproveToQuickSwap: () => void
    onUSDCTokenApproveToQuickSwap: () => void
    onStake: (amount: string) => void
    onUnstake: (amount: string) => void
    onHarvest: () => void
    onUnstakeAndHarvest: () => void
}