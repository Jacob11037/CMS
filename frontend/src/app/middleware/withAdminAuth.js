import { withRoleAuth } from "./withRoleAuth";

const withAdminAuth = withRoleAuth(["admin"]);
export default withAdminAuth;
