var express = require('express');
var router = express.Router();
const models = require('./../models');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const auth = require('./auth');
dotenv.config()

router.post("/signUp", (req, res) => {
  let contraseña = bcrypt.hashSync(req.body.contraseña, 10);

  models.usuario
    .create({
        nombre: req.body.nombre,
        contraseña: contraseña,
        email: req.body.email,
        id_alumno: req.body.id_alumno
    })
    .then(usuario => {

        res.status(201).send({ 
          id: usuario.id,
          usuario: usuario,
        })
    })
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otro usuario con el mismo email')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

router.post('/login', (req, res) => {
  let { email, contraseña } = req.body;

  models.usuario.findOne({
    where: { email: email }
  }).then(usuario => {
    if(!usuario) {
      res.status(404).json({ msg: "Email o contraseña incorrectos" })
    } else {
      if(bcrypt.compareSync(contraseña, usuario.contraseña)) {
        try {
          let token = jwt.sign({ usuario: usuario.usuario, email: usuario.email }, "secret", {
            expiresIn: '1h'
          });
          res.status(201).send({ token: token });
        } catch {
          res.status(401).send("Algo salió mal");
        }
      } else {
        res.status(401).json({ msg: "Email o contraseña incorrectos" })
      }
    }
  })
});

router.get("/", (req, res,next) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    models.usuario.findAll({attributes: ["id","nombre","email","contraseña","id_alumno"],
      include:[{as:'Alumno-Usuario', model:models.alumno, attributes: ["id","nombre","dni"]}]
    }).then(usuarios => res.send(usuarios)).catch(error => { return next(error)});
  }
});

const findUsuario = (id, { onSuccess, onNotFound, onError }) => {
  models.usuario
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(usuario => (usuario ? onSuccess(usuario) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    findUsuario(req.params.id, {
    onSuccess: usuario => res.send(usuario),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
    });
  }
});

router.put("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    const onSuccess = usuario =>
    usuario
        .update({ 
          nombre: req.body.nombre,
          email: req.body.email,
          id_alumno: req.body.id_alumno
        }, { fields: ["nombre","email","id_alumno"] })
        .then(() => res.sendStatus(200))
        .catch(error => {
          if (error == "SequelizeUniqueConstraintError: Validation error") {
            res.status(400).send('Bad request: existe otro usuario con el mismo nombre')
          }
          else {
            console.log(`Error al intentar actualizar la base de datos: ${error}`)
            res.sendStatus(500)
          }
        });
      findUsuario(req.params.id, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  }
});

router.delete("/:id", (req, res) => {
  decodedToken = auth.verificarToken(req.headers, res)
  if(decodedToken) {
    const onSuccess = usuario =>
    usuario
        .destroy()
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
      findUsuario(req.params.id, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  }
});

module.exports = router;