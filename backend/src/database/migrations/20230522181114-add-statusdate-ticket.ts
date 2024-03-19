import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "datetime", {
      type: DataTypes.DATE,
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: true
    },);
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "datetime");
  }
};
