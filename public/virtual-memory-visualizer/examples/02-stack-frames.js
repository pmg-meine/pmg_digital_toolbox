export default {
  id: "02-stack-frames",
  label: "3 — Stack frames",
  source:
    "public class Main {\n    public static void main(String[] args) {\n        int number = 10;\n        calculate();\n    }\n\n    static void calculate() {\n        int result = 20;\n        boolean valid = true;\n    }\n}\n",
  config: {
    title: "Example 3: Stack frames",
    subtitle:
      "A method call creates a separate stack frame for its local variables.",
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
        note: "main() has one local variable, so its stack frame currently contains one cell.",
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
        note: "Calling calculate() creates a new stack frame above main(). It starts empty because no local variable has been declared yet.",
        frames: [
          { id: "main", label: "main()" },
          { id: "calculate", label: "calculate()" },
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
        ],
      },
      {
        line: 8,
        note: "result belongs to calculate(), not main(), so it is placed in the new calculate() frame.",
        highlight: "calculate.result",
        frames: [
          { id: "main", label: "main()" },
          { id: "calculate", label: "calculate()" },
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
            id: "calculate.result",
            label: "result = 20",
            region: "stack",
            frame: "calculate",
            address: 30,
            value: 20,
          },
        ],
      },
      {
        line: 9,
        note: "Both local variables of calculate() are grouped in its own stack frame.",
        highlight: "calculate.valid",
        frames: [
          { id: "main", label: "main()" },
          { id: "calculate", label: "calculate()" },
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
            id: "calculate.result",
            label: "result = 20",
            region: "stack",
            frame: "calculate",
            address: 30,
            value: 20,
          },
          {
            id: "calculate.valid",
            label: "valid = true",
            region: "stack",
            frame: "calculate",
            address: 29,
            value: 1,
          },
        ],
      },
      {
        line: 4,
        note: "After calculate() returns, its complete stack frame disappears. main() remains.",
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
