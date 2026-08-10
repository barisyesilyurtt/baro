import { useState, useEffect } from 'react'
import './App.css'

// ============ COMPONENT ÖRNEĞİ ============
// Props alan bir bileşen
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={todo.completed ? 'completed' : ''}>
      <span onClick={() => onToggle(todo.id)}>
        {todo.completed ? '✅' : '⬜'} {todo.text}
      </span>
      <button onClick={() => onDelete(todo.id)}>🗑️</button>
    </li>
  )
}

// ============ ANA UYGULAMA ============
function App() {
  // STATE: Bileşen içi durum yönetimi
  const [todos, setTodos] = useState([
    { id: 1, text: 'React öğren', completed: false },
    { id: 2, text: 'Node.js öğren', completed: true },
    { id: 3, text: 'Proje yap', completed: false }
  ])
  const [newTodo, setNewTodo] = useState('')
  const [count, setCount] = useState(0)

  // USEEFFECT: Component mount olduğunda çalışır
  useEffect(() => {
    console.log('App component yüklendi!')
    document.title = `Yapılacaklar (${todos.filter(t => !t.completed).length})`
  }, [todos]) // todos değiştiğinde tekrar çalış

  // FONKSİYONLAR
  const addTodo = () => {
    if (!newTodo.trim()) return
    
    setTodos([
      ...todos,
      { id: Date.now(), text: newTodo, completed: false }
    ])
    setNewTodo('')
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  // JSX: Render edilecek UI
  return (
    <div className="app">
      <h1>📝 React Todo App</h1>
      
      {/* STATE ÖRNEĞI: Basit sayaç */}
      <div className="counter-section">
        <h2>State Örneği</h2>
        <p>Sayaç: <strong>{count}</strong></p>
        <button onClick={() => setCount(count + 1)}>+1</button>
        <button onClick={() => setCount(count - 1)}>-1</button>
        <button onClick={() => setCount(0)}>Sıfırla</button>
      </div>

      {/* TODO LİSTESİ */}
      <div className="todo-section">
        <h2>Todo Listesi ({todos.filter(t => !t.completed).length} kalan)</h2>
        
        {/* Input ve Ekleme */}
        <div className="add-todo">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Yeni görev ekle..."
          />
          <button onClick={addTodo}>Ekle</button>
        </div>

        {/* Todo Listesi - Props ile component'e veri geçirme */}
        <ul className="todo-list">
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}           // Props: veri
              onToggle={toggleTodo} // Props: fonksiyon
              onDelete={deleteTodo} // Props: fonksiyon
            />
          ))}
        </ul>
      </div>

      {/* BİLGİ BÖLÜMÜ */}
      <div className="info-section">
        <h2>React Kavramları</h2>
        <ul>
          <li><strong>useState:</strong> Bileşen içi durum yönetimi</li>
          <li><strong>useEffect:</strong> Yan etkiler (API çağrısı, DOM manipülasyonu)</li>
          <li><strong>Props:</strong> Parent → Child veri aktarımı</li>
          <li><strong>Component:</strong> Yeniden kullanılabilir UI parçası</li>
          <li><strong>JSX:</strong> JavaScript içinde HTML benzeri syntax</li>
        </ul>
      </div>
    </div>
  )
}

export default App
