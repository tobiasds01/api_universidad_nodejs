'use strict';
module.exports = (sequelize, DataTypes) => {
  const profesor = sequelize.define('profesor', {
    nombre: DataTypes.STRING,
    dni: DataTypes.INTEGER,
    fecha_de_nacimiento: DataTypes.DATE,
    id_materia: DataTypes.INTEGER
  }, {});
  profesor.associate = function(models) {
    profesor.belongsTo( models.materia, {
      as: 'Materia-Profesor',
      foreignKey: 'id_materia',
      targetKey: 'id'
    })
  };
  return profesor;
};