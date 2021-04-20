# offchain-cv-snapshot
## offchain conviction voting snapshot service for dapp https://github.com/dynamiculture/offchain-cv-dapp
## Quick start
Create .env (listed in .gitignore) supplying the following values:
```sh
SEED=<use seed provided to https://github.com/Dynamiculture/offchain-cv-dapp/blob/main/bootstrap.js>
DNYCV_CONTRACT_ADDRESS=0x8dbbd010B0B4B215C07feF16FEa9dA4Ea8e3FfA1
```
To run, use seed provided to https://github.com/Dynamiculture/offchain-cv-dapp/blob/main/bootstrap.js
```sh
tsc --skipLibCheck --resolveJsonModule ./snapshot.ts && node ./snapshot.js
```
TODO:
- get DIDs for accounts in contract https://rinkeby.etherscan.io/address/0x8dbbd010B0B4B215C07feF16FEa9dA4Ea8e3FfA1 
created from 
https://github.com/dynamiculture/offchain-cv-contract
- Get commitIds from IDX document.
- Add trigger calculation.
