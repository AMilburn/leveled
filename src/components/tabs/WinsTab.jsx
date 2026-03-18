import { useState } from 'react';

export default function WinsTab({ wins, setWins }) {
  const [newWin, setNewWin] = useState('');

  const addWin = () => {
    if (!newWin.trim()) return;
    setWins([...wins, newWin]);
    setNewWin('');
  };

  return (
    <div className="panel active" style={{ padding: '1rem' }}>
      <p className="tip">Log every win. Solved a problem, good interview moment, shipped code — all of it.</p>

      <div className="add-win" style={{ marginBottom: '1rem' }}>
        <input type="text" placeholder="e.g. Solved sliding window without hints" value={newWin} onChange={(e) => setNewWin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addWin()} />
        <button onClick={addWin} style={{ padding: '5px 13px', background: '#534AB7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>Add</button>
      </div>

      {wins.length === 0 ? (
        <p style={{ fontSize: '12px', color: '#666' }}>No wins yet — add your first one above.</p>
      ) : (
        <div>
          {[...wins].reverse().map((win, idx) => (
            <span key={idx} className="win-chip">{win}</span>
          ))}
        </div>
      )}
    </div>
  );
}
