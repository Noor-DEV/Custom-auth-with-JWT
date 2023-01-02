const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {}

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pwd: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      salt: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      modelName: "User",
      tableName: "users",
      sequelize,
    }
  );

  return User;
};
