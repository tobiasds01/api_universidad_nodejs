'use strict';
module.exports = (sequelize, DataTypes) => {
  const usuario = sequelize.define('usuario', {
    nombre: DataTypes.STRING,
    contraseña: DataTypes.STRING,
    email: DataTypes.STRING,
    id_alumno: DataTypes.INTEGER
  }, {});
  usuario.associate = function(models) {
    usuario.belongsTo( models.alumno, {
      as: 'Alumno-Usuario',
      foreignKey: 'id_alumno',
      targetKey: 'id'
    } );
  };
  return usuario;
};