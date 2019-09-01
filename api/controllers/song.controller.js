'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist.model');
var Album = require('../models/album.model');
var Song = require('../models/song.model');

function getSong(req, res){
    var songId = req.params.id;

    Song.findById(songId).populate({path: 'album'}).exec((err, song) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor al intentar obtener la canción'});
        } else {
            if (!song) {
                res.status(404).send({ message: 'La canción no existe'});
            } else {
                res.status(200).send({ song });
            }
        }
    })
}

function getSongs(req, res){
    var albumId = req.params.albumId;

    if(albumId){
        
        var find = Song.find({album: albumId}).sort('number');
    }else{
        var find = Song.find({}).sort('number');
    }

    find.populate({
        path: 'album',
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec((err, songs) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor al intentar obtener las canciones'});
        } else {
            if (!songs) {
                res.status(404).send({ message: 'No hay canciones'});
            } else {
                res.status(200).send({ songs });
            }
        }
    });

}

function saveSong(req, res){
    var song = new Song();
    var params = req.body;

    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = 'null';
    song.album = params.album;

    song.save((err, songStored) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor al intentar guardar la canción'});
        } else {
            if (!songStored) {
                res.status(404).send({ message: 'La canción no se pudo guardar'});
            } else {
                res.status(200).send({ song: songStored });
            }
        }
    });

}

function updateSong(req, res){
    var songId = req.params.id;
    var update = req.body;

    Song.findByIdAndUpdate(songId, update, (err, songUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor al intentar actualizar la canción'});
        } else {
            if (!songUpdated) {
                res.status(404).send({ message: 'La canción no se pudo actualizar'});
            } else {
                res.status(200).send({ song: songUpdated });
            }
        }
    });
}

function deleteSong(req, res){
    var songId = req.params.id;

    Song.findByIdAndRemove(songId, (err, songRemoved) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor al intentar borrar la canción'});
        } else {
            if (!songRemoved) {
                res.status(404).send({ message: 'La canción no se pudo borrar'});
            } else {
                res.status(200).send({ song: songRemoved });
            }
        }
    });
}

function uploadFile(req, res){
    var songId = req.params.id;
    var file_name = 'No subido...';

    if (req.files) {
        var file_path = req.files.songFile.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_file = file_name.split('.')[1].toLowerCase();
        
        //console.log(ext_file);
        if (ext_file == 'mp3' || ext_file == 'ogg') {
            //subir imagen
            Song.findByIdAndUpdate(songId, {file: file_name}, (err, songUpdated) => {
                if (err) {
                    res.status(500).send({message: 'Error al intentar actualizar la canción'});
                } else {
                    if (!songUpdated) {
                        res.status(404).send({message: 'No se pudo actualizar la canción'});
                    } else {
                        res.status(200).send({song: songUpdated});
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

function getSongFile(req, res){
    var songFile = req.params.songFile;
    var  path_file = './uploads/songs/' + songFile;
    console.log(path_file);

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(404).send({message: 'El fichero de audio no existe...'});
        }
    })
}

module.exports = {
    getSong,
    saveSong,
    getSongs,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile,
}