VIRTUAL MEMORY VISUALIZER - JSON CONFIGURATION SPECIFICATION
=================================================

Purpose
======-
The Java source code is stored in a separate .java file. The JSON file contains
only the virtual memory layout and a sequence of complete memory snapshots. Each
snapshot is linked to one 1-based source-code line number.

This visualizer deliberately uses a SIMPLE 32-BIT WORD-ADDRESSED TEACHING MODEL.
It is not an attempt to reproduce the physical memory layout of HotSpot or
another JVM.

Each visible memory cell is one complete 32-bit word. Memory addresses therefore
identify words rather than individual bytes. Any address not defined in the
current state contains 0x00000000. States are independent snapshots: no state
inherits values from a previous state and no change/delta calculation is needed.

Canonical JSON structure
========================
{
  "title": "Virtual Memory Visualizer",
  "subtitle": "Optional subtitle",
  "modelNote": "Optional note about the teaching model",

  "memory": {
    "static": { "start": 0,  "size": 8 },
    "heap":   { "start": 8,  "size": 16 },
    "stack":  { "start": 24, "size": 8 }
  },

  "states": [
    {
      "line": 3,
      "note": "Optional explanation shown for this source line.",
      "highlight": "main.number",
      "frames": [
        { "id": "main", "label": "main()" }
      ],

      "memory": [
        {
          "id": "main.number",
          "label": "number",
          "region": "stack",
          "frame": "main",
          "address": 31,
          "value": 10
        },
        {
          "id": "main.person",
          "label": "person",
          "region": "stack",
          "frame": "main",
          "address": 30,
          "value": 8,
          "pointsTo": "person.age"
        },
        {
          "id": "person.age",
          "label": "Person.age",
          "region": "heap",
          "address": 8,
          "value": 20
        }
      ]
    }
  ]
}

Required fields
==============-
memory.static.start  First virtual static/class-data word address.
memory.static.size   Number of 32-bit words in the static/class-data region.
memory.heap.start    First virtual heap word address.
memory.heap.size     Number of 32-bit words in the heap region.
memory.stack.start   First virtual stack word address.
memory.stack.size    Number of 32-bit words in the stack region.
memory.shared        Optional boolean. When true, adjacent heap/stack ranges
                     share free space; their configured sizes are initial
                     display ranges. Static cells remain reserved.
states               Array of complete memory snapshots.

For every state:
  line               1-based source-code line to highlight.
  memory             Complete list of defined memory cells in this state.

Optional per-state stack-frame metadata:
  frames             Array of stack-frame definitions. Each frame has a unique
                     id and an optional human-readable label such as "main()"
                     or "add(int, int)".

For every memory cell:
  id                 Unique identifier within the state.
  region             One of "static", "heap", or "stack".
  address            Word address of the 32-bit cell.
  value              32-bit value stored in the cell. Use an integer in the
                     range -2147483648..4294967295. Negative values are shown
                     using their 32-bit two's-complement representation in hex
                     and binary modes.

Optional fields
==============-
title                UI title.
subtitle             UI subtitle.
modelNote            General note displayed below the memory view.
note                 Explanation shown for the current state/source line.
highlight            id of the memory cell selected initially.
collision            Optional blocked heap/stack allocation: {region, address,
                     label}. address must be the adjacent occupied word in the
                     other region, immediately beyond the requesting allocation
                     frontier. No cell is overwritten; a warning and boundary highlights are shown.
label                Human-readable label for the cell.
pointsTo             id of the heap cell representing the referenced object's
                     base address.
frame                For stack cells only: id of the stack frame containing
                     this variable/parameter. The id should match an entry in
                     the state's frames array.

32-bit teaching-model conventions
================================-
- Total virtual memory: 32 words = 128 bytes conceptually.
- Static / Class Data: word addresses 0..7.
- Heap:                word addresses 8..23.
- Stack:               word addresses 24..31.
- ONE visible memory cell = ONE complete 32-bit word.
- Memory is WORD-ADDRESSED, not byte-addressed.
- Every local variable, parameter, primitive value, reference and object field
  occupies exactly one 32-bit memory cell.
- Static/class variables occupy the Static / Class Data region.
- Arrays use one 32-bit cell per element in this teaching model.
- References contain the WORD ADDRESS of the referenced heap object.
- Undefined addresses contain 0x00000000.
- Stack grows downward one word at a time from address 31.
- Heap grows upward one word at a time from address 8.
- With memory.shared=true, heap and stack may grow into free words between
  their allocation frontiers. Their visible boundary moves with each state.
  Defined heap and stack cells must never overlap or cross one another.
- Static/class data grows upward one word at a time from address 0.
- No byte order/endian concept is shown because individual bytes are deliberately
  hidden from this introductory model.
- No JVM object headers, alignment gaps or padding are modeled.
- Object fields are stored consecutively in declaration order, one word each.
- Method calls create a new logical stack frame by adding parameter/local cells.
- Stack cells belonging to a method invocation should use the same "frame" id.
- A state's optional "frames" array supplies the visible method label for each
  frame. Frame cells should be contiguous in the stack.
- Parameters are copied into the called method's frame.
- Reference parameters contain the same virtual heap word address.
- When a method returns, its stack-frame cells disappear from the next snapshot.
- The addresses are pedagogical virtual addresses, not physical JVM addresses.

Recommended prompt for creating a new JSON file
================================================
"Create a memory-state JSON file for the attached Java source according to the
JSON specification embedded in java_memory_visualizer_simple.html. Use complete
memory snapshots for each relevant source line. Use the simplified 32-bit
word-addressed teaching model: one memory cell per variable/reference/field,
static/class-data word addresses 0..7, heap word addresses 8..23 growing upward, stack word addresses 24..31 growing downward
Undefined addresses contain 0x00000000."

The JSON configuration is intentionally declarative. The HTML visualizer should
render exactly the supplied snapshots and should not execute Java or infer
missing memory contents.
