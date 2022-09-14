<template>
  <div class="home">
    <div v-if="Web3.isNotMainnet" class="alert alert-warning" role="alert">
      You are not connected to the main network. <span className="small">Current network: <strong>{{network?.name}}</strong></span>
    </div>
    <div v-if="!Web3?.isMetamask">
      We were not able to detect <strong>MetaMask</strong>. We value <strong>privacy and security</strong> a lot so we limit the wallet options on the DAPP.<br />
      <br />
      But don't worry! <span className="emoji">😃</span> You can always interact with the smart-contract through <a :href="Web3.generateContractUrl" target="_blank">{{Web3.networkConfig.blockExplorer.name}}</a> and <strong>we do our best to provide you with the best user experience possible</strong>, even from there.<br />
      <br />
      You can also get your <strong>Whitelist Proof</strong> manually, using the tool below.
    </div>
    <div v-if="Web3.errorMessage" class="alert alert-warning alert-dismissible fade show" role="alert">
      {{ Web3.errorMessage }}
      <button @click="Web3.setError()" type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    <template v-if="Web3.isWalletConnected && Web3.isContractReady">
      <collection-status
        :userAddress="Web3.userAddress"
        :maxSupply="Web3.maxSupply"
        :totalSupply="Web3.totalSupply"
        :isPaused="Web3.isPaused"
        :isWhitelistMintEnabled="Web3.isWhitelistMintEnabled"
        :isUserInWhitelist="Web3.isUserInWhitelist"
        :isSoldOut="Web3.isSoldOut" />
      <mint-widget
        v-if="!Web3.isSoldOut"
        :networkConfig="Web3.networkConfig"
        :maxSupply="Web3.maxSupply"
        :totalSupply="Web3.totalSupply"
        :tokenPrice="Web3.tokenPrice"
        :maxMintAmountPerTx="Web3.maxMintAmountPerTx"
        :isPaused="Web3.isPaused"
        :isWhitelistMintEnabled="Web3.isWhitelistMintEnabled"
        :isUserInWhitelist="Web3.isUserInWhitelist"
        :mintTokens="(mintAmount) => Web3.mintTokens(mintAmount)"
        :whitelistMintTokens="(mintAmount) => Web3.whitelistMintTokens(mintAmount)"
        :loading="Web3.loading"/>
      <div v-else>
        <h2>Tokens have been <strong>sold out</strong>! <span className="emoji">🥳</span></h2>
        You can buy from our beloved holders on <a :href="Web3.generateMarketplaceUrl" target="_blank">{{Web3.marketplaceName}}</a>.
      </div>
    </template>
    <div v-if="!Web3.isContractReady" className="collection-not-ready">
      <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading collection data...
    </div>
    <div className="no-wallet">
      <button v-if="!Web3.isWalletConnected" className="primary" :disabled="!Web3.provider" @click="Web3.connectWallet">Connect Wallet</button>

      <div className="use-block-explorer">
        Hey, looking for a <strong>super-safe experience</strong>? <span className="emoji">😃</span><br />
        You can interact with the smart-contract <strong>directly</strong> through <a :href="Web3.generateContractUrl" target="_blank">{{Web3.networkConfig.blockExplorer.name}}</a>, without even connecting your wallet to this DAPP! <span className="emoji">🚀</span><br />
        <br />
        Keep safe! <span className="emoji">❤️</span>
      </div>

      <div v-if="!Web3.isWalletConnected || Web3.isWhitelistMintEnabled" className="merkle-proof-manual-address">
        <h2>Whitelist Proof</h2>
        <p>
          Anyone can generate the proof using any public address in the list, but <strong>only the owner of that address</strong> will be able to make a successful transaction by using it.
        </p>

        <div v-if="Web3.merkleProofManualAddressStatus === true" className="feedback-message">
          <strong>Congratulations!</strong> <span className="emoji">🎉</span><br />
          Your Merkle Proof <strong>has been copied to the clipboard</strong>. You can paste it into <a :href="Web3.generateContractUrl" target="_blank">{{Web3.networkConfig.blockExplorer.name}}</a> to claim your tokens.
        </div>
        <div v-else-if="Web3.merkleProofManualAddressStatus === false" className="feedback-message">
          The given address is not in the whitelist, please double-check.
        </div>

        <label htmlFor="merkle-proof-manual-address">Public address:</label>
        <input id="merkle-proof-manual-address" type="text" placeholder="0x000..."
          :disabled="Web3.userAddress"
          :value="Web3.userAddress ?? Web3.merkleProofManualAddress"
          @change="Web3.setMerkleProofManualAddress" />
        <button @click="Web3.copyMerkleProofToClipboard">Generate and copy to clipboard</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import CollectionStatus from '@/components/CollectionStatus.vue'
import MintWidget from '@/components/MintWidget.vue'
import { useWeb3 } from '@/store/Web3'

@Options({
  components: {
    CollectionStatus,
    MintWidget
  }
})
export default class HomeView extends Vue {
  Web3 = useWeb3()
}
</script>
