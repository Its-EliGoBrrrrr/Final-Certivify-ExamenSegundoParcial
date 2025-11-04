const express = require("express");
const router = express.Router();
const { login, logout, getProfile, startQuiz, submitAnswers, obtenerPDF, enviarMensaje, pagarExamen, accessMessage } = require("../controllers/examen.controller");
const { verifyToken, verifyIntento, verifyPago, verifyIntentoListo, verifyAprobado, verifyPagoHecho } = require("../middleware/examen.middleware");

// Rutas públicas
router.post("/login", login);

// Rutas protegidas (requieren token)
router.post("/logout", verifyToken, logout);

router.get("/profile", verifyToken, getProfile);

router.post("/goquiz", verifyToken, verifyPago, accessMessage);

router.post("/start", verifyToken, verifyPago, verifyIntento, startQuiz);

router.post("/submit", verifyToken, verifyPago, verifyIntento, submitAnswers);

router.post("/showpdf", verifyToken, verifyPago, verifyIntentoListo, verifyAprobado, accessMessage);

router.post("/pdf", verifyToken, verifyPago, verifyIntentoListo, verifyAprobado, obtenerPDF);

router.post("/mensaje", enviarMensaje);

router.post("/pagar", verifyToken, verifyPagoHecho, pagarExamen);

module.exports = router;
