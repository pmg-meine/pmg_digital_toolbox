import example1 from "./examples/00-hello-world.js";
import example2 from "./examples/01-local-variables.js";
import example3 from "./examples/02-stack-frames.js";
import example4 from "./examples/03-call-stack.js";
import example5 from "./examples/04-different-callers.js";
import example6 from "./examples/05-parameters-return.js";
import example7 from "./examples/06-local-parameter-assignment.js";
import example8 from "./examples/06-first-object.js";
import example9 from "./examples/07-array-of-persons.js";
import example10 from "./examples/08-primitive-parameter-copy.js";
import example11 from "./examples/09-object-reference-parameter.js";
import example12 from "./examples/10-stack-growth.js";
import example13 from "./examples/10-heap-stack-collision.js";

export const BUILTIN_EXAMPLES = [
  example1,
  example2,
  example3,
  example4,
  example5,
  example6,
  example7,
  example8,
  example9,
  example10,
  example11,
  example12,
  example13,
];

export const DEFAULT_SOURCE = `public class Main {\n    public static void main(String[] args) {\n        int number = 10;\n        Person person = new Person(20);\n        int result = modify(number, person);\n    }\n\n    static int modify(int x, Person p) {\n        x = x + 5;\n        p.age = p.age + 5;\n        return x;\n    }\n}\n\nclass Person {\n    int age;\n    Person(int age) { this.age = age; }\n}`;
export const DEFAULT_CONFIG = {
  title: "Java Memory Lab",
  subtitle: "32-bit word-addressed teaching model",
  modelNote:
    "Simplified model: one visible memory cell equals one complete 32-bit word. Static/class variables use their own region; objects live on the heap; locals and parameters live on the stack.",
  memory: {
    static: { start: 0, size: 8 },
    heap: { start: 8, size: 16 },
    stack: { start: 24, size: 8 },
  },
  states: [
    {
      line: 2,
      note: "The program enters main(). No modeled variables have been allocated yet, so every memory cell is zero.",
      frames: [{ id: "main", label: "main()" }],
      memory: [],
    },
    {
      line: 3,
      note: "The local int occupies one 32-bit memory cell inside the main() stack frame.",
      highlight: "main.number",
      frames: [{ id: "main", label: "main()" }],
      memory: [
        {
          id: "main.number",
          label: "number",
          region: "stack",
          frame: "main",
          address: 31,
          value: 10,
        },
      ],
    },
    {
      line: 4,
      note: "The local reference is stored in the same main() stack frame and points to the heap.",
      highlight: "main.person",
      frames: [{ id: "main", label: "main()" }],
      memory: [
        {
          id: "main.number",
          label: "number",
          region: "stack",
          frame: "main",
          address: 31,
          value: 10,
        },
        {
          id: "main.person",
          label: "person",
          region: "stack",
          frame: "main",
          address: 30,
          value: 8,
          pointsTo: "person.age",
        },
        {
          id: "person.age",
          label: "Person.age",
          region: "heap",
          address: 8,
          value: 20,
        },
      ],
    },
    {
      line: 8,
      note: "Calling modify creates a second stack frame. Its parameters occupy their own cells above main().",
      highlight: "modify.p",
      frames: [
        { id: "main", label: "main()" },
        { id: "modify", label: "modify()" },
      ],
      memory: [
        {
          id: "main.number",
          label: "number",
          region: "stack",
          frame: "main",
          address: 31,
          value: 10,
        },
        {
          id: "main.person",
          label: "person",
          region: "stack",
          frame: "main",
          address: 30,
          value: 8,
          pointsTo: "person.age",
        },
        {
          id: "modify.x",
          label: "x",
          region: "stack",
          frame: "modify",
          address: 29,
          value: 10,
        },
        {
          id: "modify.p",
          label: "p",
          region: "stack",
          frame: "modify",
          address: 28,
          value: 8,
          pointsTo: "person.age",
        },
        {
          id: "person.age",
          label: "Person.age",
          region: "heap",
          address: 8,
          value: 20,
        },
      ],
    },
    {
      line: 10,
      note: "The two stack frames remain separate while modify() changes the object on the heap.",
      highlight: "person.age",
      frames: [
        { id: "main", label: "main()" },
        { id: "modify", label: "modify()" },
      ],
      memory: [
        {
          id: "main.number",
          label: "number",
          region: "stack",
          frame: "main",
          address: 31,
          value: 10,
        },
        {
          id: "main.person",
          label: "person",
          region: "stack",
          frame: "main",
          address: 30,
          value: 8,
          pointsTo: "person.age",
        },
        {
          id: "modify.x",
          label: "x",
          region: "stack",
          frame: "modify",
          address: 29,
          value: 15,
        },
        {
          id: "modify.p",
          label: "p",
          region: "stack",
          frame: "modify",
          address: 28,
          value: 8,
          pointsTo: "person.age",
        },
        {
          id: "person.age",
          label: "Person.age",
          region: "heap",
          address: 8,
          value: 25,
        },
      ],
    },
  ],
};
