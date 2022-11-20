var express = require("express");
var router = express.Router();
var models = require("../models");
const auth = require('./auth');

router.get("/", (req, res,next) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    let paginaActual = req.query.paginaActual;
    let cantidadAVer = req.query.cantidadAVer;
    
    models.alumno.findAll({attributes: ["id","nombre","dni","id_carrera"],
      offset: paginaActual*cantidadAVer,
      limit: cantidadAVer*1,
      include:[{as:'Carrera-Alumno', model:models.carrera, attributes: ["id","nombre"]}]
    }).then(alumnos => res.send(alumnos)).catch(error => { return next(error)});
  }
});

router.post("/", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    models.alumno
      .create({ 
        nombre: req.body.nombre,
        dni: req.body.dni,
        fecha_de_nacimiento: req.body.fecha_de_nacimiento,
        id_carrera: req.body.id_carrera
      })
      .then(alumno => res.status(201).send({ id: alumno.id }))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otro alumno con el mismo dni')
        }
        else {
          console.log(`Error al intentar insertar en la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    }
});

const findAlumno = (id, { onSuccess, onNotFound, onError }) => {
  models.alumno
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(alumno => (alumno ? onSuccess(alumno) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    findAlumno(req.params.id, {
      onSuccess: alumno => res.send(alumno),
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  }
});

router.put("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    const onSuccess = alumno =>
      alumno
        .update({ 
          nombre: req.body.nombre,
          dni: req.body.dni,
          fecha_de_nacimiento: req.body.fecha_de_nacimiento,
          id_carrera: req.body.id_carrera
        }, { fields: ["nombre", "dni", "fecha_de_nacimiento", "id_carrera"] })
        .then(() => res.sendStatus(200))
        .catch(error => {
          if (error == "SequelizeUniqueConstraintError: Validation error") {
            res.status(400).send('Bad request: existe otro alumno con el mismo nombre')
          }
          else {
            console.log(`Error al intentar actualizar la base de datos: ${error}`)
            res.sendStatus(500)
          }
        });
      findAlumno(req.params.id, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  }
});

router.delete("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    const onSuccess = alumno =>
    alumno
        .destroy()
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
    findAlumno(req.params.id, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  }
});

module.exports = router;