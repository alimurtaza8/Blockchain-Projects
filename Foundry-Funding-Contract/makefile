-include .env
s :; forge test

deploy-sepolia:
	forge script script/DeployFundingContract.s.sol --rpc-url $(SEPOLIA_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv



