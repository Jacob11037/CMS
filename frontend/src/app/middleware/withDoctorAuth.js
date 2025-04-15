import { withRoleAuth } from "./withRoleAuth";

const withDoctorAuth = withRoleAuth(["doctor", "admin"]);
export default withDoctorAuth;
