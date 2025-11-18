// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// --- CHAINLINK IMPORTS (UPGRADED) ---
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol"; // <-- NEW
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol"; // <-- NEW
// Note: We no longer need the 'interfaces' import, as 'VRFConsumerBaseV2Plus' handles the coordinator

import "./ServiceNFT.sol";

contract ServiceLottery is VRFConsumerBaseV2Plus { // <-- REMOVED OWNSABLE
    enum LotteryStatus { OPEN, CALCULATING_WINNER, CLOSED }

    struct Round {
        uint256 vrfRequestId;
        address winner;
        uint256 totalTicketsSold;
        LotteryStatus status;
    }

    // --- Lottery Config ---
    uint256 public ticketPrice;
    uint256 public maxTickets;
    uint256 public maxTicketsPerUser;
    uint256 public currentRoundId;

    // --- Contract References ---
    ServiceNFT public immutable serviceNFT;
    IERC20 public immutable usdcToken;

    // --- Participant Data (per round) ---
    mapping(uint256 => mapping(address => uint256)) public roundTicketsByHolder;
    mapping(uint256 => address[]) public roundTicketHolders;
    mapping(uint256 => Round) public rounds;
    mapping(uint256 => uint256) public vrfRequestToRound;

    // --- Chainlink VRF ---
    // VRF_COORDINATOR is now inherited from VRFConsumerBaseV2Plus
    uint256 public immutable s_subscriptionId; // <-- Correctly a uint256
    bytes32 immutable s_keyHash;
    uint32 immutable s_callbackGasLimit;

    // --- Metadata ---
    string public msaURI;

    // --- Events ---
    event TicketsPurchased(uint256 indexed roundId, address indexed buyer, uint256 amount);
    event WinnerRequested(uint256 indexed roundId, uint256 indexed vrfRequestId);
    event WinnerDrawn(uint256 indexed roundId, address indexed winner, uint256 indexed tokenId);
    event NewRoundStarted(uint256 indexed newRoundId);
    event TicketPriceChanged(uint256 newPrice);
    event MaxTicketsChanged(uint256 newMax);
    event MaxTicketsPerUserChanged(uint256 newLimit);

    constructor(
        address _nftAddress,
        address _usdcAddress,
        address _vrfCoordinator,
        uint256 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit
    ) // <-- REMOVED initialOwner
        VRFConsumerBaseV2Plus(_vrfCoordinator) // <-- NEW (V2Plus)
    { // <-- REMOVED Ownable(initialOwner)
        serviceNFT = ServiceNFT(_nftAddress);
        usdcToken = IERC20(_usdcAddress);

        s_subscriptionId = _subscriptionId;
        s_keyHash = _keyHash;
        s_callbackGasLimit = _callbackGasLimit;

        // Start Round 0
        rounds[0].status = LotteryStatus.OPEN;
    }

    function buyTickets(uint256 _amount) external {
        Round storage currentRound = rounds[currentRoundId];
        mapping(address => uint256) storage ticketsByHolder = roundTicketsByHolder[currentRoundId];

        // ... (Checks are unchanged) ...
        require(currentRound.status == LotteryStatus.OPEN, "Lottery is not open");
        require(_amount > 0, "Must buy at least one ticket");
        require(ticketsByHolder[msg.sender] + _amount <= maxTicketsPerUser, "Exceeds user ticket limit");
        require(currentRound.totalTicketsSold + _amount <= maxTickets, "Not enough tickets left");

        uint256 totalCost = ticketPrice * _amount;

        // ... (Effects are unchanged) ...
        ticketsByHolder[msg.sender] += _amount;
        address[] storage ticketHolders = roundTicketHolders[currentRoundId];
        for (uint256 i = 0; i < _amount; i++) {
            ticketHolders.push(msg.sender);
        }
        currentRound.totalTicketsSold += _amount;
        emit TicketsPurchased(currentRoundId, msg.sender, _amount);

        // ... (Interactions are unchanged) ...
        bool success = usdcToken.transferFrom(msg.sender, address(this), totalCost);
        require(success, "USDC transfer failed");

        if (currentRound.totalTicketsSold == maxTickets) {
            _requestWinner();
        }
    }

    function _requestWinner() internal {
        Round storage currentRound = rounds[currentRoundId];
        require(currentRound.status == LotteryStatus.OPEN, "Winner already requested");
        
        currentRound.status = LotteryStatus.CALCULATING_WINNER;

        // --- NEW VRF v2.5 Request Style ---
        VRFV2PlusClient.RandomWordsRequest memory request = VRFV2PlusClient.RandomWordsRequest({
            keyHash: s_keyHash,
            subId: s_subscriptionId, // <-- Now a uint256, will not error
            requestConfirmations: 3, // 3 confirmations
            callbackGasLimit: s_callbackGasLimit,
            numWords: 1, // 1 random word
            extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
        });
        
        uint256 requestId = s_vrfCoordinator.requestRandomWords(request);
        // --- End of New Style ---
        
        currentRound.vrfRequestId = requestId;
        vrfRequestToRound[requestId] = currentRoundId;

        emit WinnerRequested(currentRoundId, requestId);
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] calldata _randomWords) // <-- FIXED SIGNATURE (removed extraArgs)
        internal
        override
    {
        uint256 roundId = vrfRequestToRound[_requestId];
        Round storage round = rounds[roundId];
        address[] storage ticketHolders = roundTicketHolders[roundId];

        // This check is now handled by the V2Plus library
        // require(msg.sender == address(VRF_COORDINATOR), "Only VRF coordinator"); 
        require(round.status == LotteryStatus.CALCULATING_WINNER, "Lottery not in progress");

        uint256 winnerIndex = _randomWords[0] % round.totalTicketsSold;
        round.winner = ticketHolders[winnerIndex];
        round.status = LotteryStatus.CLOSED;

        // ... (Logic is unchanged) ...
        uint256 newTokenId = serviceNFT.awardToWinner(round.winner, msaURI);
        emit WinnerDrawn(roundId, round.winner, newTokenId);

        uint256 balance = usdcToken.balanceOf(address(this));
        usdcToken.transfer(owner(), balance);
    }

    // --- Admin & Getter Functions (All Unchanged) ---

    function startNewRound() external onlyOwner {
        require(rounds[currentRoundId].status == LotteryStatus.CLOSED, "Current round not finished");
        
        currentRoundId++;
        rounds[currentRoundId].status = LotteryStatus.OPEN;
        
        emit NewRoundStarted(currentRoundId);
    }

    function setMsaURI(string memory _uri) external onlyOwner {
        msaURI = _uri;
    }

    function setTicketPrice(uint256 _price) external onlyOwner {
        ticketPrice = _price;
        emit TicketPriceChanged(_price);
    }

    function setMaxTickets(uint256 _max) external onlyOwner {
        maxTickets = _max;
        emit MaxTicketsChanged(_max);
    }

    function setMaxTicketsPerUser(uint256 _limit) external onlyOwner {
        maxTicketsPerUser = _limit;
        emit MaxTicketsPerUserChanged(_limit);
    }

    function getTicketsByHolder(address _holder) public view returns (uint256) {
        return roundTicketsByHolder[currentRoundId][_holder];
    }
    
    function getTotalTicketsSold() public view returns (uint256) {
        return rounds[currentRoundId].totalTicketsSold;
    }

    function getLotteryStatus() public view returns (LotteryStatus) {
        return rounds[currentRoundId].status;
    }

    function getWinner(uint256 _roundId) public view returns (address) {
        return rounds[_roundId].winner;
    }
    function getMsaURI() public view returns (string memory) {
        return msaURI;
    }
    function getRoundInfo(uint256 roundId)
        external
        view
        returns (uint256 vrfRequestId, address winner, uint256 totalTicketsSold, LotteryStatus status)
    {
        Round storage round = rounds[roundId];
        return (round.vrfRequestId, round.winner, round.totalTicketsSold, round.status);
    }
}