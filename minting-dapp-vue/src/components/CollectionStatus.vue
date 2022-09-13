<template>
  <div className="collection-status">
    <div className="user-address">
      <span className="label">Wallet address:</span>
      <span className="address">{{userAddress}}</span>
    </div>
    <div className="supply">
      <span className="label">Supply</span>
      {{totalSupply}}/{{maxSupply}}
    </div>

    <div className="current-sale">
      <span className="label">Sale status</span>
      {{this.isSaleOpen ? (this.isWhitelistMintEnabled ? 'Whitelist only' : 'Open') : 'Closed'}}
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({
  props: {
    userAddress: String,
    totalSupply: Number,
    maxSupply: Number,
    isPaused: Boolean,
    isWhitelistMintEnabled: Boolean,
    isUserInWhitelist: Boolean,
    isSoldOut: Boolean
  }
})
export default class HelloWorld extends Vue {
  userAddress!: string
  totalSupply!: number
  maxSupply!: number
  isPaused!: boolean
  isWhitelistMintEnabled!: boolean
  isUserInWhitelist!: boolean
  isSoldOut!: boolean

  private isSaleOpen (): boolean {
    return (this.isWhitelistMintEnabled || !this.isPaused) && !this.isSoldOut
  }
}
</script>
