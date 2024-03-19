export default {
  secret: process.env.JWT_SECRET || "mysecret",
  expiresIn: "480m",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "myanothersecret",
  refreshExpiresIn: "60m"
};
