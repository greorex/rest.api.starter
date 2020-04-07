import Sequelize from "sequelize";
import users from "./users";
import files from "./files";
import config from "../../config";

const Op = Sequelize.Op,
  { name, user, password } = config.database,
  sequelize = new Sequelize(name, user, password, config.database);

const Users = users(sequelize, Sequelize);
const Files = files(sequelize, Sequelize);

export { Users, Files, sequelize, Op };
