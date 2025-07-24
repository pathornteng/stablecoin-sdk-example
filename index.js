const {
  Network,
  InitializationRequest,
  CreateRequest,
  ConnectRequest,
  SupportedWallets,
  NetworkService,
  TokenSupplyType,
  StableCoin,
} = require("@hashgraph/stablecoin-npm-sdk");
require("dotenv").config();

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
  await StableCoin.create(request);
};

try {
  main();
} catch (error) {
  console.error(error);
}
