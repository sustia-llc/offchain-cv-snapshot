import { GraphQLClient, gql } from 'graphql-request'
import * as dotenv from 'dotenv';
import { BigNumber } from "ethers";
import CeramicClient from '@ceramicnetwork/http-client';
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { Resolver } from 'did-resolver'

interface AccountInfo {
  id: string;
  balance: number;
  token: string;
  did?: string;
}

const CERAMIC_URL = 'https://ceramic-clay.3boxlabs.com';

async function main() {
  dotenv.config();
  const dnycvContractAddress = process.env.DNYCV_CONTRACT_ADDRESS || '';
  const seed = process.env.SEED || '';

  // ceramic 
  const ceramic = new CeramicClient(CERAMIC_URL);
  const threeIdResolver = ThreeIdResolver.getResolver(ceramic);
  const didResolver = new Resolver(threeIdResolver);

  // get account balances and total from contract
  const endpoint = 'https://api.thegraph.com/subgraphs/name/dynamiculture/dnycv';

  const graphQLClient = new GraphQLClient(endpoint);

  const query = gql`
    {
      accountTokenBalances(orderBy: balance) {
        id
        token
        balance
      }
    }
  `;

  let totalSupply = 0;
  const tokenBits = BigNumber.from(10).pow(18);

  const accounts: Array<AccountInfo> = (await graphQLClient.request(query)).accountTokenBalances;

  for (const account of accounts) {
    const amount = BigNumber.from(account.balance).div(tokenBits);
    console.log(`balance for ${account.id} in ${account.token} : ${amount}`);
    totalSupply += amount.toNumber();
    // Get DID from wallet address
    // currently failing:
    // didResolutionMetadata: { error: 'unsupportedDidMethod' }
    const doc = await didResolver.resolve(`did:ethr:${account.id}`);
    console.log(doc);
  };

  console.log(`total supply for ${dnycvContractAddress}: ${totalSupply}`);
  process.exit(0)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
