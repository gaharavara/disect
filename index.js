require("dotenv").config();
const { SafeFactory, SafeAccountConfig, ContractNetworksConfig } = require("@gnosis.pm/safe-core-sdk");
const Safe = require("@gnosis.pm/safe-core-sdk")["default"];

const ceo = process.env.ACCOUNT_1;
const cto = process.env.ACCOUNT_2;
const meme_artist = process.env.ACCOUNT_3;
const solidity_engineer = process.env.ACCOUNT_4;
const advisor = process.env.ACCOUNT_5;
const investor = process.env.ACCOUNT_6;
const yacht_shop = process.env.ACCOUNT_7;

const { ethers } = require("ethers");

// A provider is an Ethereum connection object
const provider = new ethers.providers.JsonRpcProvider();

const ceo_signer = provider.getSigner(ceo);
const cto_signer = provider.getSigner(cto);
const advisor_signer = provider.getSigner(advisor);

// The Gnosis safe contract works with the ethers.js library
// so we need an adapter that works with ether.js
// We need an adapter for every signer
const EthersAdapter = require("@gnosis.pm/safe-ethers-lib")["default"];
const ethAdapter_ceo = new EthersAdapter({ ethers, signer: ceo_signer });
const ethAdapter_cto = new EthersAdapter({ ethers, signer: cto_signer });
const ethAdapter_advisor = new EthersAdapter({ ethers, signer: advisor_signer });

/*
Create safe basically creates a multisig with the given addresses
v1:
invoker ( ethAdapter ): the person who is creating the safe
owners: list of members of the multisig
*/
async function createSafe(invoker, owners) {

}

async function main() {
  // get chain id
  const id = await ethAdapter_ceo.getChainId();
  const contractNetworks = {
    [id]: {
      // 3 smart contracts with which the safe will interact
      multiSendAddress: process.env.MULTI_SEND_ADDRESS,
      safeMasterCopyAddress: process.env.SAFE_MASTER_COPY_ADDRESS,
      safeProxyFactoryAddress: process.env.SAFE_PROXY_FACTORY_ADDRESS,
    }
  }
  // create the safe factory
  const safeFactory = await SafeFactory.create({
    ethAdapter: ethAdapter_ceo,
    contractNetworks: contractNetworks,
  });

  // create a safe using safe factory
  // addresses of the members of the safe
  const owners = [ceo, cto, meme_artist, solidity_engineer, advisor];
  // minimum amount of signatures required to approve transactions for this safe
  const threshold = 2;
  const safeAccountConfig = {
    owners: owners,
    threshold: threshold,
  };
  // deploy a safe
  const safeSdk_ceo = await safeFactory.deploySafe({safeAccountConfig});
  const treasury = safeSdk_ceo.getAddress();
  const ten_ethers = ethers.utils.parseUnits("10", "ether").toHexString();
  const trx_params = [{
    from: investor,
    to: treasury,
    value: ten_ethers,
  }];

  // Investor sends money to the created safe / treasury using `eth_sendTransaction` RPC method
  await provider.send("eth_sendTransaction", trx_params);
  console.log("Fundraising.");

  // check balance of the safe
  const balance = await safeSdk_ceo.getBalance();
  console.log(`Initial balance of the treasury: ${ethers.utils.formatUnits(balance, "ether")} ETH`);

  const three_ethers = ethers.utils.parseUnits("3", "ether").toHexString();

  const transaction = {
    to: yacht_shop,
    // replace this with contract parameters
    data: "0x",
    value: three_ethers,
  };

  const safeTransaction = await safeSdk_ceo.createTransaction(transaction);
  const hash = await safeSdk_ceo.getTransactionHash(safeTransaction);
  const txResponse = await safeSdk_ceo.approveTransactionHash(hash);
  await txResponse.transactionResponse?.wait();

  const hashCTO = await safeSdk_ceo.getTransactionHash(safeTransaction);

  const safeSdk_cto = await Safe.create({
    ethAdapter: ethAdapter_cto,
    safeAddress: treasury,
    contractNetworks: contractNetworks,
  });

  const safeTransactionCTO = await safeSdk_cto.createTransaction(transaction);
  const txResponse_cto = await safeSdk_cto.executeTransaction(safeTransactionCTO);
  await txResponse_cto.transactionResponse?.wait();

  console.log("Buying a yacht.");

  const afterBalance = await safeSdk_ceo.getBalance();
  console.log(`The final balance of the treasury: ${ethers.utils.formatUnits(afterBalance, "ether")} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });