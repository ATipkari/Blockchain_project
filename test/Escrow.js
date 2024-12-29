const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller, inspector, lender;
    let realEstate, escrow;

    beforeEach(async () => {
        [buyer, seller, inspector, lender] = await ethers.getSigners()
        //Deploy RealEstate
        const RealEstate = await ethers.getContractFactory('RealEstate')
        realEstate = await RealEstate.deploy()

        //mint
        let transaction = await realEstate.connect(seller).mint("https://bafybeia5ge2k32nnh2ouslsaemj73kxarihuwjconiee3zuohpl66zaeo4.ipfs.dweb.link/?filename=1.json")
        await transaction.wait()

        const Escrow = await ethers.getContractFactory("Escrow");
        escrow = await Escrow.deploy(realEstate.address, seller.address, lender.address, inspector.address);

        //approve property

        transaction = await realEstate.connect(seller).approve(escrow.address, 0)
        await transaction.wait()

        //list property
        transaction = await escrow.connect(seller).list(0, buyer.address, tokens(10), tokens(5))
        await transaction.wait()

    })

    describe("Deployment", async () => {

        it("return NFT Address", async () => {

            let result = await escrow.nftAddress()
            expect(result).to.be.equal(realEstate.address);
        })

        it("return seller", async () => {

            result = await escrow.seller()
            expect(result).to.be.equal(seller.address)
        })

        it("return inspector", async () => {

            result = await escrow.inspector()
            expect(result).to.be.equal(inspector.address)
        })

        it("return lender", async () => {
            result = await escrow.lender()
            expect(result).to.be.equal(lender.address)

        })
    })

    describe("Listing", async () => {

        it("update as Listed", async () => {
            const result = await escrow.isListed(0)
            expect(result).to.be.equal(true)
        })

        it("Update OwnerShip", async () => {
            expect(await realEstate.ownerOf(0)).to.be.equal(escrow.address)
        })

        it("returns Buyers", async () => {
            const result = await escrow.buyer(0)
            expect(result).to.be.equal(buyer.address)
        })

        it("return purchase price", async () => {
            const result = await escrow.purchasePrice(0);
            expect(result).to.be.equal(tokens(10))
        })

        it("return escrow Amount", async () => {
            const result = await escrow.escrowAmount(0);
            expect(result).to.be.equal(tokens(5))
        })
    })

    describe("Deposits", async () => {

        it("update contract balance", async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(0, { value: tokens(5) })
            await transaction.wait()
            const result = await escrow.getBalance()
            expect(result).to.be.equal(tokens(5))
        })





    })

    describe("Inspection", async () => {

        it("Update inspection status", async () => {
            const transaction = await escrow.connect(inspector).updateInsceptionStatus(0, true)
            await transaction.wait()
            const result = await escrow.inspectionPassed(0)
            expect(result).to.be.equal(true)
        })

    })

    describe("Approvel", async () => {

        it("Update Approval status", async () => {
           let transaction = await escrow.connect(buyer).approveSale(0);
           await transaction.wait();

           transaction = await escrow.connect(seller).approveSale(0);
           await transaction.wait();

           transaction = await escrow.connect(lender).approveSale(0);
           await transaction.wait();

           expect(await escrow.approval(0, buyer.address)).to.be.equal(true)
           expect(await escrow.approval(0, seller.address)).to.be.equal(true)
           expect(await escrow.approval(0, lender.address)).to.be.equal(true)

        })

    })

    describe("sale", async () => {

        beforeEach(async ()=>{

            let transaction =  await escrow.connect(buyer).depositEarnest(0, { value: tokens(5)})
            await transaction.wait();

            transaction = await escrow.connect(inspector).updateInsceptionStatus(0, true);
            await transaction.wait()

            transaction = await escrow.connect(buyer).approveSale(0);
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(0);
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(0);
            await transaction.wait()

            await lender.sendTransaction({ to: escrow.address, value: tokens(5)})

            transaction = await escrow.connect(seller).finalizeSale(0);
            await transaction.wait()

        })

        it("update balance",async () =>{
            expect(await escrow.getBalance()).to.be.equal(0) 

        })

        it("update ownerShip",async () =>{
            expect(await realEstate.ownerOf(0)).to.be.equal(buyer.address) 

        })

    })

})
