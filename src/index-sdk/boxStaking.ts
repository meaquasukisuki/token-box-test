import Web3 from 'web3'
import { provider } from 'web3-core'
import { AbiItem } from 'web3-utils'

import { stakingRewardsAddress,farmEth2XLeverageAddress,farmBoxTokenAddress, uniswapBoxLpTokenAddress,uniswapEth2xLeverageLpTokenAddress, uniswapEth2USDCLpTokenAddress, quickSwapRouterAddress, uniswapRouterAddress, usdcTokenPolygonAddress, boxTokenAddress, farmTwoAddress, ethTokenAddress, usdcTokenAddress, usdcToBoxPath, maticAddress, ethToUSDCPath } from 'constants/ethContractAddresses'
import StakeABI from 'index-sdk/abi/Stake.json'
import BoxLpTokenABI from 'index-sdk/abi/boxLpToken.json'
import BoxTokenABI from 'index-sdk/abi/boxToken.json'
import Eth2XLeverageFarmABI from 'index-sdk/abi/eth2XLeverageFarm.json'
import eth2XLeverageTokenABI from 'index-sdk/abi/eth2XLeverageToken.json'
import eth2USDCTokenABI from 'index-sdk/abi/eth2USDCLpToken.json'
import quickSwapRouterABI from 'index-sdk/abi/quickSwap.json'
import usdcTokenABI from 'index-sdk/abi/usdcToken.json'
import usdcTokenProxyABI from 'index-sdk/abi/usdcProxy.json'
import BigNumber from 'utils/bignumber'
import {Transaction as Tx} from 'ethereumjs-tx'
import Common from 'ethereumjs-common'
import { ethers } from 'ethers'
import { approve } from 'utils'
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
    boxTokenAddress,
  )
  return contract
}

