export default {
  id: "08-primitive-parameter-copy",
  label: "10 — Primitive parameter copy",
  source:
    "public class Main {\n    public static void main(String[] args) {\n        int number = 10;\n        change(number);\n    }\n\n    static void change(int value) {\n        value = 99;\n    }\n}\n",
  config: {
    title: "Example 10: Primitive parameters are copies",
    subtitle:
      "Changing a primitive parameter affects only the callee's copy.",
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
        note: "number belongs to main() and stores the value 10.",
        highlight: "main.number",
        frames: [{ id: "main", label: "main()" }],
        memory: [
          {
            id: "main.number",
            label: "number = 10",
            region: "stack",
            frame: "main",
            address: 31,
            value: 10,
          },
        ],
      },
      {
        line: 7,
        note: "Calling change(number) creates a new frame. The value 10 is copied into the parameter value; these are two different memory cells.",
        highlight: "change.value",
        frames: [
          { id: "main", label: "main()" },
          { id: "change", label: "change(int)" },
        ],
        memory: [
          {
            id: "main.number",
            label: "number = 10",
            region: "stack",
            frame: "main",
            address: 31,
            value: 10,
          },
          {
            id: "change.value",
            label: "value = 10 (copy)",
            region: "stack",
            frame: "change",
            address: 30,
            value: 10,
          },
        ],
      },
      {
        line: 8,
        note: "Only the parameter copy is changed to 99. main.number is still 10 in its own stack frame.",
        highlight: "change.value",
        frames: [
          { id: "main", label: "main()" },
          { id: "change", label: "change(int)" },
        ],
        memory: [
          {
            id: "main.number",
            label: "number = 10",
            region: "stack",
            frame: "main",
            address: 31,
            value: 10,
          },
          {
            id: "change.value",
            label: "value = 99",
            region: "stack",
            frame: "change",
            address: 30,
            value: 99,
          },
        ],
      },
      {
        line: 4,
        note: "After change() returns, its frame disappears. The original variable number is still 10.",
        highlight: "main.number",
        frames: [{ id: "main", label: "main()" }],
        memory: [
          {
            id: "main.number",
            label: "number = 10",
            region: "stack",
            frame: "main",
            address: 31,
            value: 10,
          },
        ],
      },
    ],
  },
};
