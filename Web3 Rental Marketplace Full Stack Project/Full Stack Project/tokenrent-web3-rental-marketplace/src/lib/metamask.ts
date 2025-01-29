import {ethers} from "ethers";
 
const connectWallet = async (walletType = "metamask") => {
        try{
            
            if (typeof window.ethereum  == 'undefined'){
                if (walletType == "metamask"){
                    window.open('https://metamask.io/download/', '_blank');
                    throw new Error("Please Install MetaMask");

                }
            }

            // create provider here
            // const provider = new ethers.BrowserProvider(window.ethereum);
            const provider = new ethers.BrowserProvider(
                window.ethereum as ethers.Eip1193Provider
              );
            const accounts = await provider.send("eth_requestAccounts",[]);

            if (accounts.length === 0){
                throw new Error("No Account Found");
            }

                  // Store address in localStorage and stat
        }
        catch(err){
            console.error("wallet connection failed: ", err);
            throw Error ("wallet connection failed");
        }

    };

export default connectWallet;