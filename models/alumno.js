'use strict';

module.exports = (sequelize, DataTypes) => {
  const alumno = sequelize.define('alumno', {
    nombre: DataTypes.STRING,
    dni: DataTypes.INTEGER,
    fecha_de_nacimiento: DataTypes.DATE,
    id_carrera: DataTypes.INTEGER
  }, {});
  alumno.associate = function(models) {
    alumno.belongsTo( models.carrera, {
      as: 'Carrera-Alumno',
      foreignKey: 'id_carrera',
      targetKey: 'id'
    } );
  }; 
  return alumno;
};