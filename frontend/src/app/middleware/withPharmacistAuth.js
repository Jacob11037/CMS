import { withRoleAuth } from "./withRoleAuth";

const withPharmacistAuth = withRoleAuth(["pharmacist", "admin"]);
export default withPharmacistAuth;
