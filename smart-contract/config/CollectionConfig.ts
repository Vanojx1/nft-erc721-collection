import CollectionConfigInterface from '../lib/CollectionConfigInterface';
import * as Networks from '../lib/Networks';
import * as Marketplaces from '../lib/Marketplaces';
import whitelistAddresses from './whitelist.json';

const CollectionConfig: CollectionConfigInterface = {
  testnet: Networks.ethereumTestnet,
  mainnet: Networks.ethereumMainnet,
  // The contract name can be updated using the following command:
  // yarn rename-contract NEW_CONTRACT_NAME
  // Please DO NOT change it manually!
  contractName: 'StrayDogz',
  tokenName: 'StrayDogz',
  tokenSymbol: 'SDZ',
  hiddenMetadataUri: 'ipfs://__CID__/hidden.json',
  maxSupply: 6969,
  whitelistSale: {
    price: 0.00,
    maxMintAmountPerTx: 5,
  },
  preSale: {
    price: 0.00,
    maxMintAmountPerTx: 5,
  },
  publicSale: {
    price: 0.00,
    maxMintAmountPerTx: 5,
  },
  contractAddress: null,
  marketplaceIdentifier: 'stray-dogz',
  marketplaceConfig: Marketplaces.openSea,
  whitelistAddresses,
};

export default CollectionConfig;
