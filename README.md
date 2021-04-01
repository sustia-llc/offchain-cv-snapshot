# offchain-cv-snapshot
## offchain conviction voting snapshot service for dapp https://github.com/dynamiculture/offchain-cv-dapp
## Quick start
Create .env (listed in .gitignore) supplying the following values:
```sh
RINKEBY_PRIVATE_KEY=
INFURA_API_KEY=
```
To run, use seed provided to https://github.com/Dynamiculture/offchain-cv-dapp/blob/main/bootstrap.js
```sh
tsc --skipLibCheck ./snapshot.ts && SEED=<Your seed from> node ./snapshot.js
```
TODO:

- Get totalSupply and balances from contract https://rinkeby.etherscan.io/address/0x26129f690d76480c130383ce85cda0340eee8dee 
created from 
https://github.com/dynamiculture/offchain-cv-contract

- Add trigger calculation.
- Get commitIds from IDX document.