import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("DataDAO", function () {
  async function deployDataDAOFixture() {
    const [owner, member1, member2, nonMember] = await hre.ethers.getSigners();

    const DataDAO = await hre.ethers.getContractFactory("DataDAO");
    const dao = await DataDAO.deploy();

    return { dao, owner, member1, member2, nonMember };
  }

  describe("Deployment", function () {
    it("Should deploy correctly", async function () {
      const { dao } = await loadFixture(deployDataDAOFixture);
      expect(dao).to.be.ok;
    });
  });

  describe("Joining the DAO", function () {
    it("Should allow a user to join the DAO", async function () {
      const { dao, member1 } = await loadFixture(deployDataDAOFixture);
      await dao.connect(member1).joinDAO();
      expect(await dao.isMember(member1.address)).to.be.true;
    });

    it("Should not allow a user to join twice", async function () {
      const { dao, member1 } = await loadFixture(deployDataDAOFixture);
      await dao.connect(member1).joinDAO();
      await expect(dao.connect(member1).joinDAO()).to.be.revertedWith("Already a member");
    });
  });

  describe("Creating Proposals", function () {
    it("Should allow members to create proposals", async function () {
      const { dao, member1 } = await loadFixture(deployDataDAOFixture);
      await dao.connect(member1).joinDAO();
      await dao.connect(member1).createProposal("New Research Initiative");
      const proposal = await dao.proposals(0);
      expect(proposal.description).to.equal("New Research Initiative");
    });

    it("Should not allow non-members to create proposals", async function () {
      const { dao, nonMember } = await loadFixture(deployDataDAOFixture);
      await expect(dao.connect(nonMember).createProposal("Non-Member Proposal"))
        .to.be.revertedWith("Not a member of the Data DAO");
    });
  });

  describe("Voting on Proposals", function () {
    it("Should allow members to vote on proposals", async function () {
      const { dao, member1, member2 } = await loadFixture(deployDataDAOFixture);
      await dao.connect(member1).joinDAO();
      await dao.connect(member2).joinDAO();
      await dao.connect(member1).createProposal("Support Open Data");
      await dao.connect(member2).vote(0);
      const proposal = await dao.proposals(0);
      expect(proposal.voteCount).to.equal(1);
    });
  });

  describe("Executing Proposals", function () {
    it("Should execute a proposal if it has majority votes", async function () {
      const { dao, member1, member2 } = await loadFixture(deployDataDAOFixture);
      await dao.connect(member1).joinDAO();
      await dao.connect(member2).joinDAO();
      await dao.connect(member1).createProposal("Fund New AI Research");
      await dao.connect(member1).vote(0);
      await dao.connect(member2).vote(0);
      await dao.connect(member1).executeProposal(0);
      const proposal = await dao.proposals(0);
      expect(proposal.executed).to.be.true;
    });
  });
});
