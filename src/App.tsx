import { Suspense, useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation, useParams } from "react-router-dom";
import ToolCatalogue from "./components/ToolCatalogue";
import { tools } from "./data/tools";
import VersionSelector from "./components/VersionSelector";
import { channel, readDeveloperMode, saveDeveloperMode } from "./versioning/versions";

function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">
          <span className="eyebrow-dot"></span> PHILIPP MELANCHTHON GYMNASIUM
          MEINE
        </p>
        <h1>
          Entdecken. Verstehen.
          <br />
          <span className="violet-text">Ausprobieren.</span>
        </h1>
        <p className="hero-copy">
          Digitale Werkzeuge und interaktive Simulationen für einen
          anschaulichen Unterricht – direkt im Browser, ohne Anmeldung.
        </p>
        <div className="hero-tags">
          <span>✓ iPad & Computer</span>
          <span>✓ Ohne Installation</span>
        </div>
        <div className="decor-orbit" aria-hidden="true">
          <span>∑</span>
          <span>⚡</span>
          <span>&lt;/&gt;</span>
        </div>
      </section>
      <section className="catalogue-section" aria-label="Werkzeugkatalog">
        <div className="section-heading">
          <div>
            <p className="eyebrow">DEINE WERKZEUGKISTE</p>
            <h2>
              Alle Werkzeuge{" "}
              <span className="count-marker">{tools.length}</span>
            </h2>
          </div>
          <p>Fach auswählen oder gezielt nach einem Thema suchen.</p>
        </div>
        <ToolCatalogue tools={tools} />
      </section>
      <section className="contribute-band">
        <div>
          <p className="eyebrow">VON LEHRKRÄFTEN · FÜR DEN UNTERRICHT</p>
          <h2>Eine Idee für ein neues Tool?</h2>
          <p>Die Toolbox wächst mit guten Ideen aus dem Kollegium.</p>
        </div>
        <Link className="primary-button" to="/ueber">
          Mitmachen <span aria-hidden="true">→</span>
        </Link>
      </section>
    </>
  );
}

function About() {
  return (
    <>
      <section className="simple-page">
        <Link className="back-link" to="/">
          ← Zurück zur Toolbox
        </Link>
        <p className="eyebrow">GEMEINSAM ENTWICKELN</p>
        <h1>Ein Werkzeugkasten für alle Fächer.</h1>
        <p className="large-paragraph">
          Die PMG Digital Toolbox sammelt kleine, interaktive
          Unterrichtswerkzeuge an einem zentralen Ort. Alle Anwendungen laufen
          direkt im Browser, auf iPad und Computer.
        </p>
        <div className="teacher-info">
          <div>
            <h2>Für das Kollegium</h2>
            <p>
              Die Werkzeuge sind frei zugänglich. Teile einfach einen Link im
              Unterricht oder projiziere die Simulation über den Beamer.
            </p>
          </div>
          <div>
            <h2>Neue Ideen einbringen</h2>
            <p>
              Im GitHub-Repository können vorhandene Tools verbessert und neue
              Module ergänzt werden. Das README erklärt den Ablauf.
            </p>
          </div>
        </div>
        <Link className="primary-button" to="/">
          Werkzeuge entdecken →
        </Link>
      </section>
    </>
  );
}

function NotFound() {
  return (
    <section className="simple-page">
      <p className="eyebrow">NICHT GEFUNDEN</p>
      <h1>Diese Seite gibt es leider nicht.</h1>
      <p>Das gesuchte Werkzeug oder die Seite wurde nicht gefunden.</p>
      <Link className="primary-button" to="/">
        Zurück zur Toolbox →
      </Link>
    </section>
  );
}

