// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IRouter} from "onlyswaps-solidity/src/interfaces/IRouter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Contract for initiating cross-chain token swaps
contract CrossChainSwapper {
    // OnlySwaps router interface
    IRouter public immutable router;
    
    // Event emitted when a swap is initiated
    event SwapInitiated(
        bytes32 indexed requestId,
        address indexed initiator,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 solverFee,
        uint256 destinationChainId,
        address recipient
    );
    
    // Constructor sets the router address
    constructor(address _routerAddress) {
        require(_routerAddress != address(0), "Invalid router address");
        router = IRouter(_routerAddress);
    }
    
    // Initiates a cross-chain swap request
    function initiateSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 solverFee,
        uint256 destinationChainId,
        address recipient
    ) external returns (bytes32 requestId) {
        require(amountIn > 0, "Amount must be greater than zero");
        require(solverFee > 0, "Solver fee must be greater than zero");
        require(recipient != address(0), "Invalid recipient address");
        require(destinationChainId != block.chainid, "Cannot swap to same chain");
        
        // Calculate total amount including solver fee
        uint256 totalAmount = amountIn + solverFee;
        
        require(
            IERC20(tokenIn).transferFrom(msg.sender, address(this), totalAmount),
            "Transfer failed - check allowance"
        );
        
        // Approve router to spend tokens
        require(
            IERC20(tokenIn).approve(address(router), totalAmount),
            "Approval failed"
        );
        
        // Request the cross-chain swap through the router
        requestId = router.requestCrossChainSwap(
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            solverFee,
            destinationChainId,
            recipient
        );
        
        // Emit event with swap details
        emit SwapInitiated(
            requestId,
            msg.sender,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            solverFee,
            destinationChainId,
            recipient
        );
        
        return requestId;
    }
    
    // Returns the full swap request details
    function getSwapStatus(bytes32 requestId) 
        external 
        view 
        returns (IRouter.SwapRequestParametersWithHooks memory params) 
    {
        params = router.getSwapRequestParameters(requestId);
        return params;
    }
    
    // Checks if a swap has been executed
    function isSwapExecuted(bytes32 requestId) external view returns (bool executed) {
        IRouter.SwapRequestParametersWithHooks memory params = router.getSwapRequestParameters(requestId);
        return params.executed;
    }
}