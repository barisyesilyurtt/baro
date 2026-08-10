// Node.js + Express Backend Örneği
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware'ler
app.use(cors()); // Cross-Origin isteklere izin ver
app.use(express.json()); // JSON body parsing

// Örnek veri (gerçek projede veritabanı kullanılır)
let todos = [
  { id: 1, text: 'React öğren', completed: false },
  { id: 2, text: 'Node.js öğren', completed: true },
  { id: 3, text: 'Proje yap', completed: false }
];

// ============ API ENDPOINT'LERİ ============

// GET - Tüm todo'ları getir
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// GET - Tek bir todo getir
app.get('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo bulunamadı' });
  }
  
  res.json(todo);
});

// POST - Yeni todo ekle
app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text alanı gerekli' });
  }
  
  const newTodo = {
    id: todos.length + 1,
    text,
    completed: false
  };
  
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT - Todo güncelle
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => t.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo bulunamadı' });
  }
  
  todos[todoIndex] = { ...todos[todoIndex], ...req.body };
  res.json(todos[todoIndex]);
});

// DELETE - Todo sil
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => t.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo bulunamadı' });
  }
  
  todos.splice(todoIndex, 1);
  res.json({ message: 'Todo silindi' });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`✅ Sunucu http://localhost:${PORT} adresinde çalışıyor`);
  console.log(`📝 API: http://localhost:${PORT}/api/todos`);
});
