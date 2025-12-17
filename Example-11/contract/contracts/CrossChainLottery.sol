// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {RandomnessReceiverBase} from "randomness-solidity/src/RandomnessReceiverBase.sol";
import {IRouter} from "onlyswaps-solidity/src/interfaces/IRouter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CrossChainLottery is RandomnessReceiverBase, ReentrancyGuard {
    
    IRouter public immutable router;
    IERC20 public immutable prizeToken;
    
    uint256 public lotteryId;
    uint256 public entryFee;
    uint256 public prizePool;
    
    enum LotteryState { OPEN, DRAWING, CLOSED }
    
    struct Lottery {
        uint256 id;
        uint256 prizePool;
        uint256 entryFee;
        uint256 startTime;
        uint256 endTime;
        address[] participants;
        address winner;
        uint256 randomnessRequestId;
        bytes32 randomValue;
        LotteryState state;
        bool prizeClaimed;
    }
    
    struct WinnerPayout {
        address winner;
        uint256 amount;
        uint256 destinationChainId;
        address destinationToken;
        bytes32 swapRequestId;
        bool completed;
    }
    
    mapping(uint256 => Lottery) public lotteries;
    mapping(uint256 => WinnerPayout) public payouts;
    mapping(uint256 => uint256) public randomnessRequestToLottery;
    mapping(address => uint256[]) public userLotteries;
    
    // ============ Events ============
    
    event LotteryCreated(
        uint256 indexed lotteryId,
        uint256 entryFee,
        uint256 startTime,
        uint256 endTime
    );
    
    event EntryPurchased(
        uint256 indexed lotteryId,
        address indexed participant,
        uint256 entriesCount
    );
    
    event RandomnessRequested(
        uint256 indexed lotteryId,
        uint256 indexed requestId
    );
    
    event WinnerSelected(
        uint256 indexed lotteryId,
        address indexed winner,
        uint256 prizeAmount
    );
    
    event CrossChainPayoutInitiated(
        uint256 indexed lotteryId,
        address indexed winner,
        uint256 amount,
        uint256 destinationChainId,
        bytes32 swapRequestId
    );
    
    event PrizeClaimed(
        uint256 indexed lotteryId,
        address indexed winner,
        uint256 amount
    );
    
    // ============ Errors ============
    
    error LotteryNotOpen();
    error LotteryNotEnded();
    error LotteryAlreadyDrawn();
    error InvalidEntryFee();
    error NoParticipants();
    error NotWinner();
    error PrizeAlreadyClaimed();
    error InsufficientAllowance();
    error TransferFailed();
    
    // ============ Constructor ============
    
    constructor(
        address _randomnessSender,
        address _owner,
        address _router,
        address _prizeToken,
        uint256 _entryFee
    ) RandomnessReceiverBase(_randomnessSender, _owner) {
        router = IRouter(_router);
        prizeToken = IERC20(_prizeToken);
        entryFee = _entryFee;
    }
    
    // ============ Lottery Management ============
    

    function createLottery(
        uint256 _entryFee,
        uint256 _duration
    ) external onlyOwner returns (uint256) {
        require(_entryFee > 0, "Entry fee must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        lotteryId++;
        
        Lottery storage lottery = lotteries[lotteryId];
        lottery.id = lotteryId;
        lottery.entryFee = _entryFee;
        lottery.startTime = block.timestamp;
        lottery.endTime = block.timestamp + _duration;
        lottery.state = LotteryState.OPEN;
        
        emit LotteryCreated(lotteryId, _entryFee, lottery.startTime, lottery.endTime);
        
        return lotteryId;
    }
    

    function enterLottery(uint256 _lotteryId, uint256 _entries) external nonReentrant {
        Lottery storage lottery = lotteries[_lotteryId];
        
        require(lottery.state == LotteryState.OPEN, "Lottery not open");
        require(block.timestamp < lottery.endTime, "Lottery ended");
        
        uint256 totalCost = lottery.entryFee * _entries;
        
        require(prizeToken.transferFrom(msg.sender, address(this), totalCost), "Transfer failed");
        
        for (uint256 i = 0; i < _entries; i++) {
            lottery.participants.push(msg.sender);
        }
        
        lottery.prizePool += totalCost;
        userLotteries[msg.sender].push(_lotteryId);
        
        emit EntryPurchased(_lotteryId, msg.sender, _entries);
    }
    
    /**
     * @notice Draw the lottery winner using randomness
     * @param _lotteryId ID of the lottery to draw
     * @param callbackGasLimit Gas limit for the randomness callback
     */
    function drawWinner(
        uint256 _lotteryId,
        uint32 callbackGasLimit
    ) external payable nonReentrant returns (uint256 requestId) {
        Lottery storage lottery = lotteries[_lotteryId];
        
        require(lottery.state == LotteryState.OPEN, "Already drawn");
        require(block.timestamp >= lottery.endTime, "Lottery not ended");
        require(lottery.participants.length > 0, "No participants");
        
        lottery.state = LotteryState.DRAWING;
        
        (requestId, ) = _requestRandomnessPayInNative(callbackGasLimit);
        
        lottery.randomnessRequestId = requestId;
        randomnessRequestToLottery[requestId] = _lotteryId;
        
        emit RandomnessRequested(_lotteryId, requestId);
        
        return requestId;
    }
    
    /**
     * @notice Callback function called by dcipher network with randomness
     * @param requestId The randomness request ID
     * @param randomness The random value
     */
    function onRandomnessReceived(
        uint256 requestId,
        bytes32 randomness
    ) internal override {
        uint256 _lotteryId = randomnessRequestToLottery[requestId];
        Lottery storage lottery = lotteries[_lotteryId];
        
        require(lottery.randomnessRequestId == requestId, "Invalid request ID");
        
        lottery.randomValue = randomness;
        
        uint256 winnerIndex = uint256(randomness) % lottery.participants.length;
        lottery.winner = lottery.participants[winnerIndex];
        lottery.state = LotteryState.CLOSED;
        
        emit WinnerSelected(_lotteryId, lottery.winner, lottery.prizePool);
    }
    
    // ============ Prize Distribution ============
    
    /**
     * @notice Claim prize on the same chain
     * @param _lotteryId ID of the lottery
     */
    function claimPrize(uint256 _lotteryId) external nonReentrant {
        Lottery storage lottery = lotteries[_lotteryId];
        
        require(lottery.state == LotteryState.CLOSED, "Lottery not closed");
        require(lottery.winner == msg.sender, "Not winner");
        require(!lottery.prizeClaimed, "Already claimed");
        
        lottery.prizeClaimed = true;
        
        require(prizeToken.transfer(lottery.winner, lottery.prizePool), "Transfer failed");
        
        emit PrizeClaimed(_lotteryId, lottery.winner, lottery.prizePool);
    }
    
    /**
     * @notice Claim prize on a different chain using onlyswaps
     * @param _lotteryId ID of the lottery
     * @param destinationChainId Chain ID where winner wants prize
     * @param destinationToken Token address on destination chain
     * @param solverFee Fee for the solver
     */
    function claimPrizeCrossChain(
        uint256 _lotteryId,
        uint256 destinationChainId,
        address destinationToken,
        uint256 solverFee
    ) external nonReentrant returns (bytes32 swapRequestId) {
        Lottery storage lottery = lotteries[_lotteryId];
        
        require(lottery.state == LotteryState.CLOSED, "Lottery not closed");
        require(lottery.winner == msg.sender, "Not winner");
        require(!lottery.prizeClaimed, "Already claimed");
        
        lottery.prizeClaimed = true;
        
        uint256 prizeAmount = lottery.prizePool;
        require(prizeAmount > solverFee, "Prize too small");
        
        uint256 amountIn = prizeAmount - solverFee;
        uint256 amountOut = amountIn;
        
        prizeToken.approve(address(router), prizeAmount);
        
        swapRequestId = router.requestCrossChainSwap(
            address(prizeToken),
            destinationToken,
            amountIn,
            amountOut,
            solverFee,
            destinationChainId,
            lottery.winner
        );
        
        payouts[_lotteryId] = WinnerPayout({
            winner: lottery.winner,
            amount: amountIn,
            destinationChainId: destinationChainId,
            destinationToken: destinationToken,
            swapRequestId: swapRequestId,
            completed: false
        });
        
        emit CrossChainPayoutInitiated(
            _lotteryId,
            lottery.winner,
            amountIn,
            destinationChainId,
            swapRequestId
        );
        
        return swapRequestId;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get lottery details
     */
    function getLottery(uint256 _lotteryId) external view returns (
        uint256 id,
        uint256 _prizePool,
        uint256 _entryFee,
        uint256 startTime,
        uint256 endTime,
        uint256 participantCount,
        address winner,
        LotteryState state,
        bool prizeClaimed
    ) {
        Lottery storage lottery = lotteries[_lotteryId];
        return (
            lottery.id,
            lottery.prizePool,
            lottery.entryFee,
            lottery.startTime,
            lottery.endTime,
            lottery.participants.length,
            lottery.winner,
            lottery.state,
            lottery.prizeClaimed
        );
    }
    
    /**
     * @notice Get all participants in a lottery
     */
    function getParticipants(uint256 _lotteryId) external view returns (address[] memory) {
        return lotteries[_lotteryId].participants;
    }
    
    /**
     * @notice Get user's entry count in a lottery
     */
    function getUserEntryCount(uint256 _lotteryId, address user) external view returns (uint256) {
        address[] memory participants = lotteries[_lotteryId].participants;
        uint256 count = 0;
        
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == user) {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * @notice Get all lotteries a user has participated in
     */
    function getUserLotteries(address user) external view returns (uint256[] memory) {
        return userLotteries[user];
    }
    
    /**
     * @notice Check if lottery can be drawn
     */
    function canDraw(uint256 _lotteryId) external view returns (bool) {
        Lottery storage lottery = lotteries[_lotteryId];
        return lottery.state == LotteryState.OPEN 
            && block.timestamp >= lottery.endTime 
            && lottery.participants.length > 0;
    }
    
    /**
     * @notice Get payout information
     */
    function getPayout(uint256 _lotteryId) external view returns (WinnerPayout memory) {
        return payouts[_lotteryId];
    }
    
    /**
     * @notice Get the current active lottery ID (0 if no lottery created yet)
     */
    function getCurrentLotteryId() external view returns (uint256) {
        return lotteryId;
    }
    
    /**
     * @notice Check if there's an active lottery
     */
    function hasActiveLottery() external view returns (bool) {
        if (lotteryId == 0) return false;
        Lottery storage lottery = lotteries[lotteryId];
        return lottery.state == LotteryState.OPEN;
    }
}
