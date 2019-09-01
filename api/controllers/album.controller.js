'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist.model');
var Album = require('../models/album.model');
var Song = require('../models/song.model');



function getAlbum(req, res){
    var albumId = req.params.id;

    Album.findById(albumId).populate({path: 'artist'}).exec((err, album) => {
        if (err) {
            res.status(500).send({ message: 'Error de servidor al obtener el album'});
        } else {
            if (!album) {
                res.status(404).send({ message: 'El album no existe'});
            } else {
                res.status(200).send({ album });
            }
        }
    });
}

function getAlbums(req, res){
    var artistId = req.params.artist;

    if (!artistId) {
        //sacar todos los albums de la db 
        var find = Album.find({}).sort('title');
    } else {
        //sacar los albumes de ese artista
        var find = Album.find( {artist: artistId }).sort('year');
    }

    find.populate({path: 'artist'}).exec((err, albums) => {
        if (err) {
            res.status(500).send({ message: 'Error de servidor al obtener los albumes'});
        } else {
            if (!albums) {
                res.status(404).send({ message: 'No existen albumes'});
            } else {
                res.status(200).send({ albums });
            }
        }
    });
}

function saveAlbum(req, res){
    var album = new Album();
    var params = req.body;

    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'null';
    album.artist = params.artist;
    if (album.title != null && album.description != null && album.year != null && album.artist != null) {
        album.save((err, albumStored) => {
            if (err) {
                res.status(500).send({ message: 'Error en el servidor al intentar guardar el album'});
            } else {
                if (!albumStored) {
                    res.status(404).send({ message: 'El album no se pudo guardar'});
                } else {
                    res.status(200).send({ album: albumStored });
                }
            }
        });
    } else {
        console.log(params);
        res.status(200).send({ message: 'Complete todos los campos'});
    }

}

function updateAlbum(req, res){
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor al intentar actualizar el album'});
        } else {
            if (!albumUpdated) {
                res.status(404).send({ message: 'El album no se pudo actualizar'});
            } else {
                res.status(200).send({ album: albumUpdated });
            }
        }
    });
}

function deleteAlbum(req, res){
    var albumId = req.params.id;

    Album.findByIdAndRemove(albumId, (err, albumRemoved) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor al intentar borrar el album'});
        } else {
            if (!albumRemoved) {
                res.status(404).send({ message: 'El album no se pudo borrar'});
            } else {
                Song.find({ album: albumRemoved._id }).remove((err, songRemoved) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el servidor al intentar borrar la canción'});
                    } else {
                        if (!songRemoved) {
                            res.status(404).send({ message: 'La canción no se pudo borrar'});
                        } else {
                            res.status(200).send({ album: albumRemoved });
                        }
                    }
                });
            }
        }
    });

}

function uploadImage(req, res){
    var albumId = req.params.id;
    var file_name = 'No subido...';

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_file = file_name.split('.')[1].toLowerCase();
        
        //console.log(ext_file);
        if (ext_file == 'jpg' || ext_file == 'png' || ext_file == 'gif') {
            //subir imagen
            Album.findByIdAndUpdate(albumId, {image: file_name}, (err, albumUpdated) => {
                if (err) {
                    res.status(500).send({message: 'Error al intentar actualizar el album'});
                } else {
                    if (!albumUpdated) {
                        res.status(404).send({message: 'No se pudo actualizar el album'});
                    } else {
                        res.status(200).send({album: albumUpdated});
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
    var  path_file = './uploads/albums/' + imageFile;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: 'La imagen no existe...'});
        }
    })
}

module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
}