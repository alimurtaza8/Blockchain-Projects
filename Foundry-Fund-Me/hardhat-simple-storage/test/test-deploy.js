const { ethers } = require("hardhat");
const { expect, assert } = require("chai");


describe("SimpleStorage", function () {
  let SimpleStorageFactory;
  let simpleStorage;

  beforeEach(async function () {
    SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorageFactory.deploy();

  })

  it("Should start with a favorite number 0", async function () {
    const currentValue = await simpleStorage.reterive();
    const expectedValue = "0";
    assert.equal(currentValue.toString(), expectedValue);
  })


  //only use for just run the test which we want
  it("Should update when we call store", async function () {
    const expectedValue = "7";
    const transactionResponse = await simpleStorage.store(expectedValue);
    await transactionResponse.wait(1);

    const currentValue = await simpleStorage.reterive();
    assert.equal(currentValue.toString(), expectedValue);
  })


})
