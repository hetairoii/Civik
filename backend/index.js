const express = require('express');
const cors = require('cors');
const denunciaRoutes = require('./src/routes/denuncia.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Habilita CORS
app.use(express.json()); // Permite recibir JSON en el body

// Rutas
app.use('/api', denunciaRoutes);

// Ruta base para verificar que el servidor corre
app.get('/', (req, res) => {
    res.send('API de Civik funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
