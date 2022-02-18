pragma solidity ^0.5.0;
// pragma experimental ABIEncoderV2;
/*
Election contract that allows the owner to issue voting rights
to anybody and also end the election and announce results
*/
contract Election {

    struct Candidate {
        string name;
        uint voteCount;
    }

    struct Voter {
        bool authorized;
        bool voted;
        uint vote;
    }

    uint public currentCandidate = 0;

    address public owner;
    string public electionName;

    mapping(address => Voter) public voters;
    // Candidate[] public candidates;
    mapping(uint => Candidate) public candidates;


    // address[] public voterAddresses;

    // function getVotersAddresses() public view returns (address[] memory) {
    //     return voterAddresses;
    // }





    event ElectionResult(string candidateName, uint voteCount);

    modifier ownerOnly() {
        require(msg.sender == owner);
        _;
    }

    constructor(string memory _name) public {
        owner = msg.sender;
        electionName = _name;
    }

    // Retrieving the candidates
    // function getCandidates(uint id) public view returns (Candidate memory) {
    //     return candidates[id];
    // }

    function addCandidate(string memory name) ownerOnly public {
        candidates[currentCandidate] = Candidate(name, 0);
        currentCandidate++;
    }

    // function addCandidate(string memory name) public ownerOnly returns (uint){
    //     candidates[currentCandidate] = Candidate(name, 0);
    //     currentCandidate++;
    //     return currentCandidate-1;
    // }

    function authorize(address person) public ownerOnly  {
        voters[person].authorized = true;
    }

    function vote(uint voteIndex) public{
        //make sure voter is authorized and has not already voted

        // require(!voters[msg.sender].voted, "YOU VOTED ALREADY");


        // require(voters[msg.sender].authorized);

        //record vote
        voters[msg.sender].vote = voteIndex;
        voters[msg.sender].voted = true;

        //increase candidate vote count by 1
        candidates[voteIndex].voteCount += 1;
        // voterAddresses.push(msg.sender);
        // return candidates[voteIndex].voteCount;
    }

    // function end() ownerOnly public {
    //     //announce each candidates results
    //     for(uint i=0; i < candidates.length; i++) {
    //         emit ElectionResult(candidates[i].name, candidates[i].voteCount);
    //     }

    //     //destroy the contract
    //     selfdestruct(owner);
    // }
}