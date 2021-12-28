import Web3 from 'web3'
import { provider } from 'web3-core'
import { AbiItem } from 'web3-utils'

import { stakingRewardsAddress,farmEth2XLeverageAddress,farmBoxTokenAddress, uniswapBoxLpTokenAddress,uniswapEth2xLeverageLpTokenAddress, uniswapEth2USDCLpTokenAddress } from 'constants/ethContractAddresses'
import StakeABI from 'index-sdk/abi/Stake.json'
import BoxTokenABI from 'index-sdk/abi/boxToken.json'
import Eth2XLeverageFarmABI from 'index-sdk/abi/eth2XLeverageFarm.json'
import eth2XLeverageTokenABI from 'index-sdk/abi/eth2XLeverageToken.json'
import eth2USDCTokenABI from 'index-sdk/abi/eth2USDCLpToken.json'
import BigNumber from 'utils/bignumber'
// import { Contract } from 'ethers'

export const getEth2XLeverageFarmContract = (provider: provider) => {
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(
    Eth2XLeverageFarmABI as unknown as AbiItem,
    farmEth2XLeverageAddress
  )
  return contract
}

export const getBoxTokenFarmContract = (provider: provider) => {
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(
    Eth2XLeverageFarmABI as unknown as AbiItem,
    farmBoxTokenAddress
  )
  return contract
}

export const getBoxTokenContract = (provider: provider) => {
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(
    BoxTokenABI as unknown as AbiItem,
    uniswapBoxLpTokenAddress
  )
  return contract
}

export const getEth2XLeverageTokenContract = (provider: provider) => {
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(
    eth2XLeverageTokenABI.abi as unknown as AbiItem,
    uniswapEth2xLeverageLpTokenAddress
  )
  return contract
} 

export const getEth2USDCLPContract = (provider: provider) => {
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(
    eth2USDCTokenABI as unknown as AbiItem,
    uniswapEth2USDCLpTokenAddress
  )
  return contract
} 

export const stakeEth2xLeverageLpTokens = (
  provider: provider,
  account: string,
  stakeQuantity: BigNumber
): Promise<string | null> => {
  const stakingContract = getEth2XLeverageFarmContract(provider)
  const pid = "0" 
  return new Promise((resolve) => {
    stakingContract.methods
      .deposit(pid,stakeQuantity.toString(),account)
      .send({ from: account, gas: 200000 })
      .on('transactionHash', (txId: string) => {
        if (!txId) resolve(null)
        resolve(txId)
      })
      .on('error', (error: any) => {
        console.log(error)
        resolve(null)
      })
  })
}

export const stakeBoxLpTokens = async (
  provider: provider,
  account: string,
  stakeQuantity: BigNumber
): Promise<string | null> => {
  const stakingContract = getBoxTokenFarmContract(provider)
  const pid = "0"
  return new Promise((resolve) => {
    stakingContract.methods
      .deposit(pid,stakeQuantity.toNumber(),account)
      .send({ from: account, gas: 2000000 })
      .on('transactionHash', (txId: string) => {
        if (!txId) resolve(null)
        resolve(txId)
      })
      .on('error', (error: any) => {
        console.log(error)
        resolve(null)
      })
  })
}

export const claimEarnedBoxTokenReward = async (
  provider: provider,
  account: string,
  pid: number //pid 0 or one. Two pools.
): Promise<string | null> => {
  const stakingContract = getBoxTokenFarmContract(provider)
  return new Promise((resolve) => {
    stakingContract.methods
      .harvest(pid,account)
      .send({ from: account, gas: 200000 })
      .on('transactionHash', (txId: string) => {
        if (!txId) resolve(null)
        resolve(txId)
      })
      .on('error', (error: any) => {
        console.log(error)
        resolve(null)
      })
  })
}

export const getAmountOfStakedTokens = async (
  provider: provider,
  contractAddress: string
) => {
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(
    StakeABI as unknown as AbiItem,
    contractAddress
  )
  return await contract.methods.totalSupply().call()
}

export const getUserCanHarvestMaxAmount = async (
  provider: provider,
  poolId:number,
  account: string
): Promise<string | null> => {
  const stakingContract = getBoxTokenFarmContract(provider)
  const amount = await stakingContract.methods
    .pendingSushi(poolId.toString(),account)
  return amount;
}

export const getPoolHarvestDistributePercent = async (
  provider: provider,
  poolId:number,
): Promise<Number | null> => {
  const stakingContract = getBoxTokenFarmContract(provider)
  const totalAllocPoint = await stakingContract.methods.totalAllocPoint().call()
  const poolInfo = await stakingContract.methods
    .poolInfo(poolId).call()

  if (poolInfo && poolInfo.allocPoint) {
    const percent = new BigNumber(poolInfo.allocPoint).dividedBy(totalAllocPoint).toNumber()    
    return percent;
  }
}

