import { useState } from "react";
import { bitNames, flip, groups, parityPositions, randomWord, syndrome } from "./hamming";
import "./hamming.css";

type Bit = number | null;
const isParity = (index: number) => parityPositions.includes(index);
const randomIndex = (length: number) => Math.floor(Math.random() * length);

function createExercise1() {
  const solution = randomWord();
  return { solution, answer: solution.map((bit, index) => isParity(index) ? null : bit) as Bit[] };
}
function createExercise2() {
  let word = randomWord();
  const wrong: number[] = [];
  if (randomIndex(2)) {
    const positions = [...parityPositions];
    const count = randomIndex(10) < 7 ? 1 : 2;
    for (let i = 0; i < count; i++) {
      const index = positions.splice(randomIndex(positions.length), 1)[0];
      wrong.push(index);
      word = flip(word, index);
    }
  }
  return { word, wrong };
}
function createExercise3() {
  const solution = randomWord();
  const position = randomIndex(7);
  const received = flip(solution, position);
  return { solution, position, received, answer: [...received] };
}

function Bits({ values, onChange, marked = [], parityOnly = false }: { values: Bit[]; onChange?: (index: number) => void; marked?: number[]; parityOnly?: boolean }) {
  return <div className="hamming-bits">{values.map((value, index) => {
    const content = <><small>{bitNames[index]}</small><strong>{value ?? "?"}</strong><small>c{index + 1}</small></>;
    const className = `hamming-bit ${isParity(index) ? "parity" : "data"} ${marked.includes(index) ? "marked" : ""}`;
    return onChange && (!parityOnly || isParity(index))
      ? <button type="button" key={index} className={className} onClick={() => onChange(index)} aria-label={`${bitNames[index]}, Stelle c${index + 1}, Wert ${value ?? "unbestimmt"}${marked.includes(index) ? ", markiert" : ""}`}>{content}</button>
      : <div key={index} className={className}>{content}</div>;
  })}</div>;
}

function GroupLines({ word }: { word: number[] }) {
  return <div className="hamming-explanation">{groups.map((group, index) => {
    const sum = group.reduce((total, position) => total + word[position], 0);
    return <div key={index}>Gruppe von p{index} ({group.map((position) => bitNames[position]).join(", ")}): {group.map((position) => word[position]).join(" + ")} = {sum} → {sum % 2 ? "ungerade ✗" : "gerade ✓"}</div>;
  })}</div>;
}

