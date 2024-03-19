import { QueryInterface, DataTypes } from "sequelize";
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("OpeningHours", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      message: {
        type: DataTypes.STRING,
        defaultValue: ""
      },
      days: {
        type: DataTypes.ARRAY(DataTypes.JSONB)
      },
      createdAt: {
        type: DataTypes.DATE(),
        defaultValue: new Date()
      },
      updatedAt: {
        type: DataTypes.DATE(),
        defaultValue: new Date()
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("OpeningHours");
  }
};