export const getPoolStakedValue = async (
  provider: provider,
  poolId:number,
): Promise<Number | null> => {
  const stakingContract = getBoxTokenFarmContract(provider)
  const boxTokenContract = getBoxTokenContract(provider);
  const eth2XLeverageTokenContract = getEth2XLeverageTokenContract(provider);
  const eth2USDCLpTokenContract = getEth2USDCLPContract(provider)
  const annualSeconds = new BigNumber(365).times(24).times(3600)

  let boxToken2Usdc;
  let eth2XLeverageToken2Eth;
  let usdc2Eth;
  let sushiPerSecond;
  let distributePercent;
  let poolRewardTotal;
  let stakedValue;
  let boxToken2Eth;
  sushiPerSecond = await stakingContract.methods.sushiPerSecond().call()
  const boxLpReserveInfo = await boxTokenContract.methods.getReserves().call()
  if (boxLpReserveInfo?._reserve0 && boxLpReserveInfo?._reserve1) {
    boxToken2Usdc = new BigNumber(boxLpReserveInfo?._reserve0).dividedBy(boxLpReserveInfo?._reserve1)
  }
  const eth2USDCLpReserveInfo = await eth2USDCLpTokenContract.methods.getReserves().call()
  if (eth2USDCLpReserveInfo?._reserve0 && eth2USDCLpReserveInfo?._reserve1) {
    usdc2Eth = new BigNumber(eth2USDCLpReserveInfo?._reserve1).dividedBy(eth2USDCLpReserveInfo?._reserve0).dividedBy(1000000000000)
  }
  const eth2x2ETHLpReserveInfo = await eth2XLeverageTokenContract.methods.getReserves().call()
  if (eth2x2ETHLpReserveInfo?._reserve0 && eth2x2ETHLpReserveInfo?._reserve1) {
    eth2XLeverageToken2Eth = new BigNumber(eth2x2ETHLpReserveInfo?._reserve0).dividedBy(eth2x2ETHLpReserveInfo?._reserve1).dividedBy(1000000000000)
  }
  if (usdc2Eth && boxToken2Usdc) {
    boxToken2Eth = new BigNumber(usdc2Eth).times(boxToken2Usdc)
  }
  
  // if pool0 is box token, pool1 is eth 2x leverage
  if (poolId === 0) {
    distributePercent = await getPoolHarvestDistributePercent(provider,0)
    poolRewardTotal = annualSeconds.times(sushiPerSecond).times(boxToken2Eth).times(distributePercent)
    const balance = await boxTokenContract.methods.balanceOf(farmBoxTokenAddress).call()
    stakedValue = boxToken2Eth.times(balance)
  }
  if (poolId === 1) {
    distributePercent = await getPoolHarvestDistributePercent(provider,1)
    poolRewardTotal = annualSeconds.times(sushiPerSecond).times(eth2XLeverageToken2Eth).times(distributePercent)
    const balance = await eth2XLeverageTokenContract.methods.balanceOf(farmBoxTokenAddress).call()
    stakedValue = eth2XLeverageToken2Eth.times(balance)
  }

  return stakedValue
}

export const getPoolAPR = async (
  provider: provider,
  poolId:number,
): Promise<Number | null> => {
  const stakingContract = getBoxTokenFarmContract(provider)
  const boxTokenContract = getBoxTokenContract(provider);
  const eth2XLeverageTokenContract = getEth2XLeverageTokenContract(provider);
  const eth2USDCLpTokenContract = getEth2USDCLPContract(provider)
  const annualSeconds = new BigNumber(365).times(24).times(3600)

  let boxToken2Usdc;
  let eth2XLeverageToken2Eth;
  let usdc2Eth;
  let sushiPerSecond;
  let distributePercent;
  let poolRewardTotal;
  let stakedValue;
  let boxToken2Eth;
  sushiPerSecond = await stakingContract.methods.sushiPerSecond().call()
  const boxLpReserveInfo = await boxTokenContract.methods.getReserves().call()
  if (boxLpReserveInfo?._reserve0 && boxLpReserveInfo?._reserve1) {
    boxToken2Usdc = new BigNumber(boxLpReserveInfo?._reserve0).dividedBy(boxLpReserveInfo?._reserve1)
  }
  const eth2USDCLpReserveInfo = await eth2USDCLpTokenContract.methods.getReserves().call()
  if (eth2USDCLpReserveInfo?._reserve0 && eth2USDCLpReserveInfo?._reserve1) {
    usdc2Eth = new BigNumber(eth2USDCLpReserveInfo?._reserve1).dividedBy(eth2USDCLpReserveInfo?._reserve0).dividedBy(1000000000000)
  }
  const eth2x2ETHLpReserveInfo = await eth2XLeverageTokenContract.methods.getReserves().call()
  if (eth2x2ETHLpReserveInfo?._reserve0 && eth2x2ETHLpReserveInfo?._reserve1) {
    eth2XLeverageToken2Eth = new BigNumber(eth2x2ETHLpReserveInfo?._reserve0).dividedBy(eth2x2ETHLpReserveInfo?._reserve1).dividedBy(1000000000000)
  }
  if (usdc2Eth && boxToken2Usdc) {
    boxToken2Eth = new BigNumber(usdc2Eth).times(boxToken2Usdc)
  }
  
  // if pool0 is box token, pool1 is eth 2x leverage
  if (poolId === 0) {
    distributePercent = await getPoolHarvestDistributePercent(provider,0)
    poolRewardTotal = annualSeconds.times(sushiPerSecond).times(boxToken2Eth).times(distributePercent)
    const balance = await boxTokenContract.methods.balanceOf(farmBoxTokenAddress).call()
    stakedValue = boxToken2Eth.times(balance)
  }
  if (poolId === 1) {
    distributePercent = await getPoolHarvestDistributePercent(provider,1)
    poolRewardTotal = annualSeconds.times(sushiPerSecond).times(eth2XLeverageToken2Eth).times(distributePercent)
    const balance = await eth2XLeverageTokenContract.methods.balanceOf(farmBoxTokenAddress).call()
    stakedValue = eth2XLeverageToken2Eth.times(balance)
  }
  if (stakedValue.toNumber() === 0) {
    return 0;
  }
  return new BigNumber(poolRewardTotal).dividedBy(stakedValue).toNumber()
}

// Currently set for 12pm PST Dec. 6th
export const farmEndTime = '1607284800000'
