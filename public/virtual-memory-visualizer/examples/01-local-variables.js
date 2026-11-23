export default {
  id: "01-local-variables",
  label: "2 — Local variables",
  source:
    "public class Main {\n    public static void main(String[] args) {\n        int age = 12;\n        boolean student = true;\n        float height = 1.65f;\n    }\n}\n",
  config: {
    title: "Example 2: Local variables",
    subtitle:
      "Primitive local variables live in a method stack frame.",
    modelNote:
      "Simplified 32-bit word-addressed teaching model: one memory cell per variable, parameter, reference, or object field.",
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
        note: "The local int age is stored in one cell of the main() stack frame.",
        highlight: "main.age",
        frames: [{ id: "main", label: "main()" }],
        memory: [
          {
            id: "main.age",
            label: "age = 12",
            region: "stack",
            frame: "main",
            address: 31,
            value: 12,
          },
        ],
      },
      {
        line: 4,
        note: "student is another local variable in the same stack frame. true is represented by 1 in this teaching model.",
        highlight: "main.student",
        frames: [{ id: "main", label: "main()" }],
        memory: [
          {
            id: "main.age",
            label: "age = 12",
            region: "stack",
            frame: "main",
            address: 31,
            value: 12,
          },
          {
            id: "main.student",
            label: "student = true",
            region: "stack",
            frame: "main",
            address: 30,
            value: 1,
          },
        ],
      },
      {
        line: 5,
        note: "height is also stored in the main() frame. Its cell contains the 32-bit IEEE-754 representation of 1.65f.",
        highlight: "main.height",
        frames: [{ id: "main", label: "main()" }],
        memory: [
          {
            id: "main.age",
            label: "age = 12",
            region: "stack",
            frame: "main",
            address: 31,
            value: 12,
          },
          {
            id: "main.student",
            label: "student = true",
            region: "stack",
            frame: "main",
            address: 30,
            value: 1,
          },
          {
            id: "main.height",
            label: "height = 1.65f",
            region: "stack",
            frame: "main",
            address: 29,
            value: 1070805811,
          },
        ],
      },
    ],
  },
};
