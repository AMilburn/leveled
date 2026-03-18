import { useState } from 'react';
import { WEEKLY_GOALS } from '../../config';

function weekLabel(n) {
  const now = new Date(2026, 2, 15);
  const mon = new Date(now);
  const day = now.getDay() || 7;
  mon.setDate(now.getDate() - (day - 1) + n * 7);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return mon.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' – ' +
         sun.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function ProgressTab({ weekData, setWeekData, pWeek, setPWeek, getOrCreateWeek }) {
  const [saved, setSaved] = useState(false);
  const wd = getOrCreateWeek(pWeek);
  const goals = WEEKLY_GOALS[wd.mode] || WEEKLY_GOALS.normal;

  const updateCount = (key, delta) => {
    setWeekData(prev => {
      const updated = { ...prev };
      const weekKey = `w${pWeek}`;
      updated[weekKey] = { ...wd };
      updated[weekKey].counts[key] = Math.max(0, (wd.counts[key] || 0) + delta);
      return updated;
    });
  };

  const updateReflection = (text) => {
    setWeekData(prev => ({
      ...prev,
      [`w${pWeek}`]: { ...wd, reflection: text },
    }));
  };

  const saveReflection = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const totalCounts = {};
  goals.forEach(d => (totalCounts[d.key] = 0));
  Object.values(weekData).forEach(w => goals.forEach(d => (totalCounts[d.key] += w.counts[d.key] || 0)));

  return (
    <div className="panel active" style={{ padding: '1rem' }}>
      <div className="week-nav">
        <button onClick={() => setPWeek(pWeek - 1)}>← prev</button>
        <span className="week-label">{weekLabel(pWeek)}</span>
        <button onClick={() => setPWeek(pWeek + 1)}>next →</button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 className="sec-title">Weekly counts</h3>
        {goals.map(def => {
          const val = wd.counts[def.key] || 0;
          const progress = Math.min(100, (val / def.goal) * 100);
          return (
            <div key={def.key} className="prog-row" style={{ marginBottom: '12px', flexWrap: 'wrap' }}>
              <span className="prog-label">{def.label}</span>
              <div className="prog-bar-bg" style={{ flex: 1 }}>
                <div className="prog-bar" style={{ width: progress + '%', background: def.color }}></div>
              </div>
              <span className="cnt-val">{val} / {def.goal}</span>
              <button className="cnt-btn" onClick={() => updateCount(def.key, -1)}>−</button>
              <button className="cnt-btn" onClick={() => updateCount(def.key, 1)}>+</button>
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 className="sec-title">Reflection</h3>
        <textarea className="note-area" value={wd.reflection || ''} onChange={(e) => updateReflection(e.target.value)} placeholder="What went well? What felt hard?" />
        <button className="save-btn" onClick={saveReflection}>Save</button>
        {saved && <span style={{ marginLeft: '1rem', fontSize: '12px', color: '#0F6E56' }}>Saved!</span>}
      </div>

      <div>
        <h3 className="sec-title">Cumulative totals</h3>
        {goals.map(def => {
          const total = totalCounts[def.key];
          const cumulativeGoal = def.goal * 13; // 13-week target
          const progress = Math.min(100, (total / cumulativeGoal) * 100);
          return (
            <div key={def.key} className="prog-row">
              <span className="prog-label">{def.label}</span>
              <div className="prog-bar-bg" style={{ flex: 1 }}>
                <div className="prog-bar" style={{ width: progress + '%', background: def.color }}></div>
              </div>
              <span className="cnt-val">{total}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
