import { useState } from 'react';
const MAX = 8;
export default function StackContainer() {
  const [stack, setStack] = useState<string[]>(['A', 'B', 'C']);
  const [next, setNext] = useState('D');
  const [message, setMessage] = useState('Oberstes Element: C');
  function push() {
    if (stack.length >= MAX) { setMessage('Der Stapel ist voll.'); return; }
    const value = next.trim().slice(0, 8) || 'X';
    setStack([...stack, value]); setNext(String.fromCharCode(65 + (stack.length + 1) % 26)); setMessage(`push(${value}): ${value} liegt jetzt oben.`);
  }
  function pop() {
    if (!stack.length) { setMessage('Der Stapel ist leer.'); return; }
    const removed = stack[stack.length - 1];
    setStack(stack.slice(0, -1)); setMessage(`pop(): ${removed} wurde entfernt.`);
  }
  return <div className="sim-content"><div className="sim-topline"><span className="sim-eyebrow">ABSTRAKTE DATENTYPEN</span><span className="sim-note">LIFO – Last In, First Out</span></div>
    <div className="sim-columns">
      <div className="sim-control-panel"><h2>Stack steuern</h2><label className="control-group" htmlFor="stack-next">Nächster Container</label><input id="stack-next" type="text" maxLength={8} value={next} onChange={e => setNext(e.target.value)} />
        <div className="button-line"><button className="primary-button" disabled={stack.length >= MAX} onClick={push}>Push ↓</button><button className="secondary-button" disabled={!stack.length} onClick={pop}>Pop ↑</button></div>
        <p className="status-line" role="status">{message}</p>
        <button className="quiet-button" onClick={() => { setStack([]); setMessage('Der Stapel wurde geleert.'); }}>Stack leeren</button>
      </div>
      <div className="sim-display stack-display"><div className="stack-heading"><strong>Container-Stapel</strong><span>{stack.length} / {MAX} belegt</span></div><div className="stack-view" aria-label={`Stack mit ${stack.length} Elementen`}>
        {Array.from({length: MAX}, (_, i) => {
          const index = MAX - i - 1;
          const value = stack[index];
          return <div key={index} className={value ? 'stack-slot filled' : 'stack-slot'}>{value && <><span>Container {value}</span>{index === stack.length - 1 && <em>TOP</em>}</>}</div>;
        })}
      </div><p className="sim-caption">Nur der oberste Container kann entnommen werden.</p></div>
    </div>
  </div>;
}
