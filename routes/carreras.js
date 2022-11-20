var express = require("express");
var router = express.Router();
var models = require("../models");
var auth = require("./auth");

router.get("/", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    models.carrera
    .findAll({
      attributes: ["id", "nombre"]
    })
    .then(carreras => res.send(carreras))
    .catch(() => res.sendStatus(500));
  }
});

router.post("/", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    models.carrera
      .create({ nombre: req.body.nombre })
      .then(carrera => res.status(201).send({ id: carrera.id }))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
        }
        else {
          console.log(`Error al intentar insertar en la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    }
});

const findCarrera = (id, { onSuccess, onNotFound, onError }) => {
  models.carrera
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(carrera => (carrera ? onSuccess(carrera) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    findCarrera(req.params.id, {
      onSuccess: carrera => res.send(carrera),
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  }
});

router.put("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    const onSuccess = carrera =>
      carrera
        .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
        .then(() => res.sendStatus(200))
        .catch(error => {
          if (error == "SequelizeUniqueConstraintError: Validation error") {
            res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
          }
          else {
            console.log(`Error al intentar actualizar la base de datos: ${error}`)
            res.sendStatus(500)
          }
        });
      findCarrera(req.params.id, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  }
});

router.delete("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    const onSuccess = carrera =>
      carrera
        .destroy()
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
    findCarrera(req.params.id, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  }
});

module.exports = router;