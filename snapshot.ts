import CeramicClient from '@ceramicnetwork/http-client';
import { IDX } from '@ceramicstudio/idx'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import * as dotenv from 'dotenv';
import { BigNumber } from "ethers";
import * as fromString from 'uint8arrays/from-string';
import { ConvictionState, Proposal, UserConviction } from './proposal';
import { GraphQLClient, gql } from 'graphql-request'
import { definitions } from './config.json'

interface AccountInfo {
    id: string;
    balance: number;
    token: string;
    did?: string;
}

// const CERAMIC_URL = 'http://localhost:7007';
const CERAMIC_URL = 'https://ceramic-clay.3boxlabs.com';

//TODO: Get DID from wallet address, memberAccount1, memberAccount2
async function main() {
    dotenv.config();
    const dnycvContractAddress = process.env.DNYCV_CONTRACT_ADDRESS || '';
    const seed = fromString(process.env.SEED, 'base16');

    // ceramic
    let ceramic = new CeramicClient(CERAMIC_URL);
    await ceramic.setDIDProvider(new Ed25519Provider(seed));
    const idx = new IDX({ ceramic: ceramic, aliases: definitions });

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
        // Resolve a DID document
        // const doc = await didResolver.resolve(`did:ethr:${account.id}`)

        if (process.env.MEMBER1_ACCOUNT == account.id) {
            account.did = process.env.MEMBER1_DID;
        } else if (process.env.MEMBER2_ACCOUNT == account.id) {
            account.did = process.env.MEMBER2_DID;
        }
    };

    let proposalconvictions = [];
    let participants = [];

    for (const account of accounts) {
        if (account.did) {
            const memberConvictionDoc: UserConviction = await idx.get("convictions", account.did);
            console.log('memberConvictionDoc:');
            console.log(memberConvictionDoc);
            const memberBalance = BigNumber.from(account.balance).div(tokenBits);

            participants.push({ account: account.id, balance: memberBalance.toNumber(), convictions: 'commitid' });

            if (memberConvictionDoc) {
                for (let conviction of memberConvictionDoc.convictions) {
                    let FOUND = false;
                    let proposalallocation = conviction.allocation * memberBalance.toNumber();
                    for (let proposalconviction of proposalconvictions) {
                        if (conviction.proposal == proposalconviction.proposal) {
                            proposalconviction.totalConviction += proposalallocation;
                            FOUND = true;
                        }
                    }
                    if (!FOUND) {
                        proposalconvictions.push({ proposal: conviction.proposal, totalConviction: proposalallocation, triggered: false })
                    }
                }
            }
        }
    }

    //TODO: set triggered based on threshold
    console.log(`proposal convictions: ${proposalconvictions}`);

    const convictionsState = {
        context: 'eip155:1/erc20:' + dnycvContractAddress,
        supply: totalSupply,
        participants: [
            // e.g.:
            // {
            //     "account": process.env.MEMBER1_ACCOUNT,
            //     "balance": memberBal1,
            //     "convictions": memberCommitID1
            // },
        ],
        proposals: [
            // e.g.:
            // {
            // proposal: "kjzl6cwe1jw148f6l3w9bdm3t9cmavjikasq1akxun9l0rsb29spklonfyrp3lf",
            // totalConviction: 234,
            // triggered: false
            // },
        ]
    }

    convictionsState.participants = participants;
    convictionsState.proposals = proposalconvictions;

    const convictionsStateDoc = await ceramic.loadDocument(process.env.CONVICTIONSTATEDOCID);
    console.log('convictions state before:');
    console.log(convictionsStateDoc.content);

    await convictionsStateDoc.change({ content: convictionsState });

    console.log('convictions state after:');
    console.log(convictionsStateDoc.content);
    process.exit(0)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
