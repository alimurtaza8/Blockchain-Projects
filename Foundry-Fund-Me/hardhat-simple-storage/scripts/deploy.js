// imports
const { ethers, run, network } = require("hardhat");



//async main
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract...");
  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.waitForDeployment();
  console.log(`Deployed contract to: ${simpleStorage.target}`);
  if (network.config === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await simpleStorage.deployTransaction.wait(6);
    await verify(simpleStorage.target, []);
  }

  const currentValue = await simpleStorage.reterive();
  console.log(`Current value: ${currentValue}`);

  // update the value
  const transactionResponse = await simpleStorage.store(7);
  await transactionResponse.wait(1);
  const updatedValue = await simpleStorage.reterive();
  console.log(`Updated value: ${updatedValue}`);

}

async function verify(contractAdsress, args) {
  console.log("Verifing contract...");
  try {
    await run("verify:verify", {
      address: contractAdsress,
      constructorArguments: args,
    });
  }
  catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified");
    }
    else {
      console.log(e);
    }
  }
}

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });