import { useState } from 'react';
import { generateUUID } from '../../utils.js';

const KCOLS = ['backlog', 'up next', 'in progress', 'done'];
const KCOL_BG = ['#f9f9f9', '#f0f4ff', '#f5f0ff', '#f0fff4'];

const getTagColor = (tag) => {
  const colors = {
    coding: { bg: '#ede7f6', text: '#512da8' },
    depth: { bg: '#e0f2f1', text: '#00695c' },
    project: { bg: '#f3e5f5', text: '#6a1b9a' },
    interview: { bg: '#fff3e0', text: '#e65100' },
    mindset: { bg: '#e3f2fd', text: '#1565c0' },
  };
  return colors[tag] || { bg: '#f0f0f0', text: '#333' };
};

export default function KanbanTab({ kanban, setKanban }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('coding');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNote, setEditNote] = useState('');

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    setKanban([...kanban, {
      id: generateUUID(),
      col: 0,
      title: newTaskTitle,
      tag: newTaskTag,
      note: '',
    }]);
    setNewTaskTitle('');
  };

  const moveTask = (id, direction) => {
    setKanban(kanban.map(t => t.id === id ? { ...t, col: Math.max(0, Math.min(3, t.col + direction)) } : t));
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditNote(task.note || '');
  };

  const saveEdit = (id) => {
    setKanban(kanban.map(t => t.id === id ? { ...t, title: editTitle, note: editNote } : t));
    setEditingId(null);
  };

  const deleteTask = (id) => {
    if (confirm('Delete this task?')) {
      setKanban(kanban.filter(t => t.id !== id));
    }
  };

  return (
    <div className="panel active" style={{ padding: '1rem' }}>
      <p className="tip">Move cards as you make progress. Cards persist week to week.</p>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '8px' }}>
        <input type="text" placeholder="Add new task" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()} style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem' }} />
        <select value={newTaskTag} onChange={(e) => setNewTaskTag(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <option value="coding">Coding</option>
          <option value="depth">Depth</option>
          <option value="project">Project</option>
          <option value="interview">Interview</option>
          <option value="mindset">Mindset</option>
        </select>
        <button onClick={addTask} style={{ padding: '8px 16px', background: '#534AB7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>Add</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {KCOLS.map((col, ci) => {
          const colTasks = kanban.filter(c => c.col === ci);
          return (
          <div key={col} style={{ background: KCOL_BG[ci], borderRadius: '8px', padding: '12px', minHeight: '500px' }}>
            <div style={{ fontWeight: '600', marginBottom: '12px', fontSize: '0.9rem', color: '#333' }}>
              {col} ({colTasks.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {colTasks.map(card => {
                const tagColor = getTagColor(card.tag);
                return (
                  <div key={card.id} style={{ background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.85rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minHeight: '60px' }}>
                    {editingId === card.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ width: '100%', padding: '4px', fontSize: '0.85rem', border: '1px solid #ddd', borderRadius: '3px' }} />
                        <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Note" style={{ width: '100%', padding: '4px', fontSize: '0.85rem', border: '1px solid #ddd', borderRadius: '3px', minHeight: '40px', resize: 'none' }} />
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => saveEdit(card.id)} style={{ flex: 1, padding: '4px', background: '#0F6E56', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.8rem' }}>Save</button>
                          <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: '4px', background: '#999', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontWeight: '500', marginBottom: '4px', color: '#222' }}>{card.title}</div>
                        <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7rem', background: tagColor.bg, color: tagColor.text, marginBottom: '4px' }}>
                          {card.tag}
                        </span>
                        {card.note && <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px', fontStyle: 'italic' }}>{card.note}</div>}
                        <div style={{ display: 'flex', gap: '3px', marginTop: '8px', flexWrap: 'wrap' }}>
                          {ci > 0 && <button onClick={() => moveTask(card.id, -1)} style={{ padding: '3px 6px', fontSize: '0.75rem', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer' }}>← back</button>}
                          {ci < 3 && <button onClick={() => moveTask(card.id, 1)} style={{ padding: '3px 6px', fontSize: '0.75rem', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer' }}>forward →</button>}
                          <button onClick={() => startEdit(card)} style={{ padding: '3px 6px', fontSize: '0.75rem', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer' }}>edit</button>
                          <button onClick={() => deleteTask(card.id)} style={{ padding: '3px 6px', fontSize: '0.75rem', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer' }}>✕</button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
}
