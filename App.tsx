
import React, { useState, useEffect, useMemo } from 'react';
import { Todo } from './types';
import { getProductivityInsight } from './services/gemini';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  CheckCircle2, 
  Circle,
  Sparkles,
  RefreshCw,
  Eraser,
  CalendarDays
} from 'lucide-react';

const PRESET_BGS = [
  'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&q=80&w=2070'
];

const DAYS = [
  'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'
];

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('zen_todos');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [bgImage, setBgImage] = useState<string>(() => {
    return localStorage.getItem('zen_bg') || PRESET_BGS[0];
  });

  const [inputValue, setInputValue] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const dayIndex = new Date().getDay(); // 0 is Sunday
    return DAYS[dayIndex === 0 ? 6 : dayIndex - 1];
  });
  const [aiTip, setAiTip] = useState<string>('');
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);

  useEffect(() => {
    localStorage.setItem('zen_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('zen_bg', bgImage);
  }, [bgImage]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      day: selectedDay,
      createdAt: Date.now()
    };
    
    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(t => !t.completed));
  };

  const generateTip = async () => {
    setIsLoadingTip(true);
    const tip = await getProductivityInsight(todos);
    setAiTip(tip);
    setIsLoadingTip(false);
  };

  const handleCustomBg = () => {
    const url = prompt('Enter image URL:');
    if (url) setBgImage(url);
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div 
      className="min-h-screen transition-all duration-500 ease-in-out flex flex-col items-center py-12 px-4 relative dark bg-gray-900 text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url("${bgImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-8 bg-black/40 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/10 transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
            <CalendarDays size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            ZenDo
          </h1>
        </div>
        <button 
          onClick={() => setShowBgPicker(!showBgPicker)}
          className="p-2.5 rounded-2xl bg-gray-800/50 hover:bg-gray-800 transition-all border border-white/5 active:scale-90"
        >
          <ImageIcon size={20} className="text-gray-300" />
        </button>
      </div>

      {/* Background Picker */}
      {showBgPicker && (
        <div className="w-full max-w-3xl mb-6 p-4 bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold opacity-70 px-2">Duvar Kağıdı Seç</span>
            <button onClick={handleCustomBg} className="text-xs text-blue-400 hover:underline font-medium px-2">Özel URL</button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {PRESET_BGS.map((url, idx) => (
              <button 
                key={idx}
                onClick={() => { setBgImage(url); setShowBgPicker(false); }}
                className={`h-20 rounded-2xl overflow-hidden border-2 transition-all ${bgImage === url ? 'border-blue-500 scale-95' : 'border-transparent hover:scale-105'}`}
              >
                <img src={url} alt="preset" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="w-full max-w-3xl flex flex-col gap-8">
        
        {/* Input & Day Selector */}
        <div className="flex flex-col gap-4 bg-gray-800/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl">
          <form onSubmit={addTodo} className="relative group flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Yeni bir görev yazın..."
              className="flex-1 p-4 rounded-2xl bg-gray-900/50 backdrop-blur-md border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder-gray-500"
            />
            <button 
              type="submit"
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center shrink-0"
            >
              <Plus size={24} />
            </button>
          </form>
          
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  selectedDay === day 
                    ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* AI Insight */}
        {(todos.length > 0 || aiTip) && (
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-3xl p-5 border border-indigo-500/20 shadow-lg flex items-start gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 shrink-0">
              <Sparkles size={22} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Zen Zekası</p>
                <button 
                  onClick={generateTip} 
                  disabled={isLoadingTip}
                  className="text-xs flex items-center gap-1.5 opacity-60 hover:opacity-100 disabled:opacity-30 transition-opacity text-indigo-300"
                >
                  <RefreshCw size={14} className={isLoadingTip ? 'animate-spin' : ''} />
                  {isLoadingTip ? 'Düşünüyor...' : 'Yenile'}
                </button>
              </div>
              <p className="text-sm leading-relaxed text-gray-300 font-medium">
                {aiTip || "Haftalık planın hakkında bir ipucu ister misin? Yenile butonuna tıkla."}
              </p>
            </div>
          </div>
        )}

        {/* Daily Sections */}
        <div className="flex flex-col gap-10 pb-12">
          {DAYS.map(day => {
            const dayTodos = todos.filter(t => t.day === day);
            return (
              <section key={day} className="flex flex-col gap-4 animate-in fade-in duration-500">
                <div className="flex items-center gap-4 px-2">
                  <h2 className={`text-xl font-bold ${day === selectedDay ? 'text-blue-400' : 'text-gray-400'}`}>
                    {day}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                  <span className="text-xs font-mono text-gray-600 bg-gray-800/50 px-2 py-1 rounded-lg">
                    {dayTodos.length} GÖREV
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {dayTodos.length === 0 ? (
                    <p className="text-sm text-gray-600 italic px-4 py-4 bg-white/5 rounded-2xl border border-dashed border-white/5">
                      Bu gün için planlanmış görev yok.
                    </p>
                  ) : (
                    dayTodos.map(todo => (
                      <div 
                        key={todo.id}
                        className={`group flex items-center gap-4 p-4 rounded-2xl bg-gray-800/40 backdrop-blur-sm border border-white/5 shadow-sm transition-all hover:bg-gray-800/60 ${todo.completed ? 'opacity-40' : ''}`}
                      >
                        <button 
                          onClick={() => toggleTodo(todo.id)}
                          className={`transition-all active:scale-75 ${todo.completed ? 'text-green-500' : 'text-gray-600 hover:text-blue-400'}`}
                        >
                          {todo.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </button>
                        <span className={`flex-1 text-base font-medium transition-all ${todo.completed ? 'line-through decoration-2 decoration-green-500/50 text-gray-500' : 'text-gray-200'}`}>
                          {todo.text}
                        </span>
                        <button 
                          onClick={() => deleteTodo(todo.id)}
                          className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-900/20 rounded-xl transition-all"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Stats & Actions */}
      {todos.length > 0 && (
        <footer className="mt-auto w-full max-w-3xl sticky bottom-8">
          <div className="flex justify-between items-center w-full p-4 bg-gray-900/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
            <div className="px-4">
              <p className="text-sm font-bold text-blue-400">{completedCount} / {todos.length}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Tamamlanan</p>
            </div>
            
            {completedCount > 0 && (
              <button 
                onClick={clearCompleted}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all border border-red-500/20 active:scale-95 text-xs font-bold"
              >
                <Eraser size={16} />
                <span>BİTENLERİ TEMİZLE</span>
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
