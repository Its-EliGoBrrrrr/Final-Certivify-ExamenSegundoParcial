const users = require("../data/users");
const { createSession, deleteSession } = require("../middleware/examen.middleware");
const QUESTIONS = require("../data/questions");
const preguntasUsadas = [];
const mensajesUsuarios = [];
const PDFDocument = require('pdfkit');
const questions = require("../data/questions");

exports.login = (req, res) => {
  const { cuenta } = req.body || {};
  const contrasena = req.body?.contrasena ?? req.body?.["contraseña"];

  if (!cuenta || !contrasena) {
    return res.status(400).json({
      error: "Faltan campos obligatorios: 'cuenta' y 'contrasena'.",
      ejemplo: { cuenta: "usuario", contrasena: "1234" }
    });
  }

  const match = users.find(u => u.cuenta === cuenta && u.contrasena === contrasena);

  if (!match) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  const token = createSession(match.cuenta);
  
  console.log(`[LOGIN] Usuario: ${match.cuenta} | Token: ${token} | Procede el login`);

  return res.status(200).json({
    mensaje: "Acceso permitido",
    usuario: { cuenta: match.cuenta, nombre: match.nombre },
    token: token
  });
};

exports.logout = (req, res) => {
  const token = req.token; 
  const userId = req.userId; 

  console.log(`[LOGOUT] Usuario en sesión: ${userId} | Token: ${token} | Procede el logout`);

  const deleted = deleteSession(token);

  if (deleted) {
    return res.status(200).json({ 
      mensaje: "Se cerró la sesión correctamente" 
    });
  } else {
    return res.status(404).json({ 
      error: "Sesión no encontrada" 
    });
  }
};

exports.getProfile = (req, res) => {
  const userId = req.userId;

  const user = users.find(u => u.cuenta === userId);

  if (!user) {
    return res.status(404).json({ 
      error: "Usuario no encontrado" 
    });
  }

  return res.status(200).json({
    usuario: { 
      cuenta: user.cuenta,
      nombre: user.nombre
      //...............
    }
  });
};

exports.accessMessage = (req, res) => {
  res.status(200).json({
    message: "Accesso permitido. ¡Éxito!",
  });
};

exports.startQuiz = (req, res) => {
    obtenerPreguntas();
    const publicQuestions = preguntasUsadas.map(({ id, text, options }) => ({
        id, text, options
    }));
    
    res.status(200).json({
        message: "Preguntas listas. ¡Éxito!",
        questions: publicQuestions
    });
};

exports.submitAnswers = (req, res) => {
    const userAnswers = Array.isArray(req.body.answers) ? req.body.answers : [];
    console.log(userAnswers);
    
    const userId = req.userId;
    const usuario = users.find(u => u.cuenta === userId);
    let aprobado = "false";
    let score = 0;
    const details = [];

    for (const q of QUESTIONS) {
        const user = userAnswers.find(a => a.id === q.id);
        if(!user)
          continue;

        const isCorrect = !!user && user.answer === q.correct;

        if (isCorrect) score++;

        details.push({
            id: q.id,
            text: q.text,
            yourAnswer: user ? user.answer : null,
            correctAnswer: q.correct,
            correct: isCorrect
        });
    }

    if(score >= 6){
      aprobado = "true";
      usuario.aprobado = true;
    }

    usuario.realizado = true;

    return res.status(200).json({
        message: "Respuestas evaluadas",
        score,
        aprobado,
        total: preguntasUsadas.length,
        details
    });
};

const obtenerPreguntas = () =>{
    preguntasUsadas.splice(0, preguntasUsadas.length);
    let pregunta;
    let ordenPreguntas = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
    ordenPreguntas = desordenar(ordenPreguntas);
    for(let i = 0; i < 8; i++){
        pregunta = QUESTIONS[ordenPreguntas[i]];
        pregunta.options = desordenar(pregunta.options);
        preguntasUsadas.push(pregunta);
    }
};

const desordenar = (vector) =>{
    let vectorDesordenado = vector.slice();
    for(let i = vectorDesordenado.length-1; i>0; i--){
        let j = Math.floor(Math.random()*(i+1));
        let k = vectorDesordenado[i];
        vectorDesordenado[i] = vectorDesordenado[j];
        vectorDesordenado[j] = k;
    }
    return vectorDesordenado;
};

exports.obtenerPDF = (req, res) => {
  try{
    const fecha = new Date();
    const userId = req.userId;
    const usuario = users.find(u => u.cuenta === userId);
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    //attachment
    res.setHeader('Content-Disposition', 'inline; filename="documento.pdf"');

    doc.on('error', (err) => {
      console.error('Error generando el PDF:', err);
      if(!res.headersSent)
        res.status(500).json({error: "Error al generar el PDF" });
      else
        res.destroy(err);
    });
    
    doc.pipe(res);

    doc.fillColor('#000000').fontSize(14).text(usuario.nombre);
    doc.fillColor('#04012E').fontSize(14).text("CERTIFICADO DE APROBADO - JAVA");
    doc.fillColor('#000000').fontSize(14).text(fecha.toDateString());
    doc.fillColor('#000000').fontSize(14).text("Aguascalientes");

    //Cambiar ...............
    doc.moveDown(0.5);
    doc.image('imagenes/logo.jpeg', { width: 100, height: 100 });
    doc.moveDown(0.5);
    doc.fillColor('#000000').fontSize(14).text("CERTIVIFY");

    doc.moveDown(0.5);
    doc.image('imagenes/FirmaO.png', { width: 178, height: 100 });
    doc.moveDown(0.5);
    doc.fillColor('#000000').fontSize(14).text("Angel Oziel Carrillo Diaz de Leon");
    doc.fillColor('#000000').fontSize(14).text("Instructor");

    doc.moveDown(0.5);
    doc.image('imagenes/FirmaE.png', { width: 178, height: 100 });
    doc.moveDown(0.5);
    doc.fillColor('#000000').fontSize(14).text("Adriano Elijah Dominguez Estrada");
    doc.fillColor('#000000').fontSize(14).text("CEO de la Empresa");

    doc.end();
  }
  catch(error){
    console.error(error);
    return res.status(500).json({ 
      error: "Error al generar el PDF" 
    });
  }
};

exports.enviarMensaje = (req, res) => {
    const { nombre, correo, asunto, mensaje } = req.body || {};

    if (!nombre || !correo || !asunto || !mensaje) {
      return res.status(400).json({
        error: "Faltan campos obligatorios"
      });
    }

    const mensajeNuevo = {
      nombre,
      correo,
      asunto,
      mensaje
    };

    mensajesUsuarios.push(mensajeNuevo);
    console.log(mensajesUsuarios);

    return res.status(200).json({
      mensaje: "Mensaje recibido correctamente"
    });
};

exports.pagarExamen = (req, res) => {
    const { pago } = req.body || {};
    const userId = req.userId;
    const token = req.token; 
    const usuario = users.find(u => u.cuenta === userId);

    if(usuario && (pago === "true" || pago === true)){
      usuario.pago = true;
      return res.status(200).json({
        mensaje: "Pago recibido correctamente",
        token: token
      });
    }
    else{
      return res.status(400).json({
        error: "Hubo un error en el pago"
      });
    }
};
