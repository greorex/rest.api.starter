import crypto from "crypto";

export const hashPassword = (password) =>
  crypto.createHash("sha512").update(password).digest("hex");

export default (sequelize, Sequelize) =>
  sequelize.define(
    "users",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      user: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [5, 30],
        },
      },

      password: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          len: [8, 20],
        },
      },

      loggedAt: Sequelize.DATE,

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
    },
    {
      hooks: {
        beforeCreate: (user) => {
          if (user.password !== "") {
            Object.assign(user, {
              password: hashPassword(user.password),
            });
          }
        },

        beforeBulkUpdate: (user) => {
          if (user.attributes.password !== "") {
            Object.assign(user.attributes, {
              password: hashPassword(user.attributes.password),
            });
          }
        },
      },

      modelName: "users",
      timestamps: false,
      paranoid: true,
      freezeTableName: true,
      tableName: "users",
      sequelize,
    }
  );
