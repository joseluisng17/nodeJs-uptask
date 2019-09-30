const express = require('express');
const routes = require('./routes');
const path = require('path');
const bodyPasser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

// Helpers con algunas funciones
const helpers = require('./helpers');

// Crear la conexión a la base de datos
const db = require('./config/db');

// Importar el Modelo
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

db.sync()
    .then(() => console.log('Conectado al Servidor'))
    .catch(error => console.log(error));

// Crear una aplicación de express
const app = express();

// Donde cargar los archivos estaticos
app.use(express.static('public'));

// Habilitar pug
app.set('view engine', 'pug');

// habiltar body parser para leer datos del formulario
app.use(bodyPasser.urlencoded({ extended: true }));

// Agregar los express validator a toda la aplicación
app.use(expressValidator());


// Añadir la carpeta de las vistas
app.set('views', path.join(__dirname, './views'));

// Agregar flash mesages
app.use(flash());

app.use(cookieParser());

// Sesiones nos permiten naveger entre distintas paginas sin volvernos a autenticar
app.use(session({
    secret: 'supersecreto',
    resave: false,
    saveUninitialized: false

}));

app.use(passport.initialize());
app.use(passport.session());

// Pasar var dump a la aplicación
app.use((req, res, next) => {
    console.log(req.user);
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user } || null;
    next();
});

// Aprendiendo middleware
app.use((req, res, next) => {
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});



// Rutas
app.use('/', routes());

app.listen(3000);

//require('./handlers/email');