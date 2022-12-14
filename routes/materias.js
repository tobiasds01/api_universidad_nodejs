var express = require("express");
var router = express.Router();
var models = require("../models");
const auth = require('./auth');

router.get("/", (req, res,next) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    let paginaActual = req.query.paginaActual;
    let cantidadAVer = req.query.cantidadAVer;
    
    models.materia.findAll({attributes: ["id","nombre","id_carrera"],
      offset: paginaActual*cantidadAVer,
      limit: cantidadAVer*1,
      include:[{as:'Carrera-Materia', model:models.carrera, attributes: ["id","nombre"]}]
    }).then(materias => res.send(materias)).catch(error => { return next(error)});
  }
});

router.post("/", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    models.materia
      .create({ 
        nombre: req.body.nombre,
        id_carrera:req.body.id_carrera 
      })
      .then(materia => res.status(201).send({ id: materia.id }))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra materia con el mismo nombre')
        }
        else {
          console.log(`Error al intentar insertar en la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    }
});

const findmateria = (id, { onSuccess, onNotFound, onError }) => {
  models.materia
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(materia => (materia ? onSuccess(materia) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    findmateria(req.params.id, {
      onSuccess: materia => res.send(materia),
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  }
});

router.put("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    const onSuccess = materia =>
      materia
        .update({ 
          nombre: req.body.nombre,
          id_carrera: req.body.id_carrera
        }, { fields: ["nombre","id_carrera"] })
        .then(() => res.sendStatus(200))
        .catch(error => {
          if (error == "SequelizeUniqueConstraintError: Validation error") {
            res.status(400).send('Bad request: existe otra materia con el mismo nombre')
          }
          else {
            console.log(`Error al intentar actualizar la base de datos: ${error}`)
            res.sendStatus(500)
          }
        });
      findmateria(req.params.id, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  }
});

router.delete("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    const onSuccess = materia =>
      materia
        .destroy()
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
    findmateria(req.params.id, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  }
});

module.exports = router;
