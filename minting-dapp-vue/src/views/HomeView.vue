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
      <div v-else class="alert alert-success" role="alert">Sold Out!</div>
    </template>
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