function ToolPage() {
  const { slug } = useParams();
  const tool = tools.find((entry) => entry.slug === slug);
  if (!tool) {
    return <NotFound />;
  }

  const Simulation = tool.component;
  return (
    <div className="tool-page">
      <Link className="back-link" to="/">
        ← Alle Werkzeuge
      </Link>
      <div className="tool-intro">
        <div>
          <p className="eyebrow">
            {tool.subject.toUpperCase()} · {tool.grades}
          </p>
          <h1>{tool.title}</h1>
          <p>{tool.description}</p>
        </div>
        <span className="tool-format">{tool.badge}</span>
      </div>
      <section
        className="simulation-container"
        aria-label={`${tool.title} – Interaktive Anwendung`}
      >
        <Suspense fallback={<p role="status">Werkzeug wird geladen …</p>}>
          <Simulation />
        </Suspense>
      </section>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const [developerMode, setDeveloperMode] = useState(readDeveloperMode);
  const [confirmation, setConfirmation] = useState(false);
  const taps = useRef<number[]>([]);
  function activateDeveloperMode() {
    const now = Date.now();
    taps.current = [...taps.current.filter((time) => now - time < 3000), now];
    if (taps.current.length === 5) {
      taps.current = [];
      saveDeveloperMode(true);
      setDeveloperMode(true);
      setConfirmation(true);
    }
  }
  const pathname = location.pathname.replace(/\/$/, "");
  const tool = tools.find((entry) => pathname === `/werkzeuge/${entry.slug}`);
  useEffect(() => {
    let title = "PMG Digital Toolbox";
    if (tool) {
      title = `${tool.title} · PMG Digital Toolbox`;
    } else if (pathname === "/ueber") {
      title = "Über das Projekt · PMG Digital Toolbox";
    }
    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        tool?.description ?? "Interaktive Werkzeuge für den Unterricht am PMG.",
      );
  }, [pathname, tool]);
  return (
    <>
      <a
        className="skip-link"
        href="#content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("content")?.focus();
        }}
      >
        Zum Inhalt springen
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link
            to="/"
            className="wordmark"
            aria-label="PMG Digital Toolbox – Startseite"
          >
            <span className="wordmark-pmg">
              PMG
              <span className="plus" aria-hidden="true">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </span>
            </span>
            <span className="wordmark-label">
              DIGITAL
              <br />
              TOOLBOX
            </span>
          </Link>
          <nav aria-label="Hauptnavigation" className="nav-links">
            <Link to="/">Werkzeuge</Link>
            <Link to="/ueber">Über das Projekt</Link>
            <a
              href="https://pmg-meine.de/"
              target="_blank"
              rel="noopener noreferrer"
            >
              PMG Website <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </div>
      </header>
      <main
        id="content"
        tabIndex={-1}
        className={`page-shell${location.pathname.startsWith("/werkzeuge/") ? " wide" : ""}`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ueber" element={<About />} />
          <Route path="/werkzeuge/:slug" element={<ToolPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <span>
            <button className="developer-trigger" type="button" onClick={activateDeveloperMode}><strong>PMG Digital Toolbox</strong></button> · Interaktive Werkzeuge für den
            Unterricht
          </span>
          {(channel === "preview" || developerMode) && <VersionSelector onDisable={() => {
            saveDeveloperMode(false);
            setDeveloperMode(false);
            setConfirmation(false);
          }} />}
          <div className="build-info">
            {import.meta.env.VITE_BUILD_TIME && (
              <span>Build: <time dateTime={import.meta.env.VITE_BUILD_TIME}>{new Date(import.meta.env.VITE_BUILD_TIME).toLocaleString()}</time></span>
            )}
            {import.meta.env.VITE_BUILD_HASH && (
              <span>Commit: <a href={`https://github.com/pmg-meine/pmg_digital_toolbox/commit/${import.meta.env.VITE_BUILD_HASH}`}>{import.meta.env.VITE_BUILD_HASH.slice(0, 7)}</a></span>
            )}
          </div>
          <div className="footer-links">
            {confirmation && <span role="status">Entwicklermodus aktiviert</span>}
            <Link to="/ueber">Projektinformationen</Link>
            <a href="https://github.com/pmg-meine/pmg_digital_toolbox">GitHub</a>
            <a
              href="https://pmg-meine.de/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Schulhomepage ↗
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
