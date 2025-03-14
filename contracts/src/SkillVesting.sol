// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface ISwitchboardOracle {
    function latestResult() external view returns (int256);
}

/**
 * @title SkillVesting
 * @dev Contract for vesting tokens based on social metrics tracked by oracles
 */
contract SkillVesting is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _vestingIdCounter;
    
    struct Milestone {
        uint256 threshold;
        uint256 unlockPercentage; // in basis points (1/100 of a percent) - 10000 = 100%
        bool reached;
    }
    
    struct VestingSchedule {
        address creator;
        address tokenAddress;
        uint256 totalAmount;
        uint256 unlockedAmount;
        address oracleAddress; // Switchboard oracle address
        string metricType; // e.g., "followers", "views"
        Milestone[] milestones;
        bool active;
    }
    
    // Mapping from vesting ID to vesting schedule
    mapping(uint256 => VestingSchedule) public vestingSchedules;
    // Mapping from creator to their vesting IDs
    mapping(address => uint256[]) public creatorVestings;
    
    event VestingCreated(uint256 indexed vestingId, address creator, address tokenAddress, uint256 totalAmount);
    event MilestoneReached(uint256 indexed vestingId, uint256 milestoneIndex, uint256 unlockedAmount);
    event TokensWithdrawn(uint256 indexed vestingId, address creator, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    function createVesting(
        address tokenAddress,
        uint256 amount,
        address oracleAddress,
        string memory metricType,
        uint256[] memory thresholds,
        uint256[] memory unlockPercentages
    ) external returns (uint256) {
        require(thresholds.length == unlockPercentages.length, "Arrays must be same length");
        require(thresholds.length > 0, "Must have at least one milestone");
        
        // Transfer tokens to contract
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        
        // Create milestones
        Milestone[] memory milestones = new Milestone[](thresholds.length);
        uint256 totalPercentage = 0;
        
        for (uint256 i = 0; i < thresholds.length; i++) {
            milestones[i] = Milestone({
                threshold: thresholds[i],
                unlockPercentage: unlockPercentages[i],
                reached: false
            });
            
            totalPercentage += unlockPercentages[i];
        }
        
        require(totalPercentage <= 10000, "Total percentage cannot exceed 100%");
        
        // Create vesting schedule
        _vestingIdCounter.increment();
        uint256 vestingId = _vestingIdCounter.current();
        
        vestingSchedules[vestingId] = VestingSchedule({
            creator: msg.sender,
            tokenAddress: tokenAddress,
            totalAmount: amount,
            unlockedAmount: 0,
            oracleAddress: oracleAddress,
            metricType: metricType,
            milestones: milestones,
            active: true
        });
        
        // Add to creator's vestings
        creatorVestings[msg.sender].push(vestingId);
        
        emit VestingCreated(vestingId, msg.sender, tokenAddress, amount);
        
        return vestingId;
    }
    
    function checkMilestones(uint256 vestingId) public returns (bool) {
        VestingSchedule storage schedule = vestingSchedules[vestingId];
        require(schedule.active, "Vesting schedule not active");
        
        // Get current metric value from oracle
        int256 currentValue = ISwitchboardOracle(schedule.oracleAddress).latestResult();
        require(currentValue >= 0, "Oracle returned negative value");
        uint256 metricValue = uint256(currentValue);
        
        bool newMilestoneReached = false;
        
        // Check each milestone
        for (uint256 i = 0; i < schedule.milestones.length; i++) {
            Milestone storage milestone = schedule.milestones[i];
            
            if (!milestone.reached && metricValue >= milestone.threshold) {
                milestone.reached = true;
                
                // Calculate tokens to unlock
                uint256 unlockAmount = (schedule.totalAmount * milestone.unlockPercentage) / 10000;
                schedule.unlockedAmount += unlockAmount;
                
                emit MilestoneReached(vestingId, i, unlockAmount);
                newMilestoneReached = true;
            }
        }
        
        return newMilestoneReached;
    }
    
    function withdrawUnlocked(uint256 vestingId) external {
        VestingSchedule storage schedule = vestingSchedules[vestingId];
        require(msg.sender == schedule.creator, "Only creator can withdraw");
        require(schedule.active, "Vesting schedule not active");
        
        // Check milestones in case there are new ones
        checkMilestones(vestingId);
        
        uint256 unlockAmount = schedule.unlockedAmount;
        require(unlockAmount > 0, "No tokens to withdraw");
        
        // Reset unlocked amount
        schedule.unlockedAmount = 0;
        
        // Transfer tokens to creator
        IERC20(schedule.tokenAddress).transfer(schedule.creator, unlockAmount);
        
        emit TokensWithdrawn(vestingId, schedule.creator, unlockAmount);
    }
    
    function getVestingSchedule(uint256 vestingId) external view returns (
        address creator,
        address tokenAddress,
        uint256 totalAmount,
        uint256 unlockedAmount,
        address oracleAddress,
        string memory metricType,
        bool active
    ) {
        VestingSchedule storage schedule = vestingSchedules[vestingId];
        return (
            schedule.creator,
            schedule.tokenAddress,
            schedule.totalAmount,
            schedule.unlockedAmount,
            schedule.oracleAddress,
            schedule.metricType,
            schedule.active
        );
    }
    
    function getMilestones(uint256 vestingId) external view returns (
        uint256[] memory thresholds,
        uint256[] memory unlockPercentages,
        bool[] memory reached
    ) {
        VestingSchedule storage schedule = vestingSchedules[vestingId];
        uint256 length = schedule.milestones.length;
        
        thresholds = new uint256[](length);
        unlockPercentages = new uint256[](length);
        reached = new bool[](length);
        
        for (uint256 i = 0; i < length; i++) {
            Milestone storage milestone = schedule.milestones[i];
            thresholds[i] = milestone.threshold;
            unlockPercentages[i] = milestone.unlockPercentage;
            reached[i] = milestone.reached;
        }
        
        return (thresholds, unlockPercentages, reached);
    }
    
    function getCreatorVestings(address creator) external view returns (uint256[] memory) {
        return creatorVestings[creator];
    }
} 