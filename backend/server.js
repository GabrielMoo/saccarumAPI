require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcrypt')
const passport = require('passport')
const { Strategy: GoogleStrategy } = require('passport-google-oauth20')
const session = require('express-session')

const Usuario = require('./models/models');
const rutasAvatar = require('./routers/avatarRouter');
const rutasDiagnostico = require('./routers/diagnosticoRouter');
const rutasCultivos = require('./routers/cultivosRouter');

const app = express();

// ─── URL del frontend (para redirecciones tras OAuth) ───────
// Cambia esto si tu frontend está en otro origen / puerto
const FRONTEND_URL = 'https://saccarumapi-is4a.onrender.com';

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}))
app.use(express.json())

const path = require('path');
// ... otras configuraciones (express.json, cors, etc.)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ─── Sesiones (necesarias para que Passport guarde el estado OAuth) ─
app.use(session({
    secret: process.env.SESSION_SECRET || 'saccarum-secret-local',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

// ─── MongoDB ────────────────────────────────────────────────
const urlDB = "mongodb://GabMoo:G4br13lm00@ac-ksthoc5-shard-00-00.kvtqf2y.mongodb.net:27017,ac-ksthoc5-shard-00-01.kvtqf2y.mongodb.net:27017,ac-ksthoc5-shard-00-02.kvtqf2y.mongodb.net:27017/saccarumDB?ssl=true&replicaSet=atlas-mfcvm6-shard-0&authSource=admin&appName=ClusterSupernova"
mongoose.connect(urlDB)
    .then(() => console.log("✅ Base de datos conectada exitosamente"))
    .catch((err) => console.error("❌ Error al conectar con la base de datos", err));

// ─── Serialización de sesión (solo guardamos el id) ─────────
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await Usuario.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// ─── Estrategia de Google ────────────────────────────────────
passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://saccarumapi-is4a.onrender.com/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;

            // ¿Ya existe el usuario con este googleId?
            let usuario = await Usuario.findOne({ googleId: profile.id });

            if (!usuario) {
                // ¿Existe un usuario con el mismo correo (registro manual previo)?
                usuario = await Usuario.findOne({ email });

                if (usuario) {
                    // Vinculamos el googleId a la cuenta existente
                    usuario.googleId = profile.id;
                    await usuario.save();
                } else {
                    // Creamos un usuario nuevo
                    usuario = await new Usuario({
                        nombre: profile.displayName,
                        email: email,
                        googleId: profile.id,
                        contrasena: null   // sin contraseña para cuentas Google
                    }).save();
                }
            }

            return done(null, usuario);
        } catch (err) {
            return done(err, null);
        }
    }
));

// ─── Rutas ──────────────────────────────────────────────────

