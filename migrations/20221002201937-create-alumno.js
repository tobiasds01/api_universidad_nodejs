'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('alumnos', {
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
      id_carrera: {
        type: Sequelize.INTEGER,
        references: { model: 'carreras', key: 'id' }
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
    return queryInterface.dropTable('alumnos');
  }
};