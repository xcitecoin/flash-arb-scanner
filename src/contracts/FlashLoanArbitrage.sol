
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// Import interfaces for Aave and DEX interaction
import { FlashLoanReceiverBase } from "./FlashLoanReceiverBase.sol";
import { ILendingPool } from "./ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "./ILendingPoolAddressesProvider.sol";
import { IERC20 } from "./IERC20.sol";
import { IUniswapV2Router02 } from "./IUniswapV2Router02.sol";

/**
 * @title FlashLoanArbitrage
 * @notice Contract for executing arbitrage opportunities using flash loans
 * @dev This contract implements Aave's flash loan functionality
 */
contract FlashLoanArbitrage is FlashLoanReceiverBase {
    address public owner;
    
    // Events
    event ArbitrageExecuted(address tokenBorrowed, uint256 amount, uint256 profit);
    event WithdrawToken(address token, uint256 amount);
    
    // Constructor
    constructor(ILendingPoolAddressesProvider _provider) FlashLoanReceiverBase(_provider) {
        owner = msg.sender;
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @notice Execute a flash loan with arbitrage
     * @param asset The address of the asset to borrow
     * @param amount The amount to borrow
     * @param params Encoded parameters for the arbitrage route
     */
    function executeFlashLoan(
        address asset,
        uint256 amount,
        bytes calldata params
    ) external onlyOwner {
        address[] memory assets = new address[](1);
        assets[0] = asset;
        
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        
        // 0 = no debt, 1 = stable, 2 = variable
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;
        
        // Pass the parameters for the executeOperation function
        LENDING_POOL.flashLoan(
            address(this),
            assets,
            amounts,
            modes,
            address(this),
            params,
            0
        );
    }
    
    /**
     * @notice This function is called after this contract receives the flash loaned amount
     * @param assets The addresses of the assets being flash-borrowed
     * @param amounts The amounts of the assets being flash-borrowed
     * @param premiums The premiums (fees) for each borrowed asset
     * @param initiator The address initiating the flash loan
     * @param params Encoded parameters for the arbitrage route
     * @return A boolean value indicating whether the operation was successful
     */
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(initiator == address(this), "FlashLoan not initiated by this contract");
        require(amounts.length == 1, "Invalid flash loan parameters");
        
        // Decode the parameters for the arbitrage
        (
            address sourceRouter,
            address targetRouter,
            address[] memory path
        ) = abi.decode(params, (address, address, address[]));
        
        // Ensure we have at least a token pair
        require(path.length >= 2, "Invalid token path");
        
        // Token we're operating with
        address token = assets[0];
        uint256 amount = amounts[0];
        uint256 fee = premiums[0];
        uint256 amountToRepay = amount + fee;
        
        // Approve source router to spend the borrowed tokens
        IERC20(token).approve(sourceRouter, amount);
        
        // Get initial state of the path end token
        uint256 initialBalance = IERC20(path[path.length - 1]).balanceOf(address(this));
        
        // Execute the first trade on source DEX
        IUniswapV2Router02(sourceRouter).swapExactTokensForTokens(
            amount,
            0, // Accept any amount
            path,
            address(this),
            block.timestamp + 300
        );
        
        // For the second trade, we need to swap back
        address[] memory reversePath = new address[](path.length);
        for (uint i = 0; i < path.length; i++) {
            reversePath[i] = path[path.length - 1 - i];
        }
        
        // Get balance of the path end token after the first swap
        uint256 intermediateBalance = IERC20(reversePath[0]).balanceOf(address(this));
        
        // Approve target router to spend the tokens received from first swap
        IERC20(reversePath[0]).approve(targetRouter, intermediateBalance);
        
        // Execute the second trade on target DEX
        IUniswapV2Router02(targetRouter).swapExactTokensForTokens(
            intermediateBalance,
            0, // Accept any amount
            reversePath,
            address(this),
            block.timestamp + 300
        );
        
        // Get final balance of the original token
        uint256 finalBalance = IERC20(token).balanceOf(address(this));
        
        // Ensure we have enough to repay the flash loan plus fees
        require(finalBalance >= amountToRepay, "Not enough funds to repay flash loan");
        
        // Calculate profit
        uint256 profit = finalBalance - amountToRepay;
        
        // Approve LendingPool to pull flash loan amount + premium
        IERC20(token).approve(address(LENDING_POOL), amountToRepay);
        
        // Emit event with profit information
        emit ArbitrageExecuted(token, amount, profit);
        
        return true;
    }
    
    /**
     * @notice Withdraw tokens from the contract
     * @param token The address of the token to withdraw
     * @param amount The amount to withdraw (0 for all)
     */
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        uint256 tokenBalance = IERC20(token).balanceOf(address(this));
        uint256 amountToWithdraw = amount == 0 ? tokenBalance : amount;
        
        require(amountToWithdraw <= tokenBalance, "Not enough balance");
        
        IERC20(token).transfer(owner, amountToWithdraw);
        emit WithdrawToken(token, amountToWithdraw);
    }
    
    /**
     * @notice Withdraw ETH from the contract
     * @param amount The amount to withdraw (0 for all)
     */
    function withdrawETH(uint256 amount) external onlyOwner {
        uint256 ethBalance = address(this).balance;
        uint256 amountToWithdraw = amount == 0 ? ethBalance : amount;
        
        require(amountToWithdraw <= ethBalance, "Not enough balance");
        
        (bool success, ) = payable(owner).call{value: amountToWithdraw}("");
        require(success, "ETH transfer failed");
    }
    
    // Allow the contract to receive ETH
    receive() external payable {}
}
