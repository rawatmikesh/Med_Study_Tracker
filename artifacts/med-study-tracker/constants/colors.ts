/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#1C2321',
    tint: '#1F6F6B',

    // Core surfaces
    background: '#F7F6F2',
    foreground: '#1C2321',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#1C2321',

    // Primary action color (buttons, links, active states)
    primary: '#1F6F6B',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E4F0EF',
    secondaryForeground: '#1F6F6B',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EEECE6',
    mutedForeground: '#6B6B62',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#F6E9D9',
    accentForeground: '#B8722B',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#D9D5C9',
    input: '#D9D5C9',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
