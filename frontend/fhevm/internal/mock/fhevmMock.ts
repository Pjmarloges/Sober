//////////////////////////////////////////////////////////////////////////
// Always dynamic import this file to avoid bundling mock in production.
//////////////////////////////////////////////////////////////////////////
import { JsonRpcProvider } from "ethers";
import { MockFhevmInstance } from "@fhevm/mock-utils";
import { FhevmInstance } from "../../fhevmTypes";

export const fhevmMockCreateInstance = async (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}): Promise<FhevmInstance> => {
  const provider = new JsonRpcProvider(parameters.rpcUrl);
  // Read EIP712 domain from InputVerifier to ensure correct verifying contract and chainId
  const inputVerifierContract = new (await import("ethers")).Contract(
    parameters.metadata.InputVerifierAddress,
    ["function eip712Domain() external view returns (bytes1, string, string, uint256, address, bytes32, uint256[])"],
    provider
  );
  const domain = await inputVerifierContract.eip712Domain();
  const domainChainId: number = Number(domain[3]); // uint256 chainId
  const verifyingContractAddressInputVerification: `0x${string}` = domain[4]; // address verifyingContract

  const instance = await MockFhevmInstance.create(
    provider,
    provider,
    {
      aclContractAddress: parameters.metadata.ACLAddress,
      chainId: parameters.chainId,
      gatewayChainId: domainChainId,
      inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
      kmsContractAddress: parameters.metadata.KMSVerifierAddress,
      verifyingContractAddressDecryption: "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
      verifyingContractAddressInputVerification,
    },
    {
      inputVerifierProperties: {},
      kmsVerifierProperties: {},
    }
  );
  return instance as unknown as FhevmInstance;
};



