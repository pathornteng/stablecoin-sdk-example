const {
  Network,
  InitializationRequest,
  CreateRequest,
  ConnectRequest,
  SupportedWallets,
  CashInRequest,
  TokenSupplyType,
  StableCoin,
} = require("@hashgraph/stablecoin-npm-sdk");

const {
  PrivateKey,
  Client,
  TokenAssociateTransaction,
  AccountBalanceQuery,
} = require("@hashgraph/sdk");
require("dotenv").config();

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromStringED25519(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

const mirrorNodeConfig = {
  name: "Testnet Mirror Node",
  network: "testnet",
  baseUrl: "https://testnet.mirrornode.hedera.com/api/v1/",
  apiKey: "",
  headerName: "",
  selected: true,
};

const RPCNodeConfig = {
  name: "HashIO",
  network: "testnet",
  baseUrl: "https://testnet.hashio.io/api",
  apiKey: "",
  headerName: "",
  selected: true,
};

const main = async () => {
  const account = {
    accountId: process.env.MY_ACCOUNT_ID,
    privateKey: {
      key: process.env.MY_PRIVATE_KEY,
      type: "ED25519",
    },
  };

  await Network.init(
    new InitializationRequest({
      network: "testnet",
      mirrorNode: mirrorNodeConfig,
      rpcNode: RPCNodeConfig,
      configuration: {
        factoryAddress: "0.0.6431833",
        resolverAddress: "0.0.6431794",
      },
    })
  );

  await Network.connect(
    new ConnectRequest({
      account: account,
      network: "testnet",
      mirrorNode: mirrorNodeConfig,
      rpcNode: RPCNodeConfig,
      wallet: SupportedWallets.CLIENT,
    })
  );

  const request = new CreateRequest({
    name: "TEST_ACCELERATOR_HTS",
    symbol: "TEST",
    decimals: 6,
    initialSupply: "0",
    supplyType: TokenSupplyType.INFINITE,
    stableCoinFactory: "0.0.6431833",
    createReserve: false,
    grantKYCToOriginalSender: true,
    burnRoleAccount: account.accountId.toString(),
    rescueRoleAccount: account.accountId.toString(),
    deleteRoleAccount: account.accountId.toString(),
    cashInRoleAccount: account.accountId.toString(),
    feeRoleAccount: account.accountId.toString(),
    holdCreatorRoleAccount: account.accountId.toString(),
    proxyOwnerAccount: account.accountId.toString(),
    cashInRoleAllowance: "0",
    metadata: "METADATA",
    configId:
      "0x0000000000000000000000000000000000000000000000000000000000000002",
    configVersion: 1,
  });

  request.validate();
  const createResult = await StableCoin.create(request);
  console.log("Create Result", createResult);

  console.log(createResult.coin.tokenId.toString());

  await associateToken(createResult.coin.tokenId.toString());

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const cashInReq = new CashInRequest({
    tokenId: createResult.coin.tokenId.toString(),
    targetId: account.accountId.toString(),
    amount: "100",
  });

  const result = await StableCoin.cashIn(cashInReq);
  console.log("CashIn (Mint) Result", result);
};

async function associateToken(tokenId) {
  let associateTokenTx = await new TokenAssociateTransaction()
    .setAccountId(myAccountId)
    .setTokenIds([tokenId])
    .execute(client);
  let receipt = await associateTokenTx.getReceipt(client);
  console.log("Associate Token: ", receipt.status.toString());
}

try {
  main();
} catch (error) {
  console.error(error);
}
