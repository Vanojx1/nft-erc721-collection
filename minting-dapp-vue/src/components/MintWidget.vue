<template>
  <div>
    <div v-if="canMint" class="mint-widget">
      <div className="preview">
        <img src="../assets/logo.png" alt="Collection preview" />
      </div>

      <div className="price">
        <strong>Total price:</strong> {{formattedPrice}} {{Web3.networkConfig.symbol}}
      </div>

      <div className="controls">
        <button className="decrease" @click="changeAmount(-1)" :disabled="Web3.loading">-</button>
        <span className="mint-amount">{{mintAmount}}</span>
        <button className="increase" @click="changeAmount(1)" :disabled="Web3.loading">+</button>
        <button className="primary" @click="mint" :disabled="Web3.loading || mintAmount == 0">Mint</button>
      </div>
    </div>
    <div v-else>
      <div className="cannot-mint">
        <span className="emoji">⏳</span>
        <template v-if="Web3.isWhitelistMintEnabled">You are not included in the <strong>whitelist</strong>.</template>
        <template v-else>The contract is <strong>paused</strong>.</template>
        <br/> Please come back during the next sale!
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'
import { utils } from 'ethers'
import { useWeb3 } from '@/store/Web3'

export default class HelloWorld extends Vue {
  Web3 = useWeb3()
  mintAmount = 0

  get canMint (): boolean {
    return !this.Web3.isPaused || this.canWhitelistMint
  }

  private get canWhitelistMint (): boolean {
    return this.Web3.isWhitelistMintEnabled && this.Web3.isUserInWhitelist
  }

  get formattedPrice (): string {
    return utils.formatEther(this.Web3.tokenPrice * BigInt(this.mintAmount)).toString()
  }

  changeAmount (off: number) {
    if (this.mintAmount + off >= 0 && this.mintAmount + off <= this.Web3.maxMintAmountPerTx) {
      this.mintAmount += off
    }
  }

  async mint (): Promise<void> {
    if (!this.Web3.isPaused) {
      await this.Web3.mintTokens(this.mintAmount)
      return
    }
    await this.Web3.whitelistMintTokens(this.mintAmount)
  }
}
</script>
