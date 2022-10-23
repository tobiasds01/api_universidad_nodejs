'use strict';

const carrera = require("./carrera");

module.exports = (sequelize, DataTypes) => {
  const alumno = sequelize.define('alumno', {
    nombre: DataTypes.STRING,
    dni: DataTypes.INTEGER,
    fecha_de_nacimiento: DataTypes.DATE,
    id_carrera: DataTypes.INTEGER
  }, {});
  alumno.associate = function(models) {
    alumno.belongsTo( models.carrera, {
      foreignKey: 'id',
      target_key: 'id_carrera'
    } );
  }; 
  return alumno;
};