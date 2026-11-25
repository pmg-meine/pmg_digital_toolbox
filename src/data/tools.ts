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
    slug: "lichtausbreitung",
    component: lazy(() => import("../tools/lichtausbreitung/LightPropagation")),
    title: "Lichtausbreitung",
    subject: "Physik",
    description: "Lichtstrahlen und Schatten zwischen verschiebbaren Hindernissen untersuchen.",
    grades: "Jg. 6",
    tags: ["Licht", "Ausbreitung", "Labyrinth", "Lichtstrahlen", "Schatten", "Optik"],
    learningGoal: "Die geradlinige Ausbreitung von Licht und die Entstehung von Schatten untersuchen.",
    exampleActivity: "Zeichne vor dem Einschalten deine Vermutung ein und vergleiche sie mit dem Licht auf dem Schirm.",
    badge: "Simulation",
    icon: "☀",
  },
  {
    slug: "halbschatten-kernschatten",
    component: lazy(() => import("../tools/halbschatten-kernschatten/ShadowSimulation")),
    title: "Halbschatten und Kernschatten",
    subject: "Physik",
    description: "Mit zwei Taschenlampen und einem Klotz Schatten auf einem Schirm untersuchen.",
    grades: "Jg. 6",
    tags: ["Halbschatten", "Kernschatten", "Schatten", "Licht", "Optik"],
    learningGoal: "Untersuchen, wie die Positionen von Lichtquellen und Hindernis Kern- und Halbschatten beeinflussen.",
    exampleActivity: "Vermute die Schattenbereiche und überprüfe sie, indem du die Lampen einzeln und gemeinsam einschaltest.",
    badge: "Simulation",
    icon: "☀",
  },
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
    description: "Java-Programme ausführen und DynArray, Stapel und Schlange im Debugger untersuchen.",
    grades: "Q1–Q2",
    tags: ["ADT", "DynArray", "Stack", "Stapel", "Queue", "Schlange", "Java", "Debugger"],
    learningGoal: "Operationen und internen Aufbau abstrakter Datentypen anhand von Programmzuständen erklären.",
    exampleActivity: "Führe das Beispiel schrittweise aus und vergleiche die abstrakte Sicht mit dem internen Speicher.",
    badge: "Interaktiv",
    icon: "</>",
  },
  {
    slug: "virtual-memory-visualizer",
    component: lazy(() => import("../tools/virtual-memory-visualizer/VirtualMemoryVisualizer")),
    title: "Virtuellen Speicher visualisieren",
    subject: "Informatik",
    description: "Java-Beispiele Schritt für Schritt durchgehen und Speicherzustände betrachten.",
    grades: "Q1–Q2",
    tags: ["Speicher", "Memory", "Heap", "Stack", "Java", "Klassendaten"],
    learningGoal: "Stack, Heap und Klassendaten anhand eines vereinfachten Speichermodells verstehen.",
    exampleActivity: "Gehe ein Java-Beispiel Schritt für Schritt durch und beobachte die Veränderungen im Speicher.",
    badge: "Interaktiv",
    icon: "▦",
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