export default function HammingCode() {
  const [task, setTask] = useState(1);
  const [one, setOne] = useState(createExercise1);
  const [two, setTwo] = useState(createExercise2);
  const [three, setThree] = useState(createExercise3);
  const [mode, setMode] = useState<"correct" | "incorrect" | null>(null);
  const [marks, setMarks] = useState<number[]>([]);
  const [position, setPosition] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [hint, setHint] = useState(false);

  function clearFeedback() { setFeedback(""); setShowDetails(false); }
  function switchTask(next: number) { setTask(next); clearFeedback(); setHint(false); }
  function newExercise() {
    if (task === 1) setOne(createExercise1());
    if (task === 2) { setTwo(createExercise2()); setMode(null); setMarks([]); }
    if (task === 3) { setThree(createExercise3()); setPosition(""); }
    clearFeedback(); setHint(false);
  }
  function check() {
    setShowDetails(false);
    if (task === 1) {
      if (one.answer.some((bit) => bit === null)) { setFeedback("Bitte lege zuerst alle drei Paritätsbits fest."); return; }
      const wrong = parityPositions.filter((index) => one.answer[index] !== one.solution[index]);
      if (wrong.length) setFeedback(`${3 - wrong.length} von 3 Paritätsbits stimmen. Rechne ${wrong.map((index) => bitNames[index]).join(" und ")} noch einmal nach.`);
      else { setFeedback(`Richtig! Codewort: ${one.solution.join(" ")}`); setShowDetails(true); }
    } else if (task === 2) {
      if (!mode) setFeedback("Entscheide zuerst, ob der Code korrekt oder fehlerhaft ist.");
      else if (mode === "correct" && two.wrong.length === 0) { setFeedback("Richtig! Alle Kontrollgruppen haben eine gerade Anzahl an Einsen."); setShowDetails(true); }
      else if (mode === "correct") setFeedback("Nicht ganz. Dieser Code enthält falsch berechnete Paritätsbits.");
      else if (!two.wrong.length) setFeedback("Nicht ganz. Dieser Code wurde korrekt erstellt.");
      else if (!marks.length) setFeedback("Der Code ist fehlerhaft. Markiere nun die falsch berechneten Paritätsbits.");
      else if (marks.length === two.wrong.length && marks.every((index) => two.wrong.includes(index))) { setFeedback(`Richtig! Die falsch berechneten Paritätsbits sind ${two.wrong.map((index) => bitNames[index]).join(", ")}.`); setShowDetails(true); }
      else setFeedback("Der Code ist fehlerhaft, aber deine Markierung stimmt nicht. Berechne jedes Paritätsbit neu.");
    } else {
      if (!position) { setFeedback("Wähle zuerst die Stelle aus, an der du den Fehler vermutest."); return; }
      const positionCorrect = Number(position) === three.position;
      const wordCorrect = three.answer.every((bit, index) => bit === three.solution[index]);
      if (positionCorrect && wordCorrect) { setFeedback(`Richtig! Der Fehler lag an Stelle c${three.position + 1}. Korrektes Codewort: ${three.solution.join(" ")}`); setShowDetails(true); }
      else if (positionCorrect) setFeedback("Die Fehlerstelle stimmt, aber dein korrigiertes Wort nicht. Verändere genau ein Bit gegenüber dem empfangenen Wort.");
      else if (wordCorrect) setFeedback("Dein korrigiertes Wort ist richtig, aber die angegebene Stelle nicht.");
      else setFeedback("Leider falsch. Prüfe alle drei Kontrollgruppen auf gerade Parität.");
    }
  }
  const detailWord = task === 1 ? one.solution : task === 2 ? two.word : three.received;
  return <div className="sim-content hamming">
    <div className="sim-topline"><span className="sim-eyebrow">INFORMATIK · HAMMING-CODE (7,4)</span><span className="sim-note">Codieren, prüfen und korrigieren</span></div>
    <section className="hamming-panel"><h2>Merkblatt</h2><p>Der (7,4)-Hamming-Code ergänzt vier Datenbits um drei Paritätsbits. Bei gerader Parität enthält jede Kontrollgruppe eine gerade Anzahl an Einsen. Die Reihenfolge ist <code>p0 p1 d0 p2 d1 d2 d3</code> (c1 bis c7).</p>
      <table><thead><tr><th>Prüfbit</th><th>d0</th><th>d1</th><th>d2</th><th>d3</th></tr></thead><tbody><tr><th>p0</th><td>✕</td><td>✕</td><td>–</td><td>✕</td></tr><tr><th>p1</th><td>✕</td><td>–</td><td>✕</td><td>✕</td></tr><tr><th>p2</th><td>–</td><td>✕</td><td>✕</td><td>✕</td></tr></tbody></table><p>Beispiel: <code>p0 = d0 ⊕ d1 ⊕ d3</code>. ⊕ bezeichnet die Addition modulo 2.</p></section>
    <nav className="hamming-actions" aria-label="Aufgabe auswählen">{["Codieren", "Prüfen", "Korrigieren"].map((name, index) => <button type="button" key={name} className={`tab ${task === index + 1 ? "active" : ""}`} aria-current={task === index + 1 ? "step" : undefined} onClick={() => switchTask(index + 1)}>Aufgabe {index + 1}: {name}</button>)}</nav>
    <section className="hamming-panel"><h2>Aufgabe {task} – {task === 1 ? "Hammingcode erstellen" : task === 2 ? "Hammingcode überprüfen" : "Fehler finden und korrigieren"}</h2>
      {task === 1 && <><p>Bestimme die Paritätsbits p0, p1 und p2. Klicke auf ein Prüfbit, um es von ? auf 0 oder 1 zu setzen.</p><Bits values={one.answer} parityOnly onChange={(index) => { if (!isParity(index)) return; setOne({ ...one, answer: one.answer.map((bit, i) => i === index ? bit === null ? 0 : bit ^ 1 : bit) }); clearFeedback(); }} /></>}
      {task === 2 && <><p>Ist der Hammingcode richtig berechnet? Falls nicht, markiere die falsch berechneten Paritätsbits.</p><Bits values={two.word} marked={marks} parityOnly onChange={mode === "incorrect" ? (index) => { if (!isParity(index)) return; setMarks(marks.includes(index) ? marks.filter((mark) => mark !== index) : [...marks, index]); clearFeedback(); } : undefined} /><div className="hamming-actions"><button className={mode === "correct" ? "primary-button" : "secondary-button"} aria-pressed={mode === "correct"} onClick={() => { setMode("correct"); setMarks([]); clearFeedback(); }}>Code ist korrekt</button><button className={mode === "incorrect" ? "primary-button" : "secondary-button"} aria-pressed={mode === "incorrect"} onClick={() => { setMode("incorrect"); clearFeedback(); }}>Code ist fehlerhaft</button></div>{mode === "incorrect" && <p>Wähle die falsch berechneten Paritätsbits aus. Ausgewählte Bits sind mit „markiert“ gekennzeichnet.</p>}</>}
      {task === 3 && <><p>Das empfangene Wort enthält genau einen 1-Bit-Fehler. Wähle die Fehlerstelle und korrigiere das untere Wort.</p><p>Empfangenes Wort</p><Bits values={three.received} /><p>Dein korrigiertes Wort (Bits anklicken zum Ändern)</p><Bits values={three.answer} marked={three.answer.flatMap((bit, index) => bit !== three.received[index] ? [index] : [])} onChange={(index) => { setThree({ ...three, answer: flip(three.answer, index) }); clearFeedback(); }} /><label htmlFor="hamming-position">Fehler an Stelle: </label><select id="hamming-position" value={position} onChange={(event) => { setPosition(event.target.value); clearFeedback(); }}><option value="">– wählen –</option>{bitNames.map((name, index) => <option key={name} value={index}>c{index + 1} ({name})</option>)}</select></>}
      <div className="hamming-actions"><button className="primary-button" onClick={check}>Prüfen</button><button className="secondary-button" onClick={() => setHint(!hint)} aria-expanded={hint}>Hinweis</button><button className="secondary-button" onClick={newExercise}>Neu</button></div>
      <div role="status" className="hamming-feedback">{feedback}{showDetails && <><GroupLines word={detailWord} />{task === 3 && <p>Fehlgeschlagene Gruppen: {syndrome(three.received).map((bit, index) => bit ? `p${index}` : null).filter(Boolean).join(", ")} → Stelle {syndrome(three.received).reduce((sum, bit, index) => sum + bit * 2 ** index, 0)}</p>}</>}</div>
      {hint && <div className="hamming-hint"><strong>Hinweis:</strong> {task === 1 ? <>Wähle jedes Paritätsbit so, dass seine Kontrollgruppe eine gerade Anzahl an Einsen enthält. Die Datenbits sind {one.solution.filter((_, index) => !isParity(index)).join(", ")}.<br />p0 = d0 ⊕ d1 ⊕ d3<br />p1 = d0 ⊕ d2 ⊕ d3<br />p2 = d1 ⊕ d2 ⊕ d3</> : <>Prüfe jede Kontrollgruppe auf gerade Parität. {task === 3 ? "Der Fehler liegt genau in den ungeraden Gruppen." : "Vergleiche die Paritätsbits mit den Datenbits."}<GroupLines word={detailWord} /></>}</div>}
    </section>
  </div>;
}