// ── Inicio de flujo OAuth con Google ──
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ── Callback que Google llama después de que el usuario acepta ──
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login-register.html?error=google` }),
    (req, res) => {
        // Determinar si el usuario tiene contraseña
        const hasPassword = !!req.user.contrasena; // true si existe campo contraseña

        const userData = encodeURIComponent(JSON.stringify({
            id: req.user._id,
            nombre: req.user.nombre,
            email: req.user.email,
            hasPassword: hasPassword   // ← agregar bandera
        }));
        res.redirect(`${FRONTEND_URL}/login-register.html?googleUser=${userData}`);
    }
);

// ─── Registro con email/contraseña ──────────────────────────
app.post('/registro', async (req, res) => {
    try {
        const { nombre, email, contrasena } = req.body;

        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(409).json({ mensaje: "El correo electrónico ya está registrado" });
        }

        const contrasenaSegura = await bcrypt.hash(contrasena, 10);
        const usuarioSeguro = new Usuario({ nombre, email, contrasena: contrasenaSegura });

        await usuarioSeguro.save();
        console.log("✅ Usuario guardado en la base de datos");
        res.status(201).json({ mensaje: "Usuario registrado exitosamente" });

    } catch (error) {
        console.error("❌ Error al guardar el usuario:", error);
        res.status(500).json({ mensaje: "Hubo un error interno al registrar el usuario" });
    }
});

// ─── Login con email/contraseña ─────────────────────────────
app.post('/login', async (req, res) => {
    try {
        const { email, contrasena } = req.body;
        const usuarioComparar = await Usuario.findOne({ email });

        if (!usuarioComparar) {
            return res.status(400).send("Correo no encontrado. Verifica que esté escrito correctamente o crea una cuenta.");
        }

        // Usuario que se registró con Google no tiene contraseña
        if (!usuarioComparar.contrasena) {
            return res.status(400).json({ mensaje: "Esta cuenta fue creada con Google. Usa el botón 'Iniciar sesión con Google'." });
        }

        const contrasenaValida = await bcrypt.compare(contrasena, usuarioComparar.contrasena);
        if (!contrasenaValida) {
            return res.status(400).send("La contraseña ingresada es incorrecta");
        }

        res.json({
            exito: true,
            mensaje: "Inicio de sesion exitoso",
            usuario: {
                id: usuarioComparar._id,
                nombre: usuarioComparar.nombre,
                email: usuarioComparar.email,
                hasPassword: true    // ← agregar esta línea
            }
        });

    } catch (error) {
        console.error("❌ Error al iniciar sesión:", error);
        res.status(400).send("Hubo un error al iniciar sesión");
    }
});

// ─── Otras rutas ────────────────────────────────────────────
app.use('/api/avatar', rutasAvatar);
app.use('/api/diagnosticos', rutasDiagnostico);
app.use('/api/cultivos', rutasCultivos);

// Cambiar contraseña
app.post('/cambiar-contrasena', async (req, res) => {
    try {
        const { usuarioId, contrasenaActual, nuevaContrasena } = req.body;
        const usuarioDB = await Usuario.findById(usuarioId);

        if (!usuarioDB) {
            return res.status(404).json({ mensaje: "Usuario no encontrado en la base de datos" });
        }

        if (!usuarioDB.contrasena) {
            return res.status(400).json({ mensaje: "Las cuentas de Google no tienen contraseña para cambiar." });
        }

        const contrasenaValida = await bcrypt.compare(contrasenaActual, usuarioDB.contrasena);
        if (!contrasenaValida) {
            return res.status(400).json({ mensaje: "La contraseña actual es incorrecta" });
        }

        usuarioDB.contrasena = await bcrypt.hash(nuevaContrasena, 10);
        await usuarioDB.save();

        console.log("✅ Contraseña actualizada para:", usuarioDB.email);
        res.status(200).json({ mensaje: "Contraseña actualizada exitosamente" });

    } catch (error) {
        console.error("❌ Error al cambiar la contraseña:", error);
        res.status(500).json({ mensaje: "Hubo un error interno en el servidor" });
    }
});

// Historial de diagnósticos
const Diagnostico = require('./models/diagnostico');
app.get('/api/diagnosticos', async (req, res) => {
    try {
        const { usuarioId } = req.query;
        if (!usuarioId) {
            return res.status(400).json({ mensaje: "Se requiere el ID del usuario" });
        }
        const diagnosticos = await Diagnostico.find({ usuario: usuarioId })
            .sort({ fecha: -1 })
            .lean();
        res.status(200).json(diagnosticos);
    } catch (error) {
        console.error("❌ Error al obtener diagnósticos:", error);
        res.status(500).json({ mensaje: "Error del servidor" });
    }
});

// Eliminar cuenta
const Cultivo = require('./models/cultivos');
app.delete('/eliminar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioDB = await Usuario.findById(id);

        if (!usuarioDB) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        await Diagnostico.deleteMany({ usuario: id });
        await Cultivo.deleteMany({ usuario: id });
        await Usuario.findByIdAndDelete(id);

        console.log("✅ Cuenta y datos eliminados para:", usuarioDB.email);
        res.status(200).json({ mensaje: "Cuenta eliminada correctamente" });

    } catch (error) {
        console.error("❌ Error al eliminar la cuenta:", error);
        res.status(500).json({ mensaje: "Hubo un error interno al eliminar la cuenta" });
    }
});

app.listen(2000, () => {
    console.log("🚀 Servidor escuchando en el puerto 2000")
});
