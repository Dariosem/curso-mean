'use strict'
var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user.model');
var jwt = require('../services/jwt');

//metodo de prueba, para ver como funciona
function pruebas(req, res){
    res.status(200).send({
        message: 'Prueba de controlador de usuarios'
    });
}

function saveUser(req, res){
    var  user = new User();

    var params = req.body;
    
    //console.log(params);

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROL-ADMIN';
    user.image = 'null';

    if(params.password){
        //encriptar la clave
        bcrypt.hash(params.password, null, null, function(err, hash){
            user.password = hash;

            if (user.name != null && user.surname != null && user.email != null) {
                //guarda usuario
                user.save((err, userStored) => {
                    if(err){
                        res.status(500).send({message: 'Error al guardar el usuario'});
                    }else{
                        if (!userStored) {
                            res.status(404).send({message: 'El usuario no pudo ser registrado'});
                        } else {
                            res.status(200).send({user: userStored});
                        }
                    }
                });
            } else {
                res.status(200).send({ message: 'Rellena todos los campos'});
            }
        });
    }else{
        res.status(200).send({ message: 'Introduce la contraseña'});
    }
}

function loginUser(req, res){
    var params = req.body;

    var email = params.email;
    var password = params.password;
    
    User.findOne({email: email.toLowerCase()}, (err, user) =>{
        if (err) {
            res.status(500).send({message: 'Error en la petición'});
        } else {
            if(!user){
                res.status(404).send({message: 'El usuario no existe'});
            }else{
                //comprobar la contraseña
                bcrypt.compare(password, user.password, (err, check) => {
                    if (check) {
                        //generar token de jwt
                        if (params.gethash) {
                            //devolver un token
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        } else {
                            res.status(200).send([{user}]);
                        }
                    } else {
                        res.status(404).send({message: 'El usuario no ha podido logearse'});
                    }
                });
            }
        }
    });
}

function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para actualizar este usuario'});
    }

    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
        if (err) {
            res.status(500).send({message: 'Error al intentar actualizar el usuario'});
        } else {
            if (!userUpdated) {
                res.status(404).send({message: 'No se pudo actualizar el usuario'});
            } else {
                res.status(200).send({user: userUpdated});
            }
        }
    });
}

function uploadImage(req, res){
    var userId = req.params.id;
    var file_name = 'No subido...';

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_file = file_name.split('.')[1].toLowerCase();
        
        //console.log(ext_file);
        if (ext_file == 'jpg' || ext_file == 'png' || ext_file == 'gif') {
            //subir imagen
            User.findByIdAndUpdate(userId, {image: file_name}, (err, userUpdated) => {
                if (err) {
                    res.status(500).send({message: 'Error al intentar actualizar el usuario'});
                } else {
                    if (!userUpdated) {
                        res.status(404).send({message: 'No se pudo actualizar el usuario'});
                    } else {
                        res.status(200).send({image: file_name, user: userUpdated});
                    }
                }
            });
        } else {
            res.status(200).send({message: 'La extensión del archivo no es correcta'});
        }

    } else {
        res.status(200).send({message: ' No has subido ningun archivo'});
    }
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var  path_file = './uploads/users/' + imageFile;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: 'La imagen no existe...'});
        }
    })
}

module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile,
}