// Requiriendo las dependencias
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegúrate de que la carpeta 'uploads' exista
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configuración de almacenamiento para los archivos subidos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Genera un nombre único
  }
});

const upload = multer({ storage: storage });

// Crear una aplicación express
const app = express();

// Ruta para manejar la carga de archivo de audio
app.post('/analyze', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha cargado un archivo' });
  }

  // Aquí puedes agregar el código para analizar el archivo
  // Por ejemplo, puede ser un código para procesar el audio
  console.log('Archivo recibido:', req.file);

  // Simula una respuesta de análisis
  const data = {
    fileName: req.file.filename,
    jitter: 0.0025,
    shimmer: 0.0102,
    meanF0Hz: 120
  };

  // Enviar la respuesta con los datos de análisis
  res.json(data);
});

// Ruta para servir archivos estáticos (la página HTML)
app.use(express.static('static'));

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
