
const { TonClient, WalletContractV4, internal, external, storeMessage, beginCell } = require("ton");
const { mnemonicToWalletKey } = require("ton-crypto");

async function main() {
    const mnemonic = "verb push toddler execute oil pigeon stable ceiling swift impose shed retreat vessel spoon wrist chuckle metal deer carry derive program adapt picture minute";
    const keyPair = await mnemonicToWalletKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });

    console.log("Wallet Address:", wallet.address.toString());

    // Test createTransfer
    const transfer = wallet.createTransfer({
        seqno: 0,
        secretKey: keyPair.secretKey,
        messages: [internal({
            to: "UQCFJEP4WZ_mpdo0_kMEmsTgvrMHG7K_tWY16pQhKHwoOtFz",
            value: "0.01",
            body: "test",
            bounce: false,
        })],
        sendMode: 3,
    });

    console.log("Transfer Type:", transfer.constructor.name);
    // console.log("Transfer:", transfer); // Use util.inspect if needed

    // Check if we can extract init
    console.log("Wallet Init Code:", wallet.init.code.toBoc().toString('hex').substring(0, 20) + "...");
    console.log("Wallet Init Data:", wallet.init.data.toBoc().toString('hex'));

    // We need to manually construct the External Message with Init if 'transfer' doesn't have it.
    // Usually 'transfer' IS the ExternalMessage cell.
    // Let's parse it or assume we need to rebuild it if we want Init.

    // If 'transfer' is a Cell, we can't easily add Init to it if it's already finalized.
    // We might need to construct the message manually like this:

    /*
    const msg = beginCell()
        .storeBit(0) // no signature? No, external messages need signature? 
        // Wait, Wallet V4 transfer IS the body of the external message?
        // Or is it the external message itself?
    */

    // Let's check if there's a simpler way.
    // Does createTransfer have 'init' option? usually not.
}

main();
