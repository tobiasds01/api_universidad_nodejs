var express = require('express');
var router = express.Router();
const models = require('./../models');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = models.usuario;
dotenv.config();

router.get("/", (req, res,next) => {
  models.usuario.findAll({attributes: ["id","nombre","email","contraseña","id_alumno"],
    include:[{as:'Alumno-Usuario', model:models.alumno, attributes: ["id","nombre","dni"]}]
  }).then(usuarios => res.send(usuarios)).catch(error => { return next(error)});
});

router.post("/", (req, res) => {
  let contraseña = bcrypt.hashSync(req.body.contraseña, 10);

  models.usuario
    .create({
        nombre: req.body.nombre,
        contraseña: contraseña,
        email: req.body.email,
        id_alumno: req.body.id_alumno
    })
    .then(usuario => {
        res.status(201).send({ id: usuario.id })
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
})

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
    findUsuario(req.params.id, {
    onSuccess: usuario => res.send(usuario),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
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
});

router.delete("/:id", (req, res) => {
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
});

router.post('/login',async(req,res,next)=>{
 const user = await User.findOne({ where : {email : req.body.email }});
 if(user){
    const password_valid = await bcrypt.compare(req.body.password,user.password);
    if(password_valid){
        token = jwt.sign({ "id": user.id, "email": user.email,"nombre": user.nombre },process.env.SECRET);
        res.status(200).json({ token : token });
    } else {
      res.status(400).json({ error : "Password Incorrect" });
    }
  } else {
    res.status(404).json({ error : "User does not exist" });
  }
});

router.get('/me',
 async(req,res,next)=>{
  try {
    let token = req.headers['authorization'].split(" ")[1];
    let decoded = jwt.verify(token,process.env.SECRET);
    req.user = decoded;
    next();
  } catch(err){
    res.status(401).json({"msg":"Couldnt Authenticate"});
  }
  },
  async(req,res,next)=>{
    let user = await User.findOne({where:{id : req.user.id},attributes:{exclude:["password"]}});
    if(user === null){
      res.status(404).json({'msg':"User not found"});
    }
    res.status(200).json(user);
 }); 

module.exports = router;