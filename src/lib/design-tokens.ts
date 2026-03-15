// Colors — must match :root CSS custom properties in globals.css
export const colors = {
  white: '#fffdfa',   // sync: globals.css :root --white
  black: '#222222',   // sync: globals.css :root --black
  accent: '#fc5c46',  // sync: globals.css :root --accent
  violet: '#b87dfe',  // sync: globals.css :root --violet
  blue: '#467afc',    // sync: globals.css :root --blue
  lime: '#cbfd00',    // sync: globals.css :root --lime
  green: '#00cf00',   // sync: globals.css :root --green
  muted: '#9a9997',   // sync: globals.css :root --muted
} as const;

// Border widths in pixels — sync: globals.css @theme
export const borderWidths = {
  standard: 3,   // sync: globals.css @theme --border-standard
  collection: 10, // sync: globals.css @theme --border-collection
  frame: 5,       // sync: globals.css @theme --border-frame
} as const;

// Container widths in pixels — sync: globals.css @theme
export const containerWidths = {
  contentMax: 1312, // sync: globals.css @theme --width-content-max
} as const;

// Spacing reference values (desktop) in pixels — sync: globals.css :root
export const spacing = {
  pagePx: 100,       // sync: globals.css :root --page-px
  pagePt: 50,        // sync: globals.css :root --page-pt
  sectionGap: 60,    // sync: globals.css :root --section-gap
  collectionPx: 40,  // sync: globals.css :root --collection-px
  collectionPy: 25,  // sync: globals.css :root --collection-py
  cardGap: 25,       // sync: globals.css :root --card-gap
  crosslinkGap: 50,  // sync: globals.css :root --crosslink-gap
} as const;
