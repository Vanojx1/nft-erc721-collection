<template>
  <div id="minting-dapp">

    <img id="logo" src="../assets/logo.png" alt="Logo" />

    <div v-if="Web3.isNotMainnet" class="alert alert-warning" role="alert">
      You are not connected to the main network. <span class="small">Current network: <strong>{{Web3.network?.name}}</strong></span>
    </div>

    <div v-if="Web3.errorMessage" class="alert alert-warning alert-dismissible fade show" role="alert">
      {{ Web3.errorMessage }}
      <button @click="Web3.setError()" type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>

    <template v-if="Web3.isWalletConnected && Web3.isContractReady">
      <collection-status />
      <mint-widget v-if="!Web3.isSoldOut"/>
      <div v-else>
        <h2>Tokens have been <strong>sold out</strong>! <span class="emoji">🥳</span></h2>
        You can buy from our beloved holders on <a :href="Web3.generateMarketplaceUrl" target="_blank">{{Web3.marketPlaceName}}</a>.
      </div>
    </template>

    <div v-if="!Web3.isContractReady" class="collection-not-ready">
      <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>

      Loading collection data...
    </div>

    <div v-else-if="!Web3.isWalletConnected" class="no-wallet">
      <button class="primary" @click="Web3.connectWallet">Connect Wallet</button>

      <div class="use-block-explorer">
        Hey, looking for a <strong>super-safe experience</strong>? <span class="emoji">😃</span><br />
        You can interact with the smart-contract <strong>directly</strong> through <a :href="Web3.generateContractUrl" target="_blank">{{Web3.networkConfig.blockExplorer.name}}</a>, without even connecting your wallet to this DAPP! <span class="emoji">🚀</span><br />
        <br />
        Keep safe! <span class="emoji">❤️</span>
      </div>

      <div v-if="!Web3.isWalletConnected || Web3.isWhitelistMintEnabled" class="merkle-proof-manual-address">
        <h2>Whitelist Proof</h2>
        <p>
          Anyone can generate the proof using any public address in the list, but <strong>only the owner of that address</strong> will be able to make a successful transaction by using it.
        </p>

        <div v-if="Web3.merkleProofManualAddressStatus === true" class="feedback-message">
          <strong>Congratulations!</strong> <span class="emoji">🎉</span><br />
          Your Merkle Proof <strong>has been copied to the clipboard</strong>. You can paste it into <a :href="Web3.generateContractUrl" target="_blank">{{Web3.networkConfig.blockExplorer.name}}</a> to claim your tokens.
        </div>
        <div v-else-if="Web3.merkleProofManualAddressStatus === false" class="feedback-message">
          The given address is not in the whitelist, please double-check.
        </div>

        <label htmlFor="merkle-proof-manual-address">Public address:</label>
        <input id="merkle-proof-manual-address" type="text" placeholder="0x000..." v-model="merkleProofManualAddress" />
        <button @click="merkleProofManualAddress && Web3.copyMerkleProofToClipboard(merkleProofManualAddress)">Generate and copy to clipboard</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch, ref } from 'vue'
import CollectionStatus from '@/components/CollectionStatus.vue'
import MintWidget from '@/components/MintWidget.vue'
import { useWeb3 } from '@/store/Web3'

const Web3 = useWeb3()
const merkleProofManualAddress = ref('')
watch(() => Web3.userAddress, (userAddress) => {
  if (!merkleProofManualAddress.value && userAddress) {
    merkleProofManualAddress.value = userAddress?.toString()
  }
})
</script>
