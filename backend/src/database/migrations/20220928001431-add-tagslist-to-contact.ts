import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Contacts", "tagslist", {
    
      type: DataTypes.ARRAY(DataTypes.JSON),
      defaultValue:[]
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Contacts", "tagslist");
  }
};
