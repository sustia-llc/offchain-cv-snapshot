import CeramicClient from '@ceramicnetwork/http-client';
import { IDX } from '@ceramicstudio/idx'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import * as fromString from 'uint8arrays/from-string';
import { ConvictionState, Proposal, UserConviction } from './proposal';
import { ethers } from "ethers";
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { Resolver } from 'did-resolver'

// const CERAMIC_URL = 'http://localhost:7007';
const CERAMIC_URL = 'https://ceramic-clay.3boxlabs.com';
const contractAddress = '0x89809eFf0F1DC160830C1Ee877ba7D107cAb8E8e';
const convictionsDefinition = 'kjzl6cwe1jw149rbubjkip4y34j0c4pltzumgdikv927aj76n323o7atuz9zvj0';
const convictionStateDocID = 'kjzl6cwe1jw1467mi6026py1lz1756foyjf7tch7124gwnjlyt4n01qpr728fry';

const memberAccount1 = '0xAcE8C3100F250ff86C89E2C140c7403798F5eCAc';
const memberDID1 = 'did:3:kjzl6cwe1jw147xybymyglzo2sy1mbgy25odccmzpfutl4gh4ep44cqe3c9zz7n';
const memberAccount2 = '0x509691E6e5B712a8B2e1E360C7713b911AD59C02';
const memberDID2 = 'did:3:kjzl6cwe1jw1493awsxakgh0rubvtbgddlei7neaag21fxql9qeir37i20ab4j7';
//TODO: Get from contract
const totalSupply = 9001;
const memberBal1 = 1337;
const memberBal2 = 42;

//TODO: Get DID from wallet address, memberAccount1, memberAccount2
async function main() {
    const seed = fromString(process.env.SEED, 'base16');
    let ceramic = new CeramicClient(CERAMIC_URL);
    await ceramic.setDIDProvider(new Ed25519Provider(seed));
    const idx = new IDX({ ceramic: ceramic });

    // // Load conviction documents for each member
    const memberConvictionDoc1: UserConviction = await idx.get(convictionsDefinition, memberDID1);
    const memberConvictionDoc2: UserConviction = await idx.get(convictionsDefinition, memberDID2);

    let proposalconvictions = [];
    // add all convictions from member1 doc
    if (memberConvictionDoc1) {
        for (let conviction of memberConvictionDoc1.convictions) {
            const proposalallocation = conviction.allocation * memberBal1;
            proposalconvictions.push({ proposal: conviction.proposal, totalConviction: proposalallocation, triggered: false })
        }
    }
    if (memberConvictionDoc2) {
        for (let conviction of memberConvictionDoc2.convictions) {
            let FOUND = false;
            let proposalallocation = conviction.allocation * memberBal2;
            for (let proposalconviction of proposalconvictions) {
                if (conviction.proposal == proposalconviction.proposal) {
                    proposalconviction.totalConviction = proposalconviction.totalConviction + proposalallocation;
                    FOUND = true;
                }
            }
            // if it was recently added by member2
            if (!FOUND) {
                proposalconvictions.push({ proposal: conviction.proposal, totalConviction: proposalallocation, triggered: false })
            }
        }
    }

    //TODO: set triggered based on threshold
    console.log(proposalconvictions);

    //FIXME:
    const memberCommitID1 = 'commitid1';
    const memberCommitID2 = 'commitid2';

    const emptyConvictionsState2 = {
        context: 'eip155:1/erc20:' + contractAddress,
        supply: totalSupply,
        participants: [
            {
                "account": memberAccount1,
                "balance": memberBal1,
                "convictions": memberCommitID1
            },
            {
                "account": memberAccount2,
                "balance": memberBal2,
                "convictions": memberCommitID2
            }
        ],
        proposals: [
            // {
            // proposal: "kjzl6cwe1jw148f6l3w9bdm3t9cmavjikasq1akxun9l0rsb29spklonfyrp3lf",
            // totalConviction: 234,
            // triggered: false
            // },
        ]
    }

    emptyConvictionsState2.proposals = proposalconvictions;

    const convictionsStateDoc = await ceramic.loadDocument(convictionStateDocID);
    console.log(convictionsStateDoc.content);

    await convictionsStateDoc.change({ content: emptyConvictionsState2 });
    console.log(convictionsStateDoc.content);

    console.log(convictionsStateDoc.id);
    process.exit(0)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
