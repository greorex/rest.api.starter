export default (sequelize, Sequelize) =>
  sequelize.define(
    "files",
    {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },

      ext: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },

      mimetype: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },

      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      owner: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
    },
    {
      modelName: "files",
      timestamps: false,
      paranoid: true,
      freezeTableName: true,
      tableName: "files",
      sequelize,
    }
  );
