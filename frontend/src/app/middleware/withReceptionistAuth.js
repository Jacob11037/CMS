import { withRoleAuth } from "./withRoleAuth";

const withReceptionistAuth = withRoleAuth(["receptionist", "admin"]);
export default withReceptionistAuth;
