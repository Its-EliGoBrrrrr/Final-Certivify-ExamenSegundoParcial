const sessions = new Map();
const users = require("../data/users");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Token no proporcionado o formato incorrecto',
      formato_esperado: 'Authorization: Bearer <token>' 
    });
  }

  const token = authHeader.substring(7);

  const userId = sessions.get(token);

  if (!userId) {
    return res.status(401).json({ 
      error: 'Token inválido o expirado' 
    });
  }

  req.userId = userId;
  req.token = token;

  next();
};

exports.createSession = (userId) => {
  const crypto = require('crypto');
  const token = (typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : crypto.randomBytes(32).toString('hex');
  sessions.set(token, userId);
  return token;
};

exports.deleteSession = (token) => {
  return sessions.delete(token);
};

exports.getActiveSessions = () => {
  return sessions.size;
};

exports.clearAllSessions = () => {
  sessions.clear();
};

exports.verifyPago = (req, res, next) => {
    const userId = req.userId; 
    const usuario = users.find(u => u.cuenta === userId);
    
    if (!usuario.pago) {
        return res.status(401).json({ 
        error: 'El pago no se ha realizado' 
        });
    }
    
    next();
};

exports.verifyPagoHecho = (req, res, next) => {
    const userId = req.userId; 
    const usuario = users.find(u => u.cuenta === userId);
    
    if (usuario.pago) {
        return res.status(401).json({ 
        error: 'El pago ya se ha realizado' 
        });
    }
    
    next();
};

exports.verifyIntento = (req, res, next) => {
    const userId = req.userId; 
    const usuario = users.find(u => u.cuenta === userId);
    
    if (usuario.realizado) {
        return res.status(401).json({ 
        error: 'El examen solo se puede realizar una vez' 
        });
    }
    
    next();
};

exports.verifyIntentoListo = (req, res, next) => {
    const userId = req.userId; 
    const usuario = users.find(u => u.cuenta === userId);
    
    if (!usuario.realizado) {
        return res.status(401).json({ 
        error: 'El examen no se ha realizado' 
        });
    }
    
    next();
};

exports.verifyAprobado = (req, res, next) => {
    const userId = req.userId; 
    const usuario = users.find(u => u.cuenta === userId);
    
    if (!usuario.aprobado) {
        return res.status(401).json({ 
        error: 'No se aprobo el examen' 
        });
    }
    
    next();
};