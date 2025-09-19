const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// middleware 
app.use(express.json());
app.use(cors());

// Rotas 
app.use('/api/auth', authRoutes);

// Mensagem 
app.get('/', (req, res) => {
  res.send('API do Deia Ateliê rodando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});