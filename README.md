# offchain-cv-snapshot
## offchain conviction voting snapshot service for dapp https://github.com/dynamiculture/offchain-cv-dapp
## Quick start
Create .env (listed in .gitignore) supplying the following values:
```sh
RINKEBY_PRIVATE_KEY=
INFURA_API_KEY=
```
To run, use seed provided to https://github.com/dynamiculture/offchain-cv-dapp/bootstap.js
```sh
tsc --skipLibCheck ./snapshot.ts && SEED=<Your seed from> node ./snapshot.js
```
TODO:

- Get totalSupply and balances from contract https://rinkeby.etherscan.io/address/0x89809eFf0F1DC160830C1Ee877ba7D107cAb8E8e 
created from 
https://github.com/dynamiculture/offchain-cv-contract

- Add trigger calculation.
- Get commitIds from IDX document.