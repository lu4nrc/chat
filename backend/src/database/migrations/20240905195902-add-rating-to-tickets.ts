import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "rating", {
      type: DataTypes.INTEGER,
      allowNull: true, // Pode ser nulo, se a avaliação não for obrigatória
      defaultValue: null, // Valor padrão, se necessário
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "rating");
  }
};