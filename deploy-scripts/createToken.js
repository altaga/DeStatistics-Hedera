require("dotenv").config();
const {
  Client,
  Hbar,
  FileCreateTransaction,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
} = require("@hashgraph/sdk"); // v2.46.0

const { MY_ACCOUNT_ID, MY_PRIVATE_KEY } = process.env;
const MY_PRIVATE_KEY_DER = PrivateKey.fromStringDer(MY_PRIVATE_KEY);

// If we weren't able to grab it, we should throw a new error
if (MY_ACCOUNT_ID == null || MY_PRIVATE_KEY == null) {
  throw new Error(
    "Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present"
  );
}

async function main() {
  let client;
  try {
    // Pre-configured client for test network (testnet)
    client = Client.forMainnet();

    //Set the operator with the account ID and private key
    client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY_DER);

    // Create the transaction
    // CREATE FUNGIBLE TOKEN (STABLECOIN)
    const transaction = await new TokenCreateTransaction()
      .setTokenName("DeStatistics")
      .setTokenSymbol("DES")
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(6)
      .setInitialSupply(100_000_000_000 * (10**6))
      .setTreasuryAccountId(MY_ACCOUNT_ID)
      .setSupplyType(TokenSupplyType.Infinite)
      .setSupplyKey(MY_PRIVATE_KEY_DER)
      .freezeWith(client);

    //SIGN WITH TREASURY KEY
    const signedTransaction = await transaction.sign(MY_PRIVATE_KEY_DER);

    //SUBMIT THE TRANSACTION
    const txTransferResponse = await signedTransaction.execute(client);

    //GET THE TRANSACTION RECEIPT
    const receipt = await txTransferResponse.getReceipt(client);

    //LOG THE TOKEN ID TO THE CONSOLE
    console.log(`- Created token with ID: ${receipt.tokenId} \n`);

    //Get the Transaction ID
    const txIdTransfer = txTransferResponse.transactionId.toString();

    console.log(
      "-------------------------------- FUNCTION ------------------------------ "
    );
    console.log("Receipt status           :", receipt.status.toString());
    console.log("Transaction ID           :", txIdTransfer);
    console.log(
      "Hashscan URL             :",
      `https://hashscan.io/mainnet/tx/${txIdTransfer}`
    );
  } catch (error) {
    console.error(error);
  } finally {
    if (client) client.close();
  }
}

main();
