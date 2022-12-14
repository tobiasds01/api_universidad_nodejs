var express = require("express");
var router = express.Router();
var models = require("../models");
const auth = require('./auth');

router.get("/", (req, res,next) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    models.profesor.findAll({attributes: ["id","nombre","dni","id_materia"],
        include:[{as:'Materia-Profesor', model:models.materia, attributes: ["id","nombre"]}]
      }).then(profesors => res.send(profesors)).catch(error => { return next(error)});
  }
});

router.post("/", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    models.profesor
      .create({ 
        nombre: req.body.nombre,
        dni: req.body.dni,
        fecha_de_nacimiento: req.body.fecha_de_nacimiento,
        id_materia: req.body.id_materia
      })
      .then(profesor => res.status(201).send({ id: profesor.id }))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otro profesor con el mismo dni')
        }
        else {
          console.log(`Error al intentar insertar en la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    }
});

const findProfesor = (id, { onSuccess, onNotFound, onError }) => {
  models.profesor
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(profesor => (profesor ? onSuccess(profesor) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    findProfesor(req.params.id, {
      onSuccess: profesor => res.send(profesor),
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  }
});

router.put("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    const onSuccess = profesor =>
    profesor
        .update({ 
          nombre: req.body.nombre,
          dni: req.body.dni,
          fecha_de_nacimiento: req.body.fecha_de_nacimiento,
          id_materia: req.body.id_materia
        }, { fields: ["nombre","dni","fecha_de_nacimiento","id_materia"] })
        .then(() => res.sendStatus(200))
        .catch(error => {
          if (error == "SequelizeUniqueConstraintError: Validation error") {
            res.status(400).send('Bad request: existe otro profesor con el mismo nombre')
          }
          else {
            console.log(`Error al intentar actualizar la base de datos: ${error}`)
            res.sendStatus(500)
          }
        });
      findProfesor(req.params.id, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  }
});

router.delete("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    const onSuccess = profesor =>
    profesor
        .destroy()
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
    findProfesor(req.params.id, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  }
});

module.exports = router;