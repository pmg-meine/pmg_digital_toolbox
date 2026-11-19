import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export type Subject = 'Physik' | 'Informatik' | 'Mathematik';
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
    slug: 'ohmsches-gesetz',
    component: lazy(() => import('../tools/ohmsches-gesetz/OhmsLaw')),
    title: 'Ohmsches Gesetz',
    subject: 'Physik',
    description: 'Spannung und Widerstand verändern und die Stromstärke beobachten.',
    grades: 'Jg. 8–10',
    tags: ['Stromstärke', 'Spannung', 'Widerstand', 'Elektrizität'],
    learningGoal: 'Den Zusammenhang I = U / R experimentell untersuchen.',
    exampleActivity: 'Verdopple die Spannung. Was passiert mit der Stromstärke?',
    badge: 'Simulation',
    icon: '⚡',
  },
  {
    slug: 'stack-container',
    component: lazy(() => import('../tools/stack-container/StackContainer')),
    title: 'Stack visualisieren',
    subject: 'Informatik',
    description: 'Push und Pop in einem begrenzten Stapelspeicher nachvollziehen.',
    grades: 'Jg. 10–12',
    tags: ['Stack', 'ADT', 'LIFO', 'Datenstrukturen'],
    learningGoal: 'Das LIFO-Prinzip anhand von Stack-Operationen erklären.',
    exampleActivity: 'Lege drei Container ab und entferne zwei. Welcher ist oben?',
    badge: 'Interaktiv',
    icon: '▤',
  },
  {
    slug: 'bruchteile',
    component: lazy(() => import('../tools/bruchteile/Fractions')),
    title: 'Bruchteile entdecken',
    subject: 'Mathematik',
    description: 'Zähler und Nenner einstellen und Bruchteile direkt vergleichen.',
    grades: 'Jg. 5–7',
    tags: ['Brüche', 'Anteile', 'Zähler', 'Nenner'],
    learningGoal: 'Bruchteile als Anteile eines Ganzen interpretieren.',
    exampleActivity: 'Stelle 1/2 und 2/4 ein. Was fällt dir auf?',
    badge: 'Visualisierung',
    icon: '◴',
  },
];

export const subjects = ['Alle', 'Physik', 'Informatik', 'Mathematik'] as const;
export const subjectTheme: Record<Subject, string> = {
  Physik: 'blue',
  Informatik: 'violet',
  Mathematik: 'green',
};
