'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist.model');
var Album = require('../models/album.model');
var Song = require('../models/song.model');

function getArtist(req, res){
    var artistId = req.params.id;

    Artist.findById(artistId, (err, artist) => {
        if (err) {
            res.status(500).send({message: 'Error al intentar obtener el artista...'});
        } else {
            if (artist) {
                res.status(200).send({artist});
            } else {
                res.status(404).send({message: 'El artista no existe...'});
            }
        }
    });

}

function getArtists(req, res){
    if(req.params.page){
        var page = req.params.page;
    }else{
        var page = 1;
    }

    var itemsPerPage = 4;

    Artist.find().sort('name').paginate(page, itemsPerPage, (err, artists, total) => {
        if (err) {
            res.status(500).send({message: 'Error al intentar obtener los artistas...'});
        } else {
            if (artists) {
                return res.status(200).send({
                    pages: page,
                    total_items: total,
                    artists: artists,
                });
            } else {
                res.status(404).send({message: 'No hay artistas cargados...'});
            }
        }
    });
}

function saveArtist(req, res){

    var artist = new Artist();
    var params = req.body;

    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';
    if (artist.name != null && artist.description != null) {
        artist.save((err, artistStored) => {
            if (err) {
                res.status(500).send({message: 'Error al guardar el artista'});
            } else {
                if (!artistStored) {
                    res.status(404).send({message: 'El artista no se pudo guardar'});
                } else {
                    res.status(200).send({artist: artistStored});
                }
                
            }
        });
    } else {
        res.status(200).send({message: 'Completar todos los campos...'});
    }
    
}

function updateArtist(req, res){
    var artistId = req.params.id;
    var update = req.body;

    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
        if (err) {
            res.status(500).send({message: 'Error al actualizar el artista'});
        } else {
            if (!artistUpdated) {
                res.status(404).send({message: 'El artista no se pudo actualizar, el mismo no se encontro'});
            } else {
                res.status(200).send({artist: artistUpdated});
            }
            
        }
    });
}

function deleteArtist(req, res){
    var artistId = req.params.id;
    
    Artist.findByIdAndRemove(artistId, (err, artistRemoved) => {
        if (err) {
            res.status(500).send({message: 'Error al intentar borrar el artista'});
        } else {
            if (!artistRemoved) {
                res.status(404).send({message: 'El artista no se pudo borrar...'});
            } else {   
                Album.find({artist: artistRemoved._id}).remove((err, albumRemoved) => {
                    if (err) {
                        res.status(500).send({message: 'Error al intentar borrar el album'});
                    } else {
                        if (!albumRemoved) {
                            res.status(404).send({message: 'El album no se pudo borrar...'});
                        } else {
                            Song.find({album: albumRemoved._id}).remove((err, songRemoved) => {
                                if (err) {
                                    res.status(500).send({message: 'Error al intentar borrar la canción'});
                                } else {
                                    if (!songRemoved) {
                                        res.status(404).send({message: 'La canción no se pudo borrar...'});
                                    } else {
                                        res.status(200).send({artist: artistRemoved});
                                    }
                                }
                            });
                        }
                    }
                });
            }
            
        }
    });

}

function uploadImage(req, res){
    var artistId = req.params.id;
    var file_name = 'No subido...';

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_file = file_name.split('.')[1].toLowerCase();
        
        //console.log(ext_file);
        if (ext_file == 'jpg' || ext_file == 'png' || ext_file == 'gif') {
            //subir imagen
            Artist.findByIdAndUpdate(artistId, {image: file_name}, (err, artistUpdated) => {
                if (err) {
                    res.status(500).send({message: 'Error al intentar actualizar el artista'});
                } else {
                    if (!artistUpdated) {
                        res.status(404).send({message: 'No se pudo actualizar el artista'});
                    } else {
                        res.status(200).send({artist: artistUpdated});
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
    var  path_file = './uploads/artists/' + imageFile;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: 'La imagen no existe...'});
        }
    })
}

module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile,
};
