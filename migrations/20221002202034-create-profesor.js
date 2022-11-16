'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('profesors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING
      },
      dni: {
        unique: true,
        type: Sequelize.INTEGER
      },
      fecha_de_nacimiento: {
        type: Sequelize.DATE
      },
      id_materia: {
        type: Sequelize.INTEGER,
        unique: true,
        references: { model: 'materia', key: 'id'}
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('profesors');
  }
};