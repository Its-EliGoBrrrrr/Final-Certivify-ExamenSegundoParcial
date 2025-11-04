const PDFdocument = require('pdfkit');

exports.creacionPDF = (dataCallback, endCallback) =>{
    const doc = new PDFdocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', )
    doc.on('data');
    doc.on('end');
};