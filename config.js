const production = process.env.NODE_ENV === "production";

export default {
  server: {
    port: process.env.PORT || 8080,
    production: production ? true : false,
    camelCase: true,
    omitEmpty: true,
  },

  auth: {
    algorithm: process.env.ALGORITHM || "HS256",
    secret: process.env.SECRET || "authorizationsecret",
    expiresIn: 60 * 10,
    refreshSecret: process.env.REFRESH_SECRET || "refreshsecret",
    refreshExpiresIn: "1h",
  },

  database: {
    name: process.env.DATABASE_NAME || "starter",
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "test",
    host: process.env.DATABASE_HOST || "localhost",
    dialect: "mysql",
    logging: production ? false : console.log,
    sync: false,
    define: {
      engine: "InnoDB",
      charset: "utf8",
    },
  },

  storage: {
    path: process.env.STORAGE_PATH || "uploads",
  },
};
