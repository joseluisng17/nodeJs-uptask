const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const crypto = require('crypto');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const bcrypt = require('bcrypt-nodejs');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

// Función para revisar si el usuario esta logeado o no 

exports.usuarioAutenticado = (req, res, next) => {

    // Si el usuario esta autenticado, adelante
    if (req.isAuthenticated()) {
        return next();
    }


    // si no esta autenticado, redirigir al forumlario
    return res.redirect('/iniciar-sesion');
}

// función para cerrar sesión

exports.cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/iniciar-sesion'); // al cerrar sesión nos lleva al login
    })
}

// Genera un token si el usuario es valido

exports.enviarToken = async(req, res) => {
    // Verificar que el usuario exista
    const { email } = req.body
    const usuario = await Usuarios.findOne({ where: { email } });

    // si no existe el usuario

    if (!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/reestablecer');
    }

    // usuario existe
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expiracion = Date.now() + 3600000;

    // Guardarlos en la base de datos
    usuario.save();

    // url de reset
    const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;
    console.log(resetUrl);

    // Envia el correo con el token

    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reestablecer-password'
    });

    // Terminar
    req.flash('correcto', 'Se envió un mensaje a tu correo');
    res.redirect('/iniciar-sesion');
}

exports.validarToken = async(req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token
        }
    });

    // si no encuentra el usuario
    if (!usuario) {
        req.flash('error', 'No valido');
        res.redirect('/reestablecer');
    }

    // formulario para generar el password
    res.render('resetPassword', {
        nombrePagina: 'Reestablecer Constraseña'
    })

}

// Cambia el password por uno nuevo
exports.actualizarPassword = async(req, res) => {

    // Verifica el token valido pero también la fecha de expriación
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token,
            expiracion: {
                [Op.gte]: Date.now()
            }
        }
    });

    // Verificamos si el usuario existe
    if (!usuario) {
        req.flash('error', 'No válido');
        res.redirect('/reestablecer');
    }

    // hashear el nuevo password

    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    usuario.token = null;
    usuario.expiracion = null;

    // Guardamos el nuevo password
    await usuario.save();

    req.flash('correcto', 'Tu password se ha modificado correctamente');
    res.redirect('/iniciar-sesion');

}