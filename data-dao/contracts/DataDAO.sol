// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataDAO {
    struct DataProposal {
        string description;
        uint256 voteCount;
        bool executed;
    }
    address[] public members;
    mapping(address => bool) public isMember;
    DataProposal[] public proposals;

    modifier onlyMembers() {
        require(isMember[msg.sender], "Not a member of the Data DAO");
        _;
    }

    function joinDAO() public {
        require(!isMember[msg.sender], "Already a member");
        members.push(msg.sender);
        isMember[msg.sender] = true;
    }

    function createProposal(string memory _description) public onlyMembers {
        proposals.push(DataProposal({
            description: _description,
            voteCount: 0,
            executed: false
        }));
    }

    function vote(uint256 _proposalId) public onlyMembers {
        require(_proposalId < proposals.length, "Invalid proposal ID");
        proposals[_proposalId].voteCount += 1;
    }

    function executeProposal(uint256 _proposalId) public onlyMembers {
        require(_proposalId < proposals.length, "Invalid proposal ID");
        require(!proposals[_proposalId].executed, "Proposal already executed");
        require(proposals[_proposalId].voteCount > members.length / 2, "Not enough votes");
        proposals[_proposalId].executed = true;
    }
}