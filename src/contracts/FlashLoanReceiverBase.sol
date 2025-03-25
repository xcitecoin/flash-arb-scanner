
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { ILendingPool } from "./ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "./ILendingPoolAddressesProvider.sol";
import { IERC20 } from "./IERC20.sol";

abstract contract FlashLoanReceiverBase {
    ILendingPoolAddressesProvider public immutable ADDRESSES_PROVIDER;
    ILendingPool public immutable LENDING_POOL;

    constructor(ILendingPoolAddressesProvider provider) {
        ADDRESSES_PROVIDER = provider;
        LENDING_POOL = ILendingPool(provider.getLendingPool());
    }

    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external virtual returns (bool);
}
