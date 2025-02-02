import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DataDAOModule", (m) => {
  // Deploy the DataDAO contract
  const dataDAO = m.contract("DataDAO");

  return { dataDAO };
});
