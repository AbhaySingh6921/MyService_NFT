// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import {MockERC20} from "../test/mocks/MockERC20.sol";

contract DeployMockERC20 is Script {
    // ✅ Correct EIP-55 checksummed addresses
    address public constant ACCOUNT_1 = 0x588319EddCb889F47596DD9d8078c7FDef8bc7A2;
    address public constant ACCOUNT_2 = 0xcB73602bC16b4c3C40455957CB15bF7897F91bb2;
    address public constant ACCOUNT_3 = 0xf746B55d6c9B17A32F213ef346959249d68F2b67;

    function run() external {
        vm.startBroadcast();

        // ✅ Deploy mock USDC
        MockERC20 usdc = new MockERC20();


        // ✅ Mint 100,000 USDC (6 decimals)
        uint256 mintAmount = 100_000 * 1e6;

        usdc.mint(ACCOUNT_1, mintAmount);
        usdc.mint(ACCOUNT_2, mintAmount);
        usdc.mint(ACCOUNT_3, mintAmount);

        vm.stopBroadcast();
    }
}
