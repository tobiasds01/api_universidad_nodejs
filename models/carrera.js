'use strict';
module.exports = (sequelize, DataTypes) => {
  const carrera = sequelize.define('carrera', {
    nombre: DataTypes.STRING
  }, {});
  carrera.associate = function(models) {
    carrera.hasMany( models.alumno, { 
      foreignKey: 'id_carrera'
    });
    carrera.hasMany( models.materia, {
      foreignKey: 'id_carrera'
    })
  };
  return carrera;
};