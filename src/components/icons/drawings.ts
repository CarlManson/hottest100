// Fairest 100 icon set: original drawings on a 24x24 grid.
// Each icon is split into layers so <Icon> can draw it in the 'Riso line' style:
//   body   closed shapes: outlined in the text colour, with an off-register print fill behind
//   line   open strokes that belong to the silhouette (also get the offset print)
//   tint   a lighter print-colour fill on top; [colour, markup] pairs, colour null = print colour
//   ink    solid details in the text colour (eyes, pips, numbers)
//   detail thin strokes in the text colour
//   mark   heavier strokes in the text colour (ticks, exclamation marks)

export interface IconDrawing {
  body?: string;
  line?: string;
  tint?: Array<[string | null, string]>;
  ink?: string;
  detail?: string;
  mark?: string;
}

export const ICONS = {
  "trophy": {
    body: "<path d=\"M6.5 2.5h11v5.5a5.5 5.5 0 0 1-11 0z\"/><path d=\"M10.5 13h3v4.5h-3z\"/><path d=\"M6.5 17.5h11v3.5h-11z\"/>",
    line: "<path d=\"M7 5H4v1.5A3.8 3.8 0 0 0 7.6 10.3M17 5h3v1.5a3.8 3.8 0 0 1-3.6 3.8\"/>",
    tint: [[null, "<path d=\"M12.00 4.40 L12.71 6.23 L14.66 6.33 L13.14 7.57 L13.65 9.47 L12.00 8.40 L10.35 9.47 L10.86 7.57 L9.34 6.33 L11.29 6.23Z\"/>"]],
  },
  "medal-1": {
    body: "<path d=\"M6.5 1.5h4.5l2.2 7h-4.5z\"/><path d=\"M17.5 1.5H13l-2.2 7h4.5z\"/><circle cx=\"12\" cy=\"15\" r=\"6.8\"/>",
    ink: "<text x=\"12\" y=\"18.2\" text-anchor=\"middle\" font-size=\"9\" font-weight=\"900\" font-family=\"system-ui, sans-serif\">1</text>",
    tint: [["#ffd23f", "<circle cx=\"12\" cy=\"15\" r=\"4.6\"/>"]],
  },
  "medal-2": {
    body: "<path d=\"M6.5 1.5h4.5l2.2 7h-4.5z\"/><path d=\"M17.5 1.5H13l-2.2 7h4.5z\"/><circle cx=\"12\" cy=\"15\" r=\"6.8\"/>",
    ink: "<text x=\"12\" y=\"18.2\" text-anchor=\"middle\" font-size=\"9\" font-weight=\"900\" font-family=\"system-ui, sans-serif\">2</text>",
    tint: [["#d9dde6", "<circle cx=\"12\" cy=\"15\" r=\"4.6\"/>"]],
  },
  "medal-3": {
    body: "<path d=\"M6.5 1.5h4.5l2.2 7h-4.5z\"/><path d=\"M17.5 1.5H13l-2.2 7h4.5z\"/><circle cx=\"12\" cy=\"15\" r=\"6.8\"/>",
    ink: "<text x=\"12\" y=\"18.2\" text-anchor=\"middle\" font-size=\"9\" font-weight=\"900\" font-family=\"system-ui, sans-serif\">3</text>",
    tint: [["#e7a274", "<circle cx=\"12\" cy=\"15\" r=\"4.6\"/>"]],
  },
  "crown": {
    body: "<path d=\"M2.5 7.5 7.5 12 12 4.5l4.5 7.5 5-4.5-2 11.5h-15z\"/>",
    ink: "<circle cx=\"12\" cy=\"17.2\" r=\"1.1\"/><circle cx=\"8\" cy=\"17.2\" r=\"1\"/><circle cx=\"16\" cy=\"17.2\" r=\"1\"/>",
    tint: [[null, "<path d=\"M5.2 15.5h13.6l-.5 3.5H5.7z\"/>"]],
  },
  "star": {
    body: "<path d=\"M12.00 2.10 L14.70 8.88 L21.99 9.36 L16.37 14.02 L18.17 21.09 L12.00 17.20 L5.83 21.09 L7.63 14.02 L2.01 9.36 L9.30 8.88Z\"/>",
    tint: [[null, "<path d=\"M12.00 8.00 L13.29 10.82 L16.37 11.18 L14.09 13.28 L14.70 16.32 L12.00 14.80 L9.30 16.32 L9.91 13.28 L7.63 11.18 L10.71 10.82Z\"/>"]],
  },
  "perfect-100": {
    body: "<rect x=\"1.5\" y=\"4\" width=\"21\" height=\"12\" rx=\"3.5\"/>",
    line: "<path d=\"M4 19h16M7 22h10\"/>",
    ink: "<text x=\"12\" y=\"13.6\" text-anchor=\"middle\" font-size=\"9.6\" font-weight=\"900\" font-family=\"system-ui, sans-serif\" letter-spacing=\"-.3\">100</text>",
  },
  "kangaroo": {
    body: "<path d=\"M1.5 21.5C5 21 7.5 19.5 8.8 17.3 7.6 13.8 8.6 9.6 11.6 8.2c1.4-.7 2.4-2 2.9-3.6l.5-2.2 1.2 1.7 1.3-1.5.4 2.5c1.1.5 2.1 1.4 2.1 2.4-1 .4-2.1.5-2.8 1-.3 2-1.3 3.9-2.3 4.9 1.2 1.2 2.1 3.2 1.6 5l2.8.9c.6.3.4 1-.1 1H13c-1.1-.9-1.6-2-1.6-3-2.6 2.4-5.6 3.8-9.9 3.7z\"/>",
    ink: "<circle cx=\"18.1\" cy=\"6\" r=\".9\"/>",
    detail: "<path d=\"M15.2 10.6l2.4 1.6\"/>",
  },
  "fire": {
    body: "<path d=\"M12 1.5c1 4.3 6.5 6.3 6.5 12.5a6.5 6.5 0 0 1-13 0c0-3.2 1.6-5.4 3.2-6.5 0 2.2 1 3.4 2.2 3.4-1.1-3.4 0-6.5 1.1-9.4z\"/>",
    tint: [[null, "<path d=\"M12 12.5c1.2 1.6 2.8 2.7 2.8 4.9a2.8 2.8 0 0 1-5.6 0c0-1.6 1.1-2.8 2.8-4.9z\"/>"]],
  },
  "diamond": {
    body: "<path d=\"M6 3h12l4.5 6.5L12 21.5 1.5 9.5z\"/>",
    detail: "<path d=\"M1.5 9.5h21M6.5 9.5 12 21.5l5.5-12\"/>",
    tint: [[null, "<path d=\"M8.6 3 6.5 9.5h11L15.4 3z\"/>"]],
  },
  "target": {
    body: "<circle cx=\"11\" cy=\"13\" r=\"9.5\"/>",
    line: "<path d=\"M11 13 20 4M17 2.5 V6.8H21.5\"/>",
    ink: "<circle cx=\"11\" cy=\"13\" r=\"2.4\"/>",
    tint: [[null, "<circle cx=\"11\" cy=\"13\" r=\"5.8\"/>"]],
  },
  "dice": {
    body: "<rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\" rx=\"4.5\"/>",
    ink: "<circle cx=\"7.5\" cy=\"7.5\" r=\"1.7\"/><circle cx=\"12\" cy=\"12\" r=\"1.7\"/><circle cx=\"16.5\" cy=\"16.5\" r=\"1.7\"/><circle cx=\"16.5\" cy=\"7.5\" r=\"1.7\"/><circle cx=\"7.5\" cy=\"16.5\" r=\"1.7\"/>",
  },
  "crystal-ball": {
    body: "<circle cx=\"12\" cy=\"10\" r=\"8\"/><path d=\"M5.5 17.5h13l1.8 4h-16.6z\"/>",
    detail: "<path d=\"M7.5 9a4.8 4.8 0 0 1 3.4-3.6\"/>",
    tint: [[null, "<path d=\"M13.50 8.00 L14.26 9.95 L16.35 10.07 L14.74 11.40 L15.26 13.43 L13.50 12.30 L11.74 13.43 L12.26 11.40 L10.65 10.07 L12.74 9.95Z\"/>"]],
  },
  "so-close": {
    body: "<circle cx=\"12\" cy=\"12\" r=\"10\"/>",
    ink: "<circle cx=\"8.6\" cy=\"10\" r=\"1.3\"/><circle cx=\"15.4\" cy=\"10\" r=\"1.3\"/>",
    detail: "<path d=\"M8.3 17c2.2-2 5.2-2 7.4 0\"/>",
    tint: [["#7fc4e3", "<path d=\"M16.3 12.6c.9 1.3 1.5 2.2 1.5 2.9a1.5 1.5 0 0 1-3 0c0-.7.6-1.6 1.5-2.9z\"/>"]],
  },
  "sparkle": {
    body: "<path d=\"M10 2.5c.9 6 3.6 8.7 9.5 9.5-5.9.8-8.6 3.5-9.5 9.5-.9-6-3.6-8.7-9.5-9.5 5.9-.8 8.6-3.5 9.5-9.5z\"/><path d=\"M19 1.5c.4 2.3 1.3 3.2 3.5 3.5-2.2.3-3.1 1.2-3.5 3.5-.4-2.3-1.3-3.2-3.5-3.5 2.2-.3 3.1-1.2 3.5-3.5z\"/>",
    tint: [[null, "<path d=\"M10 8.5c.4 2.3 1.2 3.1 3.5 3.5-2.3.4-3.1 1.2-3.5 3.5-.4-2.3-1.2-3.1-3.5-3.5 2.3-.4 3.1-1.2 3.5-3.5z\"/>"]],
  },
  "luck": {
    body: "<path d=\"M3.5 3h5v8.5a3.5 3.5 0 0 0 7 0V3h5v8.5a8.5 8.5 0 0 1-17 0z\"/>",
    ink: "<circle cx=\"6\" cy=\"9.5\" r=\".9\"/><circle cx=\"6.4\" cy=\"13.5\" r=\".9\"/><circle cx=\"18\" cy=\"9.5\" r=\".9\"/><circle cx=\"17.6\" cy=\"13.5\" r=\".9\"/><circle cx=\"8.6\" cy=\"17.2\" r=\".9\"/><circle cx=\"15.4\" cy=\"17.2\" r=\".9\"/>",
    tint: [[null, "<path d=\"M3.5 3h5v2.6h-5zM15.5 3h5v2.6h-5z\"/>"]],
  },
  "music": {
    body: "<circle cx=\"6.5\" cy=\"18\" r=\"3.2\"/><circle cx=\"17.5\" cy=\"16\" r=\"3.2\"/><path d=\"M8.2 18V6.2L21.2 3v13h-2.2V8.3l-8.6 2.2V18z\"/>",
    tint: [[null, "<path d=\"M10.4 6.6l8.6-2.1v1.6l-8.6 2.1z\"/>"]],
  },
  "headphones": {
    body: "<path d=\"M2.5 13.5h5v8h-2.5a2.5 2.5 0 0 1-2.5-2.5zM21.5 13.5h-5v8h2.5a2.5 2.5 0 0 0 2.5-2.5z\"/>",
    line: "<path d=\"M4.5 15v-3a7.5 7.5 0 0 1 15 0v3\"/>",
    tint: [[null, "<path d=\"M4.8 15.5h1v4h-1zM18.2 15.5h1v4h-1z\"/>"]],
  },
  "megaphone": {
    body: "<path d=\"M2.5 9h4.5L17 4v16L7 15H2.5z\"/><path d=\"M6.5 15l1.7 6h3.2L10 15.6z\"/>",
    line: "<path d=\"M20 9.5a3.2 3.2 0 0 1 0 5\"/>",
    tint: [[null, "<path d=\"M14.5 6.4v11.2l-2-1z\"/>"]],
  },
  "bell": {
    body: "<circle cx=\"12\" cy=\"20\" r=\"2.2\"/><path d=\"M5.5 17v-6a6.5 6.5 0 0 1 13 0v6l2 2h-17z\"/>",
    line: "<path d=\"M12 2v2.5\"/>",
    detail: "<path d=\"M8.5 11a3.5 3.5 0 0 1 2-3\"/>",
  },
  "alarm": {
    body: "<circle cx=\"5.2\" cy=\"5\" r=\"3\"/><circle cx=\"18.8\" cy=\"5\" r=\"3\"/><circle cx=\"12\" cy=\"13\" r=\"8.5\"/>",
    line: "<path d=\"M7 19.5 5 22M17 19.5l2 2.5\"/>",
    detail: "<path d=\"M12 9v4l2.8 1.8\"/>",
    tint: [[null, "<circle cx=\"12\" cy=\"13\" r=\"6\"/>"]],
  },
  "tv": {
    body: "<rect x=\"1.5\" y=\"6.5\" width=\"21\" height=\"14.5\" rx=\"3\"/>",
    line: "<path d=\"M8 2l4 4.5L16 2\"/>",
    ink: "<circle cx=\"19.3\" cy=\"11\" r=\"1.1\"/><circle cx=\"19.3\" cy=\"15\" r=\"1.1\"/>",
    tint: [[null, "<rect x=\"4\" y=\"9\" width=\"12.5\" height=\"9.5\" rx=\"2\"/>"]],
  },
  "play": {
    body: "<path d=\"M6 3.5 20.5 12 6 20.5z\"/>",
  },
  "pause": {
    body: "<rect x=\"5\" y=\"3.5\" width=\"5\" height=\"17\" rx=\"1\"/><rect x=\"14\" y=\"3.5\" width=\"5\" height=\"17\" rx=\"1\"/>",
  },
  "chart": {
    body: "<rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\" rx=\"3\"/>",
    ink: "<rect x=\"6\" y=\"12\" width=\"3\" height=\"6\"/><rect x=\"10.5\" y=\"8.5\" width=\"3\" height=\"9.5\"/><rect x=\"15\" y=\"5.5\" width=\"3\" height=\"12.5\"/>",
  },
  "calendar": {
    body: "<rect x=\"2.5\" y=\"4.5\" width=\"19\" height=\"17\" rx=\"3\"/>",
    line: "<path d=\"M8 2.5v4M16 2.5v4\"/>",
    ink: "<path d=\"M5.5 4.5h13a3 3 0 0 1 3 3V9h-19V7.5a3 3 0 0 1 3-3z\"/><circle cx=\"7.5\" cy=\"13\" r=\"1.1\"/><circle cx=\"12\" cy=\"13\" r=\"1.1\"/><circle cx=\"16.5\" cy=\"13\" r=\"1.1\"/><circle cx=\"7.5\" cy=\"17\" r=\"1.1\"/><circle cx=\"12\" cy=\"17\" r=\"1.1\"/>",
  },
  "people": {
    body: "<circle cx=\"16.5\" cy=\"7\" r=\"3.2\"/><path d=\"M12.5 13.4a5.8 5.8 0 0 1 10 4.1V20h-8z\"/><circle cx=\"9\" cy=\"8\" r=\"3.8\"/><path d=\"M1.5 21a7.5 7.5 0 0 1 15 0z\"/>",
  },
  "robot": {
    body: "<circle cx=\"12\" cy=\"3\" r=\"1.6\"/><rect x=\"1.8\" y=\"11\" width=\"3\" height=\"5\" rx=\"1\"/><rect x=\"19.2\" y=\"11\" width=\"3\" height=\"5\" rx=\"1\"/><rect x=\"4.5\" y=\"7\" width=\"15\" height=\"13\" rx=\"3.5\"/>",
    line: "<path d=\"M12 7V4\"/>",
    ink: "<circle cx=\"9\" cy=\"12.5\" r=\"1.7\"/><circle cx=\"15\" cy=\"12.5\" r=\"1.7\"/>",
    detail: "<path d=\"M9 16.5h6\"/>",
  },
  "save": {
    body: "<path d=\"M3 3h14l4 4v14H3z\"/>",
    ink: "<rect x=\"12.5\" y=\"4.8\" width=\"1.8\" height=\"3\"/>",
    tint: [[null, "<rect x=\"6.5\" y=\"3.8\" width=\"9\" height=\"5\" rx=\".6\"/><rect x=\"6.5\" y=\"13\" width=\"11\" height=\"7.2\" rx=\".6\"/>"]],
  },
  "tag": {
    body: "<path d=\"M2.5 12.5V4a1.5 1.5 0 0 1 1.5-1.5h8.5l9 9.5-9.5 9.5z\"/>",
    ink: "<circle cx=\"7.5\" cy=\"7.5\" r=\"1.8\"/>",
  },
  "lock": {
    body: "<rect x=\"4.5\" y=\"10\" width=\"15\" height=\"11.5\" rx=\"2.5\"/>",
    line: "<path d=\"M8 10.5V7a4 4 0 0 1 8 0v3.5\"/>",
    ink: "<circle cx=\"12\" cy=\"15\" r=\"1.7\"/><path d=\"M11.2 15h1.6l.4 3.5h-2.4z\"/>",
  },
  "unlock": {
    body: "<rect x=\"4.5\" y=\"10\" width=\"15\" height=\"11.5\" rx=\"2.5\"/>",
    line: "<path d=\"M8 10.5V7a4 4 0 0 1 7.6-1.8\"/>",
    ink: "<circle cx=\"12\" cy=\"15\" r=\"1.7\"/><path d=\"M11.2 15h1.6l.4 3.5h-2.4z\"/>",
  },
  "gear": {
    body: "<path d=\"M12.00 2.00 L13.95 2.19 L14.83 5.16 L16.11 5.85 L19.07 4.93 L20.31 6.44 L18.84 9.17 L19.26 10.56 L22.00 12.00 L21.81 13.95 L18.84 14.83 L18.15 16.11 L19.07 19.07 L17.56 20.31 L14.83 18.84 L13.44 19.26 L12.00 22.00 L10.05 21.81 L9.17 18.84 L7.89 18.15 L4.93 19.07 L3.69 17.56 L5.16 14.83 L4.74 13.44 L2.00 12.00 L2.19 10.05 L5.16 9.17 L5.85 7.89 L4.93 4.93 L6.44 3.69 L9.17 5.16 L10.56 4.74Z\"/>",
    ink: "<circle cx=\"12\" cy=\"12\" r=\"1.8\"/>",
    tint: [[null, "<circle cx=\"12\" cy=\"12\" r=\"4.4\"/>"]],
  },
  "download": {
    body: "<path d=\"M2.5 13.5h5.5l1.5 3h5l1.5-3h5.5v7.5h-19z\"/>",
    line: "<path d=\"M12 2.5v9.5M8 8.5l4 4 4-4\"/>",
  },
  "add": {
    body: "<path d=\"M9.5 2.5h5v7h7v5h-7v7h-5v-7h-7v-5h7z\"/>",
  },
  "idea": {
    body: "<path d=\"M8.5 18.5h7v1.8a1.8 1.8 0 0 1-1.8 1.8h-3.4a1.8 1.8 0 0 1-1.8-1.8z\"/><path d=\"M12 1.8a7 7 0 0 1 4 12.8V17H8v-2.4A7 7 0 0 1 12 1.8z\"/>",
    detail: "<path d=\"M10 13.5l2-3 2 3\"/>",
    tint: [[null, "<circle cx=\"12\" cy=\"9\" r=\"3.6\"/>"]],
  },
  "refresh": {
    line: "<path d=\"M20 10.5A8 8 0 0 0 5.6 7M4 3v4.5h4.5M4 13.5A8 8 0 0 0 18.4 17M20 21v-4.5h-4.5\"/>",
  },
  "undo": {
    line: "<path d=\"M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3\"/>",
  },
  "archive": {
    body: "<rect x=\"2\" y=\"4.5\" width=\"4.5\" height=\"17\" rx=\".8\"/><rect x=\"7.5\" y=\"2.5\" width=\"5\" height=\"19\" rx=\".8\"/><path d=\"M13.8 5.6l4.3-1.2 4.4 16-4.3 1.2z\"/>",
    detail: "<path d=\"M2 8h4.5M7.5 6.5h5M7.5 17.5h5M15 9.6l4.3-1.2\"/>",
  },
  "box": {
    body: "<path d=\"M2.5 7.3 12 2.5l9.5 4.8v9.4L12 21.5l-9.5-4.8z\"/>",
    detail: "<path d=\"M2.5 7.3 12 12l9.5-4.7M7.2 4.9l9.5 4.8\"/>",
    tint: [[null, "<path d=\"M12 12v9.5l9.5-4.8V7.3z\"/>"]],
  },
  "edit": {
    body: "<path d=\"M15.5 2.5l6 6L9.5 20.5l-7.5 1.5 1.5-7.5z\"/>",
    detail: "<path d=\"M13 5l6 6\"/>",
    tint: [[null, "<path d=\"M3.5 14.5l6 6-7.5 1.5z\"/>"]],
  },
  "trash": {
    body: "<path d=\"M5.5 6h13l-1.2 15.5H6.7z\"/>",
    line: "<path d=\"M3.5 6h17M9 6V3h6v3\"/>",
    detail: "<path d=\"M10 10v8M14 10v8\"/>",
  },
  "warning": {
    body: "<path d=\"M12 2 22.8 20.8H1.2z\"/>",
    ink: "<circle cx=\"12\" cy=\"17.6\" r=\"1.4\"/>",
    mark: "<path d=\"M12 9v5.5\"/>",
  },
  "success": {
    body: "<circle cx=\"12\" cy=\"12\" r=\"10\"/>",
    mark: "<path d=\"M7.2 12.4l3.2 3.2 6.4-7\"/>",
  },
  "check": {
    line: "<path d=\"M4 12.5l5 5L20 6\"/>",
  },
  "close": {
    line: "<path d=\"M5.5 5.5l13 13M18.5 5.5l-13 13\"/>",
  },
  "arrow-left": {
    line: "<path d=\"M20 12H4M10 5.5 3.5 12l6.5 6.5\"/>",
  },
  "arrow-right": {
    line: "<path d=\"M4 12h16M14 5.5l6.5 6.5-6.5 6.5\"/>",
  },
  "info": {
    body: "<circle cx=\"12\" cy=\"12\" r=\"10\"/>",
    mark: "<path d=\"M12 11v6\"/>",
    ink: "<circle cx=\"12\" cy=\"7.4\" r=\"1.4\"/>",
  },
  "cast": {
    line: "<path d=\"M2.5 8V6.5a2.5 2.5 0 0 1 2.5-2.5h14a2.5 2.5 0 0 1 2.5 2.5v11a2.5 2.5 0 0 1-2.5 2.5h-6\"/><path d=\"M2.5 12.5a7.5 7.5 0 0 1 7.5 7.5M2.5 16.3a3.7 3.7 0 0 1 3.7 3.7\"/>",
    ink: "<circle cx=\"3\" cy=\"19.5\" r=\"1.4\"/>",
  },
  "fullscreen": {
    line: "<path d=\"M3 9V4.5A1.5 1.5 0 0 1 4.5 3H9M15 3h4.5A1.5 1.5 0 0 1 21 4.5V9M21 15v4.5a1.5 1.5 0 0 1-1.5 1.5H15M9 21H4.5A1.5 1.5 0 0 1 3 19.5V15\"/>",
    tint: [[null, "<rect x=\"7\" y=\"7\" width=\"10\" height=\"10\" rx=\"1.5\"/>"]],
  },
} satisfies Record<string, IconDrawing>;

export type IconName = keyof typeof ICONS;
