console.clear();
require("dotenv").config();
const {
  PrivateKey,
  Client,
  TokenAssociateTransaction,
  AccountBalanceQuery,
} = require("@hashgraph/sdk");
const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromStringED25519(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet();
client.setOperator(secondAccountId, secondPrivateKey);

async function associateToken(tokenId) {
  let associateTokenTx = await new TokenAssociateTransaction()
    .setAccountId(secondAccountId)
    .setTokenIds([tokenId])
    .execute(client);
  let receipt = await associateTokenTx.getReceipt(client);
  console.log("Associate Token: ", receipt.status.toString());
}

async function queryAccountBalance(accountId) {
  console.log("QueryAccountBalance----------------");
  const balanceQuery = new AccountBalanceQuery().setAccountId(accountId);
  const accountBalance = await balanceQuery.execute(client);
  console.log(JSON.stringify(accountBalance, null, 4));
  console.log("-----------------------------------");
}

async function main() {
  const tokenId = "0.0.768328";
  await associateToken(tokenId);
  await queryAccountBalance(secondAccountId);
}
main();
