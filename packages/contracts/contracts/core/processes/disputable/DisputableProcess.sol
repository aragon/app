/*
 * SPDX-License-Identifier:    MIT
 */
 
pragma solidity 0.8.10;

import "./../stoppable/StoppableProcess.sol";

/// @title Abstract implementation of the disputable governance process
/// @author Samuel Furter - Aragon Association - 2021
/// @notice This contract can be used to implement concrete disputable governance processes and being fully compatible with the DAO framework and UI of Aragon
/// @dev You only have to define the specific custom logic of your needs in _start, _execute, _halt, and _forward
abstract contract DisputableProcess is StoppableProcess {
    /// @notice Emitted as soon as the process got paused
    event ProcessHalted(Execution execution, uint256 indexed executionId);
    /// @notice Emittes as soon as the process got started again
    event ProcessForwarded(Execution execution, uint256 indexed executionId);

    /// @notice The role identifier to halt a process
    bytes32 public constant PROCESS_HALT_ROLE = keccak256("PROCESS_HALT_ROLE");
    /// @notice The role identifier to forward a process
    bytes32 public constant PROCESS_FORWARD_ROLE = keccak256("PROCESS_FORWARD_ROLE");

    /// @notice If called the execution is halted.
    /// @dev The state of the container does get changed to HALTED and the concrete implementation in _halt called.
    /// @param _executionId The identifier of the current execution
    /// @param _data The arbitrary custom data used for the concrete implementation
    function halt(uint256 _executionId, bytes calldata _data) public auth(PROCESS_HALT_ROLE) {
        Execution storage execution = _getExecution(_executionId);
        
        require(execution.state == State.RUNNING, ERROR_EXECUTION_STATE_WRONG); 
        
        execution.state = State.HALTED;

        _halt(_data);

        emit ProcessHalted(execution, _executionId);
    }

    /// @notice If called the execution does get forwarded.
    /// @dev The state of the container does get changed to RUNNING and the concrete implementation in _forward called.
    /// @param _executionId The identifier of the current execution
    /// @param _data The arbitrary custom data used for the concrete implementation
    function forward(uint256 _executionId, bytes calldata _data) public auth(PROCESS_FORWARD_ROLE) {
        Execution storage execution = _getExecution(_executionId);

        require(execution.state == State.RUNNING, ERROR_EXECUTION_STATE_WRONG);
        
        execution.state = State.RUNNING;

        _forward(_data);

        emit ProcessForwarded(execution, _executionId);
    }

    /// @dev The concrete implementation of halt.
    /// @param _data The arbitrary custom data used for the concrete implementation
    function _halt(bytes calldata _data) internal virtual;

    /// @dev The concrete implementation of forward.
    /// @param _data The arbitrary custom data used for the concrete implementation
    function _forward(bytes calldata _data) internal virtual; 
}
