// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./ZombieOwnership.sol";

contract CryptoZombies is ZombieOwnership {
  function kill() public onlyOwner {
    selfdestruct(payable(owner()));
  }
}
