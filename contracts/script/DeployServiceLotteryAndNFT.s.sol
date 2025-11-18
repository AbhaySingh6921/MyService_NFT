// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import {ServiceNFT} from "../src/ServiceNFT.sol";

// ---------- CHANGED ----------
// Use the VRF v2.5 Plus version of the Lottery
import {ServiceLottery} from "../src/ServiceLottery.sol";

contract DeployServiceLotteryAndNFT is Script {
    string public constant DEFAULT_MSA_URI =
        "https://ipfs.io/ipfs/bafkreiawmdjrbdaatd7mrdqkeccr4xquoxrv2fc4s2jmbosnbrusta4ggi";

    // SEPOLIA configuration
    address public constant VRF_COORDINATOR = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
    bytes32 public constant KEY_HASH = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    
    // ---------- CHANGED ---------- 
    // Keep subscription ID as uint256 (big number)
    uint256 public constant SUBSCRIPTION_ID = 1289661907908714582770580581866198206919112455439735392798016103768008464132;

    address public constant USDC_ADDRESS = 0x4f9fA9c1C9d66E5BAf565c239e3B96B4D8E3f43a; 
    uint32 public constant CALLBACK_GAS_LIMIT = 500000;

    function run() external returns (address, address) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 1️⃣ Deploy NFT contract
        ServiceNFT nft = new ServiceNFT(deployer);
        console.log(" ServiceNFT deployed to:", address(nft));

        // 2️⃣ Deploy Lottery contract (Plus version)
        ServiceLottery lottery = new ServiceLottery(
            address(nft),
            USDC_ADDRESS,
            VRF_COORDINATOR,
            SUBSCRIPTION_ID, // ---------- CHANGED: big uint256 ID
            KEY_HASH,
            CALLBACK_GAS_LIMIT
            
        );
        console.log(" ServiceLotteryPlus deployed to:", address(lottery));

        // 3️⃣ Post-deployment setup
        nft.setLotteryContract(address(lottery));
        console.log(" Linked NFT to Lottery");

        // 4️⃣ Configure lottery parameters
        lottery.setMsaURI(DEFAULT_MSA_URI);
        lottery.setTicketPrice(1000 * (10 ** 6)); // 1000 USDC
        lottery.setMaxTickets(3);
        lottery.setMaxTicketsPerUser(2);

        console.log(" Ticket price and limits set");
        console.log(" Default MSA URI set");

        vm.stopBroadcast();

        return (address(nft), address(lottery));
    }
}
