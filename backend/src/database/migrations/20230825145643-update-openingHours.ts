import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("OpeningHours", "message", {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("OpeningHours", "message", {
        type: DataTypes.STRING,
        defaultValue: ""
      })
    ]);
  }
};
