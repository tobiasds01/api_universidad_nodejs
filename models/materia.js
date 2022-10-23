'use strict';
module.exports = (sequelize, DataTypes) => {
  const materia = sequelize.define('materia', {
    nombre: DataTypes.STRING,
    id_carrera: DataTypes.INTEGER
  }, {});
  materia.associate = function(models) {
    materia.belongsTo( models.carrera, {
      foreignKey: 'id',
      target_key: 'id_carrera'
    })
  };
  return materia;
};