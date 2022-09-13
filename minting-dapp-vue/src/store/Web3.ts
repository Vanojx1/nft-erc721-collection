import { ethers, BigNumber } from 'ethers'
import { defineStore } from 'pinia'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import detectEthereumProvider from '@metamask/detect-provider'

import NetworkConfigInterface from '../../../smart-contract/lib/NetworkConfigInterface'
import CollectionConfig from '../../../smart-contract/config/CollectionConfig'
import NftContractType from '../scripts/lib/NftContractType'
import Whitelist from '../scripts/lib/Whitelist'

import { markRaw } from 'vue'

// eslint-disable-next-line
const ContractAbi = require(`../../../smart-contract/artifacts/contracts/${CollectionConfig.contractName}.sol/${CollectionConfig.contractName}.json`).abi

interface State {
  contract: NftContractType|null,
  provider: Web3Provider|null,
  userAddress: string|null;
  network: ethers.providers.Network|null;
  networkConfig: NetworkConfigInterface;
  totalSupply: number;
  maxSupply: number;
  maxMintAmountPerTx: number;
  tokenPrice: BigNumber;
  isPaused: boolean;
  loading: boolean;
  isWhitelistMintEnabled: boolean;
  isUserInWhitelist: boolean;
  merkleProofManualAddress: string;
  merkleProofManualAddressFeedbackMessage: string|JSX.Element|null;
  errorMessage: string|JSX.Element|null;
}

const defaultState: State = {
  contract: null,
  provider: null,
  userAddress: null,
  network: null,
  networkConfig: CollectionConfig.mainnet,
  totalSupply: 0,
  maxSupply: 0,
  maxMintAmountPerTx: 0,
  tokenPrice: BigNumber.from(0),
  isPaused: true,
  loading: false,
  isWhitelistMintEnabled: false,
  isUserInWhitelist: false,
  merkleProofManualAddress: '',
  merkleProofManualAddressFeedbackMessage: null,
  errorMessage: null
}

export const useWeb3 = defineStore('Web3', {
  state: () => defaultState,
  actions: {
    async init () {
      const browserProvider = await detectEthereumProvider() as ExternalProvider
      this.provider = markRaw(new ethers.providers.Web3Provider(browserProvider))
      this.registerWalletEvents(browserProvider)
      await this.initWallet()
    },
    registerWalletEvents (browserProvider: ExternalProvider) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      browserProvider.on('accountsChanged', () => {
        this.initWallet()
      })

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      browserProvider.on('chainChanged', () => {
        window.location.reload()
      })
    },
    async initWallet () {
      console.log('Init Wallet!')

      const walletAccounts = await this.provider?.listAccounts()

      this.$reset()

      if (!walletAccounts || walletAccounts?.length === 0) return

      const network = await this.provider?.getNetwork()
      let networkConfig: NetworkConfigInterface
      if (!network) return
      if (network.chainId === CollectionConfig.mainnet.chainId) {
        networkConfig = CollectionConfig.mainnet
      } else if (network.chainId === CollectionConfig.testnet.chainId) {
        networkConfig = CollectionConfig.testnet
      } else {
        this.setError('Unsupported network!')
        return
      }

      this.$patch({
        userAddress: walletAccounts[0],
        network: markRaw(network),
        networkConfig
      })

      if (await this.provider?.getCode(CollectionConfig.contractAddress!) === '0x') {
        this.setError('Could not find the contract, are you connected to the right chain?')
        return
      }

      this.contract = markRaw(new ethers.Contract(
        CollectionConfig.contractAddress!,
        ContractAbi,
        this.provider?.getSigner()
      )) as unknown as NftContractType

      this.refreshContractState()
    },
    async refreshContractState () {
      if (!this.contract) return
      console.log('Refresh contract!')
      this.$patch({
        maxSupply: (await this.contract.maxSupply()).toNumber(),
        totalSupply: (await this.contract.totalSupply()).toNumber(),
        maxMintAmountPerTx: (await this.contract.maxMintAmountPerTx()).toNumber(),
        tokenPrice: await this.contract.cost(),
        isPaused: await this.contract.paused(),
        isWhitelistMintEnabled: await this.contract.whitelistMintEnabled(),
        isUserInWhitelist: Whitelist.contains(this.userAddress ?? '')
      })
    },
    setError (error: any = null) {
      let errorMessage = 'Unknown error...'

      if (error === null || typeof error === 'string') {
        errorMessage = error
      } else if (typeof error === 'object') {
        // Support any type of error from the Web3 Provider...
        if (error?.error?.message !== undefined) {
          errorMessage = error.error.message
        } else if (error?.data?.message !== undefined) {
          errorMessage = error.data.message
        } else if (error?.message !== undefined) {
          errorMessage = error.message
        }
      }

      this.errorMessage = errorMessage === null ? null : errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
    },
    async connectWallet () {
      try {
        await this.provider?.provider?.request!({ method: 'eth_requestAccounts' })

        this.initWallet()
      } catch (e) {
        this.setError(e)
      }
    },
    copyMerkleProofToClipboard (): void {
      const merkleProof = Whitelist.getRawProofForAddress(this.userAddress ?? this.merkleProofManualAddress)

      /* if (merkleProof.length < 1) {
        this.merkleProofManualAddressFeedbackMessage = 'The given address is not in the whitelist, please double-check.'
        return
      } */

      navigator.clipboard.writeText(merkleProof)
      /*
      this.setState({
        merkleProofManualAddressFeedbackMessage:
        <>
          <strong>Congratulations!</strong> <span className="emoji">🎉</span><br />
          Your Merkle Proof <strong>has been copied to the clipboard</strong>. You can paste it into <a href={this.generateContractUrl()} target="_blank">{this.state.networkConfig.blockExplorer.name}</a> to claim your tokens.
        </>,
      });
      */
    }
  },
  getters: {
    isMetamask (): boolean {
      return this?.provider?.connection?.url === 'metamask'
    },
    isWalletConnected (): boolean {
      return this.userAddress !== null
    },
    isContractReady (): boolean {
      return this.contract !== undefined
    },
    isSoldOut (): boolean {
      return this.maxSupply !== 0 && this.totalSupply >= this.maxSupply
    },
    isNotMainnet (): boolean {
      console.log('==>', this?.network?.chainId, CollectionConfig.mainnet.chainId)
      return this.network !== null && this.network.chainId !== CollectionConfig.mainnet.chainId
    },
    generateContractUrl (): string {
      return this.networkConfig.blockExplorer.generateContractUrl(CollectionConfig.contractAddress!)
    },
    generateMarketplaceUrl (): string {
      return CollectionConfig.marketplaceConfig.generateCollectionUrl(CollectionConfig.marketplaceIdentifier, !this.isNotMainnet)
    },
    generateTransactionUrl (state): (arg0: any) => string {
      return (transactionHash: any) => state.networkConfig.blockExplorer.generateTransactionUrl(transactionHash)
    }
  }
})
