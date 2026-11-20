import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export type Subject = "Physik" | "Informatik" | "Mathematik";
export type Tool = {
  slug: string;
  title: string;
  subject: Subject;
  description: string;
  grades: string;
  tags: string[];
  learningGoal: string;
  exampleActivity: string;
  badge: string;
  icon: string;
  component: LazyExoticComponent<ComponentType>;
};

// The catalog is the single source of truth: add an entry when adding a tool.
export const tools: Tool[] = [
  {
    slug: "lichtquellen-lokalisieren",
    component: lazy(() => import("../tools/lichtquellen-lokalisieren/CaveLight")),
    title: "Lichtquellen lokalisieren",
    subject: "Physik",
    description: "Lichtbündel an einer Höhle untersuchen und ihre Lichtquelle finden.",
    grades: "Jg. 6",
    tags: ["Licht", "Lichtquelle", "Lichtstrahlen", "Optik"],
    learningGoal: "Die Lage einer Lichtquelle mithilfe der geradlinigen Ausbreitung von Licht bestimmen.",
    exampleActivity: "Blende die Lichtquelle aus und verlängere die Lichtbündel gedanklich bis zu ihrem Ursprung.",
    badge: "Simulation",
    icon: "☀",
  },
  {
    slug: "ohmsches-gesetz",
    component: lazy(() => import("../tools/ohmsches-gesetz/OhmsLaw")),
    title: "Ohmsches Gesetz",
    subject: "Physik",
    description:
      "Spannung und Widerstand verändern und die Stromstärke beobachten.",
    grades: "Jg. 8–10",
    tags: ["Stromstärke", "Spannung", "Widerstand", "Elektrizität"],
    learningGoal: "Den Zusammenhang I = U / R experimentell untersuchen.",
    exampleActivity:
      "Verdopple die Spannung. Was passiert mit der Stromstärke?",
    badge: "Simulation",
    icon: "⚡",
  },
  {
    slug: "hamming-code",
    component: lazy(() => import("../tools/hamming-code/HammingCode")),
    title: "Hamming-Code (7,4)",
    subject: "Informatik",
    description: "Hammingcodes erstellen, prüfen und Einzelbitfehler korrigieren.",
    grades: "Q1–Q2",
    tags: ["Hamming Code", "Hamming-Code", "Parität", "Fehlerkorrektur"],
    learningGoal: "Hammingcodes mit gerader Parität erstellen und Einzelbitfehler erkennen und korrigieren.",
    exampleActivity: "Bearbeite die drei Aufgaben und vergleiche die Kontrollgruppen bei einem Fehler.",
    badge: "Übung",
    icon: "01",
  },
  {
    slug: "stack-container",
    component: lazy(() => import("../tools/stack-container/StackContainer")),
    title: "Stack visualisieren",
    subject: "Informatik",
    description:
      "Push und Pop in einem begrenzten Stapelspeicher nachvollziehen.",
    grades: "Jg. 10–12",
    tags: ["Stack", "ADT", "LIFO", "Datenstrukturen"],
    learningGoal: "Das LIFO-Prinzip anhand von Stack-Operationen erklären.",
    exampleActivity:
      "Lege drei Container ab und entferne zwei. Welcher ist oben?",
    badge: "Interaktiv",
    icon: "▤",
  },
  {
    slug: "abstract-datatype-visualizer",
    component: lazy(() => import("../tools/abstract-datatype-visualizer/AbstractDatatypeVisualizer")),
    title: "Abstrakte Datentypen visualisieren",
    subject: "Informatik",
    description: "Java-Programme ausführen und DynArray und Stapel im Debugger untersuchen.",
    grades: "Q1–Q2",
    tags: ["ADT", "DynArray", "Stack", "Stapel", "Java", "Debugger"],
    learningGoal: "Operationen und internen Aufbau abstrakter Datentypen anhand von Programmzuständen erklären.",
    exampleActivity: "Führe das Beispiel schrittweise aus und vergleiche die abstrakte Sicht mit dem internen Speicher.",
    badge: "Interaktiv",
    icon: "</>",
  },
  {
    slug: "bruchteile",
    component: lazy(() => import("../tools/bruchteile/Fractions")),
    title: "Bruchteile entdecken",
    subject: "Mathematik",
    description:
      "Zähler und Nenner einstellen und Bruchteile direkt vergleichen.",
    grades: "Jg. 5–7",
    tags: ["Brüche", "Anteile", "Zähler", "Nenner"],
    learningGoal: "Bruchteile als Anteile eines Ganzen interpretieren.",
    exampleActivity: "Stelle 1/2 und 2/4 ein. Was fällt dir auf?",
    badge: "Visualisierung",
    icon: "◴",
  },
];

export const subjects = ["Alle", "Physik", "Informatik", "Mathematik"] as const;
export const subjectTheme: Record<Subject, string> = {
  Physik: "blue",
  Informatik: "violet",
  Mathematik: "green",
};
