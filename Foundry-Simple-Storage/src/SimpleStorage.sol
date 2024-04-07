// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

contract SimpleStorage {
    uint256 public numbers;

    mapping(string => uint256) public nameToNumbers;

    struct People {
        uint256 numbers;
        string name;
    }

    struct UniqueNumber {
        uint256 uniqueNum;
    }

    function store(uint256 newNumbers) public virtual {
        numbers = newNumbers;
    }

    UniqueNumber[] public uniqueNumbers;

    People[] public people;

    function reterive() public view returns (uint256) {
        return numbers;
    }

    function addPerson(string memory _name, uint256 _numbers) public virtual {
        people.push(People(_numbers, _name));
        nameToNumbers[_name] = _numbers;
    }

    function addUniqueNumbers(uint256 newNums) public {
        uniqueNumbers.push(UniqueNumber(newNums));
    }
}
