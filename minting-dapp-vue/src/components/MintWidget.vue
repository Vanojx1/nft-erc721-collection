<template>
  <div>
    <div v-if="canMint" :class="mint-widget">
      <div className="preview">
        <img src="/build/images/preview.png" alt="Collection preview" />
      </div>

      <div className="price">
        <strong>Total price:</strong> {{formattedPrice}} {{networkConfig.symbol}}
      </div>

      <div className="controls">
        <button className="decrease" :disabled="loading">-</button>
        <span className="mint-amount">{{mintAmount}}</span>
        <button className="increase" :disabled="loading">+</button>
        <button className="primary" :disabled="loading">Mint</button>
      </div>
    </div>
    <div v-else>
      <div className="cannot-mint">
        <span className="emoji">⏳</span>
        <template v-if="!isWhitelistMintEnabled">You are not included in the <strong>whitelist</strong>.</template>
        <template v-else>The contract is <strong>paused</strong>.</template>
        Please come back during the next sale!
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { utils, BigNumber } from 'ethers'
import NetworkConfigInterface from '../../../smart-contract/lib/NetworkConfigInterface'

const props = {
  networkConfig: null,
  maxSupply: Number,
  totalSupply: Number,
  tokenPrice: BigNumber,
  maxMintAmountPerTx: Number,
  isPaused: Boolean,
  loading: Boolean,
  isWhitelistMintEnabled: Boolean,
  isUserInWhitelist: Boolean,
  mintTokens: null,
  whitelistMintTokens: null
}

@Options({
  props
})
export default class HelloWorld extends Vue {
  networkConfig!: NetworkConfigInterface
  maxSupply!: number
  totalSupply!: number
  tokenPrice!: BigNumber
  maxMintAmountPerTx!: number
  isPaused!: boolean
  loading!: boolean
  isWhitelistMintEnabled!: boolean
  isUserInWhitelist!: boolean
  mintTokens!: (mintAmount: number) => Promise<void>
  whitelistMintTokens!: (mintAmount: number) => Promise<void>

  mintAmount = 0

  private get canMint (): boolean {
    return !this.isPaused || this.canWhitelistMint
  }

  private get canWhitelistMint (): boolean {
    return this.isWhitelistMintEnabled && this.isUserInWhitelist
  }

  private get formattedPrice (): string {
    return utils.formatEther(this.tokenPrice.mul(this.mintAmount))
  }

  private async mint (): Promise<void> {
    if (!this.isPaused) {
      await this.mintTokens(this.mintAmount)
      return
    }
    await this.whitelistMintTokens(this.mintAmount)
  }
}
</script>