export const getLPBoxTokenContract = (provider: provider) => {
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(
    BoxLpTokenABI as unknown as AbiItem,
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

export const getUserBoxStakedBalance = async (
  provider: provider,
  userAddress:string
): Promise<string | null> => {
  const contract = getBoxTokenFarmContract(provider)
  try {
    const res = await contract.methods.userInfo(
      1,
      userAddress
    ).call()

    // userInfo format:
    // {
    //   "0": "0",
    //   "1": "0",
    //   "amount": "0",
    //   "rewardDebt": "0"
    // }

    return res?.amount;
  } catch (error) {
    console.error(error);
  }
}

export const getQuickSwapRouter = (provider: provider) => {
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(
    quickSwapRouterABI as unknown as AbiItem,
    quickSwapRouterAddress
  )
  return contract
}

export const getUSDCTokenPolygonContract = (provider: provider) => {
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(
    usdcTokenProxyABI as unknown as AbiItem,
    usdcTokenPolygonAddress
  )
  return contract
}

export const getUSDCProxyContract = (provider: provider) => {
  const usdcContractProxyAddress = "0xDD9185DB084f5C4fFf3b4f70E7bA62123b812226";
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(
    usdcTokenProxyABI as unknown as AbiItem,
    usdcContractProxyAddress
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
) => {
  const web3 = new Web3(provider)
  const stakingContract = getBoxTokenFarmContract(provider)
  const pid = "1"
  const data = stakingContract.methods.deposit(
    web3.utils.toHex(pid),
    web3.utils.toHex(stakeQuantity.toNumber()),
    account
  )
  const encodeABI = data.encodeABI()

  try {
    const res = await web3.eth.sendTransaction({
      from: account,
      gasPrice: web3.utils.toHex(web3.utils.toWei("30","gwei")),
      gas: web3.utils.toHex(290000),
      to: farmBoxTokenAddress,
      data: encodeABI,
      value: 0,
      nonce: await web3.eth.getTransactionCount(account)
    })
    return res.transactionHash;
  } catch (error) {
    console.error(error);
  }
    // return new Promise((resolve) => {
  //   stakingContract.methods
  //     .deposit(pid,stakeQuantity.toNumber(),account)
  //     .send({ 
  //       from: account,
  //       gas: 2000000,
  //     })
  //     .on('transactionHash', (txId: string) => {
  //       if (!txId) resolve(null)
  //       resolve(txId)
  //     })
  //     .on('error', (error: any) => {
  //       console.log(error)
  //       resolve(null)
  //     })
  // })
}

export const claimEarnedBoxTokenReward = async (
  provider: provider,
  account: string,
): Promise<string | null> => {
  try {
    const web3 = new Web3(provider)
    const contract = getBoxTokenFarmContract(provider)
    const data =  contract.methods.harvest(
      1,
      account
    )
    const encodedABI = data.encodeABI()

    const res = await web3.eth.sendTransaction({
      "from": account,
      "gasPrice": web3.utils.toHex(web3.utils.toWei("30","gwei")),
      "gas": web3.utils.toHex(290000),
      "to": farmBoxTokenAddress,
      "value": 0,
      "data":encodedABI,
      "nonce":await web3.eth.getTransactionCount(account)
    })

    return res.transactionHash;
  } catch (error) {
    console.error(error)
  }
}

export const unStakeLpBox = async (
  provider: provider,
  amount: BigNumber,
  account: string,
): Promise<string | null> => {

  try {
    const web3 = new Web3(provider)
    const contract = getBoxTokenFarmContract(provider)
    const boxLpBalance = await getUserBoxStakedBalance(
      provider,
      account
    )

    if (amount.isGreaterThan(new BigNumber(boxLpBalance))) {
      throw new Error("Cannot withdraw amount greater than balance!")
    }

    const data =  contract.methods.withdraw(
      web3.utils.toHex(1),
      web3.utils.toHex(amount.toString()),
      web3.utils.toHex(account)
    )

    const encodedABI = data.encodeABI()
    const res = await web3.eth.sendTransaction({
      "from": account,
      "gasPrice": web3.utils.toHex(web3.utils.toWei("30","gwei")),
      "gas": web3.utils.toHex(290000),
      "to": farmBoxTokenAddress,
      "value": 0,
      "data":encodedABI,
      "nonce":await web3.eth.getTransactionCount(account)
    })

    return res.transactionHash;
  } catch (error) {
    console.error(error)
  }
}

export const unstakeAndHarvest =async (
  provider: provider,
  amount: BigNumber,
  account: string
) => {
  try {
    const web3 = new Web3(provider)
    const contract = getBoxTokenFarmContract(provider)
    const boxLpBalance = await getUserBoxStakedBalance(
      provider,
      account
    )

    if (amount.isGreaterThan(new BigNumber(boxLpBalance))) {
      throw new Error("Cannot withdraw amount greater than balance!")
    }

    const data =  contract.methods.withdrawAndHarvest(
      web3.utils.toHex(1),
      web3.utils.toHex(amount.toString()),
      web3.utils.toHex(account)
    )

    const encodedABI = data.encodeABI()
    const res = await web3.eth.sendTransaction({
      "from": account,
      "gasPrice": web3.utils.toHex(web3.utils.toWei("30","gwei")),
      "gas": web3.utils.toHex(290000),
      "to": farmBoxTokenAddress,
      "value": 0,
      "data":encodedABI,
      "nonce":await web3.eth.getTransactionCount(account)
    })

    return res.transactionHash;
  } catch (error) {
    console.error(error)
  }
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

// export const getPoolAPR = async (
//   provider: provider,
//   poolId:number,
// ): Promise<Number | null> => {
//   const stakingContract = getBoxTokenFarmContract(provider)
//   const boxTokenContract = getBoxTokenContract(provider);
//   const eth2XLeverageTokenContract = getEth2XLeverageTokenContract(provider);
//   const eth2USDCLpTokenContract = getEth2USDCLPContract(provider)
//   const annualSeconds = new BigNumber(365).times(24).times(3600)

//   let annualBox;
//   let sushiPerSecond = await stakingContract.methods.sushiPerSecond().call()
//   annualBox = annualSeconds.times(sushiPerSecond)

//   let boxToken2Usdc;
//   let eth2XLeverageToken2Eth;
//   let usdc2Eth;
//   let sushiPerSecond;
//   let distributePercent;
//   let poolRewardTotal;
//   let stakedValue;
//   let boxToken2Eth;
//   sushiPerSecond = await stakingContract.methods.sushiPerSecond().call()
//   const boxLpReserveInfo = await boxTokenContract.methods.getReserves().call()
//   if (boxLpReserveInfo?._reserve0 && boxLpReserveInfo?._reserve1) {
//     boxToken2Usdc = new BigNumber(boxLpReserveInfo?._reserve0).dividedBy(boxLpReserveInfo?._reserve1)
//   }
//   const eth2USDCLpReserveInfo = await eth2USDCLpTokenContract.methods.getReserves().call()
//   if (eth2USDCLpReserveInfo?._reserve0 && eth2USDCLpReserveInfo?._reserve1) {
//     usdc2Eth = new BigNumber(eth2USDCLpReserveInfo?._reserve1).dividedBy(eth2USDCLpReserveInfo?._reserve0).dividedBy(1000000000000)
//   }
//   const eth2x2ETHLpReserveInfo = await eth2XLeverageTokenContract.methods.getReserves().call()
//   if (eth2x2ETHLpReserveInfo?._reserve0 && eth2x2ETHLpReserveInfo?._reserve1) {
//     eth2XLeverageToken2Eth = new BigNumber(eth2x2ETHLpReserveInfo?._reserve0).dividedBy(eth2x2ETHLpReserveInfo?._reserve1).dividedBy(1000000000000)
//   }
//   if (usdc2Eth && boxToken2Usdc) {
//     boxToken2Eth = new BigNumber(usdc2Eth).times(boxToken2Usdc)
//   }
  
//   // if pool0 is box token, pool1 is eth 2x leverage
//   if (poolId === 0) {
//     distributePercent = await getPoolHarvestDistributePercent(provider,0)
//     poolRewardTotal = annualSeconds.times(sushiPerSecond).times(boxToken2Eth).times(distributePercent)
//     const balance = await boxTokenContract.methods.balanceOf(farmBoxTokenAddress).call()
//     stakedValue = boxToken2Eth.times(balance)
//   }
//   if (poolId === 1) {
//     distributePercent = await getPoolHarvestDistributePercent(provider,1)
//     poolRewardTotal = annualSeconds.times(sushiPerSecond).times(eth2XLeverageToken2Eth).times(distributePercent)
//     const balance = await eth2XLeverageTokenContract.methods.balanceOf(farmBoxTokenAddress).call()
//     stakedValue = eth2XLeverageToken2Eth.times(balance)
//   }
//   if (stakedValue.toNumber() === 0) {
//     return 0;
//   }
//   return new BigNumber(poolRewardTotal).dividedBy(stakedValue).toNumber()
// }

export const swapETHForExactTokens = async (
  provider:provider,
  userAddress:string,
  ethAmount:number = 0.2,
  path: string[] = ethToUSDCPath
) => {

  try {
    const web3 = new Web3(provider)
    const contract = getQuickSwapRouter(provider)  
    let amountOut;
  
    const amountOutArray = await contract.methods.getAmountsOut(
      web3.utils.toWei(ethAmount.toString(),"ether"),
      path
    ).call() 
    
    if (Array.isArray(amountOutArray) && amountOutArray.length > 1) {
      amountOut = new BigNumber(amountOutArray[1])
    }
    
    const swap =  contract.methods.swapExactETHForTokens(
      web3.utils.toHex(amountOut),
      path,
      userAddress,
      web3.utils.toHex(Math.round(Date.now()/1000)+60*20),
    )
  
    const encodedABI = swap.encodeABI()

    const res = await web3.eth.sendTransaction({
      "from": userAddress,
      "gasPrice":web3.utils.toHex(web3.utils.toWei("50","gwei")),
      "gas":web3.utils.toHex(290000),
      "to":quickSwapRouterAddress,
      "value":web3.utils.toHex(web3.utils.toWei(ethAmount.toString(),"ether")),
      "data":encodedABI,
      "nonce":await web3.eth.getTransactionCount(userAddress)
    })
    return res;
  } catch (error) {
    console.error(error)
  }
}

export const addLiquidity =async (
  provider:provider, 
  userAddress: string,
): Promise<string | null> => {
  try {
    const web3 = new Web3(provider)
    const contract = getQuickSwapRouter(provider)

    let tokenAAmount = web3.utils.toWei(Number(20).toString(),"mwei")
    let tokenBAmountArr = await contract.methods.getAmountsOut(tokenAAmount,usdcToBoxPath).call()
    
    let tokenBAmount = tokenBAmountArr[1]
    
    const data = contract.methods.addLiquidity(
      usdcToBoxPath[0],
      usdcToBoxPath[1],
      tokenAAmount,
      tokenBAmount,
      0,
      0,
      userAddress,
      web3.utils.toHex(Math.round(Date.now()/1000)+60*20)
    )

    const res = await web3.eth.sendTransaction({
      from: userAddress,
      gasPrice: web3.utils.toHex(web3.utils.toWei("30","gwei")),
      gas: web3.utils.toHex(290000),
      to: quickSwapRouterAddress,
      data: data.encodeABI(),
      value: 0,
      nonce: await web3.eth.getTransactionCount(userAddress)
    })

    return res?.transactionHash;

  } catch (error) {
    console.error(error);
  }
}

export const getBoxPrice =async (provider:provider) => {
  const contract = getLPBoxTokenContract(provider)
  const ethToUSDCContract = getEth2USDCLPContract(provider)
  const reserves = contract.methods.getReserves().call()
  const reserve0 = reserves?._reserve0
  const reserve1 = reserves?._reserve1
  const boxUSDCPrice = new BigNumber(reserve0).dividedBy(reserve1)

  // const boxMaticPrice = 
} 

// Currently set for 12pm PST Dec. 6th
export const farmEndTime = '1607284800000'
