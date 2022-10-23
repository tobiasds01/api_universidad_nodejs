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
      foreignKey: 'id_materia',
      key: 'id'
    })
  };
  return profesor;
};