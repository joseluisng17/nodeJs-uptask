const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');

exports.proyectosHome = async(req, res) => {

    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({ where: { usuarioId } });

    res.render('index', {
        nombrePagina: 'Proyectos ' + res.locals.year,
        proyectos
    });
}

exports.formularioProyecto = async(req, res) => {
    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({ where: { usuarioId } });

    res.render('nuevoProyecto', {
        nombrePagina: 'Nuevo Proyecto',
        proyectos
    });
}

exports.nuevoProyecto = async(req, res) => {

    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({ where: { usuarioId } });

    // Enviar a la consola lo que el usuario esriba.
    // console.log(req.body);

    // Validar que tengamos algo en le input
    const { nombre } = req.body;

    let errores = [];

    if (!nombre) {
        errores.push({ 'texto': 'Agrega un nombre al proyecto' });
    }

    // si hay errores
    if (errores.length > 0) {
        res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo Proyecto',
            errores,
            proyectos
        })
    } else {
        // no hay errores
        // insertar en la DB.
        const usuarioId = res.locals.usuario.id;
        await Proyectos.create({ nombre, usuarioId });
        res.redirect('/');

        /*Proyectos.create({ nombre })
            .then(() => console.log('Insertado Correctamente'))
            .catch(error => console.log(error));*/
    }
}

exports.proyectoPorUrl = async(req, res) => {

    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({ where: { usuarioId } });

    //const proyectos = await Proyectos.findAll();
    const proyecto = await Proyectos.findOne({
        where: {
            url: req.params.url,
            usuarioId
        }
    });

    // Consultar tareas del proyecto actual
    const tareas = await Tareas.findAll({
        where: {
            proyectoId: proyecto.id
        },
        //include: [
        //  { model: Proyctos }
        //]
    });

    if (!proyecto) return next();

    // render a la vista

    res.render('tareas', {
        nombrePagina: 'Tareas del proyecto',
        proyecto,
        proyectos,
        tareas
    });

}

exports.formularioEditar = async(req, res) => {

    const usuarioId = res.locals.usuario.id;
    const proyectosPromise = Proyectos.findAll({ where: { usuarioId } });

    const proyectoPromise = Proyectos.findOne({
        where: {
            id: req.params.id,
            usuarioId
        }
    });
    // Recomendado si tienes multiples consultas que son independientes una de la otra, las coloques dentro de un promise
    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);
    // render a la vista
    res.render('nuevoProyecto', {
        nombrePagina: 'Editar proyecto',
        proyectos,
        proyecto
    });
}

exports.actualizarProyecto = async(req, res) => {

    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({ where: { usuarioId } });

    // Enviar a la consola lo que el usuario esriba.
    // console.log(req.body);

    // Validar que tengamos algo en le input
    const { nombre } = req.body;

    let errores = [];

    if (!nombre) {
        errores.push({ 'texto': 'Agrega un nombre al proyecto' });
    }

    // si hay errores
    if (errores.length > 0) {
        res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo Proyecto',
            errores,
            proyectos
        })
    } else {
        // no hay errores
        // insertar en la DB.
        await Proyectos.update({ nombre: nombre }, { where: { id: req.params.id } });
        res.redirect('/');

        /*Proyectos.create({ nombre })
            .then(() => console.log('Insertado Correctamente'))
            .catch(error => console.log(error));*/
    }
}

exports.eliminarProyecto = async(req, res, next) => {
    // req tiene la información despues usando query o params
    const { urlProyecto } = req.query;

    const resultado = await Proyectos.destroy({ where: { url: urlProyecto } });

    if (!resultado) {
        return next();
    }

    res.status(200).send('proyecto Eliminado correctamente');

}