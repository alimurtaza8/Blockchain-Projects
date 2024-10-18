
# Voting System - A Decentralized Voting Application

## Overview

The **VotingSystem** project is a decentralized application (dApp) built using **Solidity** on the **Ethereum** blockchain. It allows users to cast votes in a secure, transparent, and tamper-proof way. The project is developed using the **Foundry** framework for testing, deployment, and interaction with the smart contract. The system ensures fair voting by keeping track of candidates, voters, and the votes each candidate receives, making it ideal for decentralized governance.

## Key Features

- **Candidate Registration**: Allows adding candidates to the blockchain.
- **Voter Registration**: Stores voter information, ensuring only registered users can vote.
- **Vote Casting**: A registered voter can cast a vote to any registered candidate. The system prevents double voting.
- **Vote Counting**: Keeps a tally of votes for each candidate.
- **Winner Declaration**: Determines the candidate with the highest votes and returns the address of the winner.

## Smart Contract Breakdown

The main contract `VotingSystem` is designed to handle the core functionality of the voting process. Key elements include:

- **Structs**:
  - `CandidateInfo`: Stores candidate details including their address, name, and vote count.
  - `VoterInfo`: Stores voter details including their address, name, and voting status (whether they have voted or not).

- **Events**:
  - `CandidateAdded`: Triggered when a new candidate is added.
  - `VoteCasted`: Triggered when a vote is successfully cast.

- **Functions**:
  - `addCandidate`: Adds a new candidate to the system.
  - `addVoter`: Registers a new voter to the system.
  - `vote`: Allows a registered voter to cast their vote for a candidate.
  - `win`: Determines and returns the winning candidate based on the highest vote count.
  - `retreiveCandidate`: Fetches information about a candidate.
  - `retreiveVoters`: Fetches voter details.
  - `retreiveOnwner`: Retrieves the contract owner.

- **Modifiers**:
  - `onlyOwner`: Ensures that only the contract owner can call certain functions.

## Foundry Framework

The **Foundry** framework is used for unit and interaction testing, as well as for deploying the VotingSystem contract. Foundry provides an efficient and modular toolkit for Ethereum development, including tools like **Forge** (testing), **Cast** (interacting with smart contracts), and **Anvil** (a local Ethereum node).

## Installation and Setup

### 1. Install Foundry

Foundry is written in Rust, so ensure Rust is installed on your machine.

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Build the Project

To compile and build the smart contract, use:

```bash
forge build
```

### 3. Test the Contract

You can run the unit and interaction tests using:

```bash
forge test
```

### 4. Deploy the Contract

Use Foundry's script functionality to deploy the smart contract:

```bash
forge script script/VotingSystem.s.sol:VotingSystemScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

Replace `<your_rpc_url>` and `<your_private_key>` with your RPC provider URL and your private key, respectively.

### 5. Local Development with Anvil

For local development, run **Anvil**, a local Ethereum node:

```bash
anvil
```

You can deploy and interact with the contract on the local network using Anvil.

### 6. Interacting with the Contract

Use **Cast** to interact with your smart contract:

```bash
cast send <contract_address> --rpc-url <your_rpc_url> --private-key <your_private_key> "<function_signature>"
```

Replace `<contract_address>` and `<function_signature>` with the relevant contract address and function you wish to interact with.

## Unit Testing

Foundry's **Forge** is used to run unit tests to ensure contract functionality. Test cases include:

- Adding candidates and voters.
- Casting votes and ensuring vote restrictions.
- Declaring the winning candidate.

Run tests with:

```bash
forge test
```

## Conclusion

This decentralized voting system ensures transparency, security, and fairness, ideal for various governance applications. With the use of **Foundry**, it provides a fast and modular development environment for Ethereum smart contracts.

