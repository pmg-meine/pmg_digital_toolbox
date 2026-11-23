export default {
  id: "00-hello-world",
  label: "1 — Hello World",
  source:
    'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}\n',
  config: {
    title: "Example 1: Hello World",
    subtitle:
      "A program can run without any modeled local variables.",
    modelNote: "",
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
        note: "Printing a string does not introduce any modeled variables in this example, so all memory cells remain zero.",
        frames: [{ id: "main", label: "main()" }],
        memory: [],
      },
      {
        line: 4,
        note: "main() finishes. Memory is still empty in our simplified model.",
        frames: [{ id: "main", label: "main()" }],
        memory: [],
      },
    ],
  },
};
