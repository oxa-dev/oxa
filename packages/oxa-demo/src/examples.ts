export interface Example {
  id: string;
  label: string;
  document: Record<string, unknown>;
}

export const examples: Example[] = [
  {
    id: "hello-world",
    label: "Hello World",
    document: {
      type: "Document",
      children: [
        {
          type: "Paragraph",
          children: [{ type: "Text", value: "Hello, world!" }],
        },
      ],
    },
  },
  {
    id: "heading-and-code",
    label: "Heading + Code",
    document: {
      type: "Document",
      title: [{ type: "Text", value: "Quick Start" }],
      children: [
        {
          type: "Heading",
          level: 1,
          children: [{ type: "Text", value: "Getting Started" }],
        },
        {
          type: "Paragraph",
          children: [
            { type: "Text", value: "Install the package with " },
            { type: "InlineCode", value: "npm install oxa" },
            { type: "Text", value: "." },
          ],
        },
        {
          type: "Code",
          language: "bash",
          value: "npm install oxa",
        },
        { type: "ThematicBreak" },
        {
          type: "Paragraph",
          children: [
            {
              type: "Emphasis",
              children: [{ type: "Text", value: "That's it!" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "rfc0003",
    label: "RFC0003 — Simple Node Types",
    document: {
      type: "Document",
      title: [
        { type: "Text", value: "Water Dissociation: H" },
        {
          type: "Subscript",
          children: [{ type: "Text", value: "2" }],
        },
        { type: "Text", value: "O → H" },
        {
          type: "Superscript",
          children: [{ type: "Text", value: "+" }],
        },
        { type: "Text", value: " + OH" },
        {
          type: "Superscript",
          children: [{ type: "Text", value: "−" }],
        },
      ],
      children: [
        {
          type: "Heading",
          level: 1,
          children: [{ type: "Text", value: "Introduction" }],
        },
        {
          type: "Paragraph",
          children: [
            { type: "Text", value: "Water (H" },
            {
              type: "Subscript",
              children: [{ type: "Text", value: "2" }],
            },
            { type: "Text", value: "O) undergoes " },
            {
              type: "Strong",
              children: [{ type: "Text", value: "autoionization" }],
            },
            {
              type: "Text",
              value:
                ", a process in which a water molecule donates a proton to another. The equilibrium constant for this reaction, ",
            },
            {
              type: "Emphasis",
              children: [
                { type: "Text", value: "K" },
                {
                  type: "Subscript",
                  children: [{ type: "Text", value: "w" }],
                },
              ],
            },
            { type: "Text", value: ", is approximately 10" },
            {
              type: "Superscript",
              children: [{ type: "Text", value: "−14" }],
            },
            { type: "Text", value: " at 25 °C." },
          ],
        },
        { type: "ThematicBreak" },
        {
          type: "Heading",
          level: 2,
          children: [{ type: "Text", value: "Computing the Equilibrium" }],
        },
        {
          type: "Paragraph",
          children: [
            {
              type: "Text",
              value: "The following Python snippet computes ",
            },
            { type: "InlineCode", value: "Kw" },
            { type: "Text", value: " from ion concentrations:" },
          ],
        },
        {
          type: "Code",
          language: "python",
          value:
            'H_plus = 1e-7   # mol/L\nOH_minus = 1e-7  # mol/L\nKw = H_plus * OH_minus\nprint(f"Kw = {Kw:.2e}")  # Kw = 1.00e-14',
        },
        {
          type: "Paragraph",
          children: [
            { type: "Text", value: "You can run this with " },
            { type: "InlineCode", value: "python kw.py" },
            {
              type: "Text",
              value: ". The result confirms the well-known value of ",
            },
            {
              type: "Emphasis",
              children: [
                { type: "Text", value: "K" },
                {
                  type: "Subscript",
                  children: [{ type: "Text", value: "w" }],
                },
              ],
            },
            { type: "Text", value: "." },
          ],
        },
      ],
    },
  },
];
