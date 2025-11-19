import { ethers, run } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const factory = await ethers.getContractFactory("JourneyBadge");
  const contract = await factory.deploy("SoberJourney Badge", "SJB");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("JourneyBadge deployed to:", address);

  // Set default URIs (can be any HTTP/IPFS URL)
  const tx = await contract.setBaseUris(
    "ipfs://first_badge",
    "ipfs://thirty_badge",
  );
  await tx.wait();

  // Try verify when not local
  try {
    await (contract.deploymentTransaction() as any)?.wait?.(5);
    await run("verify:verify", {
      address,
      constructorArguments: ["SoberJourney Badge", "SJB"],
    });
  } catch (e) {
    console.log("Verify skipped:", (e as any)?.message || e);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



