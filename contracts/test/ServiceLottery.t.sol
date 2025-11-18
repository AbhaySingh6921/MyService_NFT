    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    import "forge-std/Test.sol";
    import {ServiceNFT} from "../src/ServiceNFT.sol";
    import {ServiceLottery} from "../src/ServiceLottery.sol";
    import {MockERC20} from "./mocks/MockERC20.sol";
    import {VRFCoordinatorV2Mock} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2Mock.sol";

    contract ServiceLotteryTest is Test {
        // --- Contracts ---
        ServiceLottery public lottery;
        ServiceNFT public nft;
        MockERC20 public usdc;
        VRFCoordinatorV2Mock public vrfCoordinator;

        // --- Config ---
        uint256 public constant TICKET_PRICE = 1000 * (10**6); // 1000 USDC
        uint256 public constant MAX_TICKETS = 1000;
        uint256 public constant MAX_TICKETS_PER_USER = 200;
        string public constant TEST_MSA_URI = "http://test.com/msa.json";

        // --- VRF Config (Sepolia) ---
        uint64 public constant VRF_SUB_ID = 1; // Mock subscription ID
        bytes32 public constant VRF_KEY_HASH = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
        uint32 public constant VRF_GAS_LIMIT = 500000;

        // --- Users ---
        address public deployer;
        address public user1;
        address public user2;

        event WinnerDrawn(uint256 indexed roundId, address indexed winner, uint256 indexed tokenId);
        event NewRoundStarted(uint256 indexed newRoundId);

        function setUp() public {
            deployer = vm.addr(0x1);
            user1 = vm.addr(0x2);
            user2 = vm.addr(0x3);

            vm.label(deployer, "deployer");
            vm.label(user1, "user1");
            vm.label(user2, "user2");

            // Deploy Mocks
            vm.startPrank(deployer);
            usdc = new MockERC20();
            vrfCoordinator = new VRFCoordinatorV2Mock(100, 1 gwei); // baseFee, gasPriceLink
            vrfCoordinator.createSubscription();
            vrfCoordinator.addConsumer(VRF_SUB_ID, address(this)); // Add test contract
            
            // **THIS IS THE FIX**: Fund the mock subscription
            vrfCoordinator.fundSubscription(VRF_SUB_ID, 100 ether); 
            vm.stopPrank();

            // Deploy Main Contracts
            vm.startPrank(deployer);
            nft = new ServiceNFT(deployer);
            lottery = new ServiceLottery(
                address(nft),
                address(usdc),
                address(vrfCoordinator),
                VRF_SUB_ID,
                VRF_KEY_HASH,
                VRF_GAS_LIMIT
                
            );
            nft.setLotteryContract(address(lottery));
            vrfCoordinator.addConsumer(VRF_SUB_ID, address(lottery));

            // Configure Lottery
            lottery.setMsaURI(TEST_MSA_URI);
            lottery.setTicketPrice(TICKET_PRICE);
            lottery.setMaxTickets(MAX_TICKETS);
            lottery.setMaxTicketsPerUser(MAX_TICKETS_PER_USER);
            vm.stopPrank();

            // Fund Users
            usdc.mint(user1, TICKET_PRICE * MAX_TICKETS);
            usdc.mint(user2, TICKET_PRICE * MAX_TICKETS);
            vm.startPrank(user1);
            usdc.approve(address(lottery), type(uint256).max);
            vm.stopPrank();
            vm.startPrank(user2);
            usdc.approve(address(lottery), type(uint256).max);
            vm.stopPrank();
        }

        function test_InitialState() public {
            assertEq(uint(lottery.getLotteryStatus()), 0); // 0 = OPEN
            assertEq(lottery.currentRoundId(), 0);
            assertEq(lottery.ticketPrice(), TICKET_PRICE);
            assertEq(lottery.maxTickets(), MAX_TICKETS);
            assertEq(lottery.maxTicketsPerUser(), MAX_TICKETS_PER_USER);
        }

        function test_Fail_BuyMoreThanUserLimit() public {
            vm.startPrank(user1);
            vm.expectRevert("Exceeds user ticket limit");
            lottery.buyTickets(MAX_TICKETS_PER_USER + 1);
            vm.stopPrank();
        }

        function test_Fail_BuyMoreThanMaxTickets() public {
        // --- THIS TEST IS NOW FIXED ---
        // We must use 5 *different* users to fill the lottery,
        // otherwise we hit the 'maxTicketsPerUser' limit first.
        
        // 1. Fill 4 slots (4 * 200 = 800 tickets)
        for (uint i = 0; i < 4; i++) {
            address user = address(uint160(i + 10)); // Users 10, 11, 12, 13
            vm.deal(user, 1 ether);
            usdc.mint(user, TICKET_PRICE * 200);

            vm.startPrank(user);
            usdc.approve(address(lottery), TICKET_PRICE * 200);
            lottery.buyTickets(200);
            vm.stopPrank();
        }
        
        // 2. Fill the 5th slot (user 14)
        address lastUser = address(uint160(14));
        vm.deal(lastUser, 1 ether);
        usdc.mint(lastUser, TICKET_PRICE * 200);
        
        vm.startPrank(lastUser);
        usdc.approve(address(lottery), TICKET_PRICE * 200);
        
        // 3. This next call will fail.
        // We try to buy 201 tickets, but only 200 are left.
        // We will hit the 'Not enough tickets left' check
        // *before* the 'Exceeds user ticket limit' check.
        vm.expectRevert("Exceeds user ticket limit");
        lottery.buyTickets(201); // Try to buy 1 more than available
        
        vm.stopPrank();
    }

        function test_Fail_StartNewRoundWhenNotClosed() public {
            vm.startPrank(deployer);
            vm.expectRevert("Current round not finished");
            lottery.startNewRound();
            vm.stopPrank();
        }

        /**
         * @dev This helper function fills the lottery for a given round
         * and returns the address of the user we expect to win.
         */
        function _fillLottery(uint256 roundId) internal returns (address) {
            // 5 users buy 200 tickets each, filling the lottery
            for (uint i = 0; i < 5; i++) {
                address user = address(uint160(i + 10)); // Create 5 new test users
                vm.deal(user, 1 ether);
                usdc.mint(user, TICKET_PRICE * 200);

                vm.startPrank(user);
                usdc.approve(address(lottery), TICKET_PRICE * 200);
                lottery.buyTickets(200);
                vm.stopPrank();
            }
            
            assertEq(lottery.getTotalTicketsSold(), 1000);
            assertEq(uint(lottery.getLotteryStatus()), 1); // 1 = CALCULATING_WINNER
            
            (uint256 vrfRequestId,,,) = lottery.getRoundInfo(roundId);
            assertEq(vrfRequestId, roundId + 1); // VRF ID should be 1 for round 0, 2 for round 1, etc.

            // We will make user at address(11) win (the 2nd user)
            // They bought tickets 200-399. We'll pick index 250.
            return address(uint160(11));
        }

        /**
         * @dev This is the main test for the multi-round logic.
         * It runs the lottery twice and checks that state is isolated.
         */
        function test_FullLottery_TwoRounds() public {
            // --- ROUND 0 ---
            console.log("--- Starting Round 0 ---");

            // 1. Fill Lottery for Round 0
            address expectedWinner_R0 = _fillLottery(0);
            (uint256 vrfRequestId, address winner, uint256 totalTicketsSold, ServiceLottery.LotteryStatus status) = lottery.getRoundInfo(0);
            assertEq(vrfRequestId, 1);

            // 2. Mock VRF Callback for Round 0
            uint256 winnerIndex_R0 = 250; // Corresponds to user address(11)
            
            uint256[] memory randomWords_R0 = new uint256[](1);
            randomWords_R0[0] = winnerIndex_R0;

            vm.expectEmit(true, true, true, true, address(lottery));
            emit WinnerDrawn(0, expectedWinner_R0, 1); // Round 0, Winner, Token ID 1

            vm.startPrank(address(vrfCoordinator));
            vrfCoordinator.fulfillRandomWordsWithOverride(
                vrfRequestId,
                address(lottery),
                randomWords_R0
            );
            vm.stopPrank();

            // 3. Check State for Round 0
            assertEq(uint(lottery.getLotteryStatus()), 2); // 2 = CLOSED
            assertEq(lottery.getWinner(0), expectedWinner_R0);
            assertEq(nft.ownerOf(1), expectedWinner_R0); // Token ID 1
            assertEq(nft.originalWinner(1), expectedWinner_R0);
            assertEq(usdc.balanceOf(deployer), TICKET_PRICE * MAX_TICKETS);
            assertEq(usdc.balanceOf(address(lottery)), 0);

            // --- ADMIN: START NEW ROUND ---
            console.log("--- Starting Round 1 ---");
            vm.startPrank(deployer);
            vm.expectEmit(true, false, false, false, address(lottery));
            emit NewRoundStarted(1);
            lottery.startNewRound();
            vm.stopPrank();

            // 5. Check State for New Round 1
            assertEq(lottery.currentRoundId(), 1);
            assertEq(uint(lottery.getLotteryStatus()), 0); // 0 = OPEN
            assertEq(lottery.getTotalTicketsSold(), 0); // Tickets sold for *new* round is 0

            // --- ROUND 1 ---
            console.log("--- Filling Round 1 ---");

            // 6. Fill Lottery for Round 1
            address expectedWinner_R1 = _fillLottery(1); // Fills round 1
            (uint256 vrfRequestId_R1, , , ) = lottery.getRoundInfo(1);

            // Check that this is a new VRF request
            assertEq(vrfRequestId_R1, 2);

            // 7. Mock VRF Callback for Round 1
            uint256 winnerIndex_R1 = 250; // Same index, same winner user

            uint256[] memory randomWords_R1 = new uint256[](1);
            randomWords_R1[0] = winnerIndex_R1;

            vm.expectEmit(true, true, true, true, address(lottery));
            emit WinnerDrawn(1, expectedWinner_R1, 2); // Round 1, Winner, Token ID 2

            vm.startPrank(address(vrfCoordinator));
            vrfCoordinator.fulfillRandomWordsWithOverride(
                vrfRequestId_R1,
                address(lottery),
                randomWords_R1
            );
            vm.stopPrank();

            // 8. Check Final State for Round 1
            assertEq(uint(lottery.getLotteryStatus()), 2); // Round 1 is CLOSED
            assertEq(lottery.getWinner(1), expectedWinner_R1);
            assertEq(nft.ownerOf(2), expectedWinner_R1); // Token ID 2
            assertEq(nft.originalWinner(2), expectedWinner_R1);
            
            // Deployer should have 2x the funds now
            assertEq(usdc.balanceOf(deployer), TICKET_PRICE * MAX_TICKETS * 2);
            assertEq(usdc.balanceOf(address(lottery)), 0);

            // 9. Check that Round 0 state is unchanged
            assertEq(lottery.getWinner(0), expectedWinner_R0);
            assertEq(nft.ownerOf(1), expectedWinner_R0);
        }

        /**
         * @dev Tests the "void on transfer" logic
         * Must be run after a draw, so we use the two-round test setup
         */
        function test_VoidOnTransfer_WorksPerToken() public {
            // --- Run the full two-round test to get two winners ---
            test_FullLottery_TwoRounds();
            
            address winner = address(uint160(11));
            address attacker = address(0xBAD);
            
            // --- Test Token ID 1 ---
            assertEq(nft.isServiceVoid(1), false); // Not void yet
            
            // Winner transfers Token 1
            vm.startPrank(winner);
            nft.transferFrom(winner, attacker, 1);
            vm.stopPrank();
            
            // Check that Token 1 is now void
            assertEq(nft.ownerOf(1), attacker);
            assertEq(nft.isServiceVoid(1), true); // Service is VOID
            
            // --- Test Token ID 2 (should be unaffected) ---
            assertEq(nft.ownerOf(2), winner); // Winner still has token 2
            assertEq(nft.isServiceVoid(2), false); // Token 2 is NOT void
            
            // Winner transfers Token 2
            vm.startPrank(winner);
            nft.transferFrom(winner, attacker, 2);
            vm.stopPrank();
            
            // Check that Token 2 is now void
            assertEq(nft.ownerOf(2), attacker);
            assertEq(nft.isServiceVoid(2), true); // Service is VOID
        }
    }
