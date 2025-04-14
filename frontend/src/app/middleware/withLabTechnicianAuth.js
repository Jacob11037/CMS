import { withRoleAuth } from "./withRoleAuth";

const withLabTechnicianAuth = withRoleAuth(["labtechnician", "admin"]);
export default withLabTechnicianAuth;
