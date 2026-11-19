import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Tool } from '../data/tools';
import { subjects, subjectTheme } from '../data/tools';

export default function ToolCatalogue({ tools }: { tools: Tool[] }) {
  const [subject, setSubject] = useState<string>('Alle');
  const [query, setQuery] = useState('');
  const results = useMemo(() => tools.filter((tool) => {
    const subjectMatches = subject === 'Alle' || tool.subject === subject;
    const text = `${tool.title} ${tool.subject} ${tool.description} ${tool.grades} ${tool.tags.join(' ')}`.toLocaleLowerCase('de');
    return subjectMatches && text.includes(query.trim().toLocaleLowerCase('de'));
  }), [subject, query, tools]);

  return (
    <div>
      <div className="filters">
        <div className="subject-tabs" role="group" aria-label="Fach auswählen">
          {subjects.map((name) => <button key={name} type="button"
            className={name === subject ? 'tab active' : 'tab'}
            aria-pressed={name === subject}
            onClick={() => setSubject(name)}>{name}</button>)}
        </div>
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <span className="visually-hidden">Werkzeuge durchsuchen</span>
          <input type="search" placeholder="Thema oder Werkzeug suchen …" value={query} onChange={(e) => setQuery(e.target.value)}/>
        </label>
      </div>
      <p className="results-count" aria-live="polite">{results.length} {results.length === 1 ? 'Werkzeug' : 'Werkzeuge'} gefunden</p>
      {results.length ? <div className="tool-grid">
        {results.map((tool) => <Link className="tool-card" to={`/werkzeuge/${tool.slug}`} key={tool.slug}>
          <div className={`tool-card-art art-${subjectTheme[tool.subject]}`} aria-hidden="true">
            <span className="card-glyph">{tool.icon}</span><span className="art-corner">✳</span>
          </div>
          <div className="tool-card-body">
            <div className="card-meta"><span className={`subject-pill pill-${subjectTheme[tool.subject]}`}>{tool.subject}</span><span>{tool.grades}</span></div>
            <h3>{tool.title}</h3>
            <p>{tool.description}</p>
            <div className="card-bottom"><span>{tool.badge}</span><span className="card-arrow" aria-hidden="true">↗</span></div>
          </div>
        </Link>)}
      </div> : <div className="empty-state"><strong>Keine passenden Werkzeuge gefunden.</strong><p>Probiere einen anderen Suchbegriff oder wähle „Alle“.</p><button className="secondary-button" onClick={() => { setSubject('Alle'); setQuery(''); }}>Filter zurücksetzen</button></div>}
    </div>
  );
}
