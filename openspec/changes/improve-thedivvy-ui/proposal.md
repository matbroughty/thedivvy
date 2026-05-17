## Why

The Divvy is a weekly Lovejoy episode review site that requires a distinctive, nostalgic UI to match its unique value proposition: thoughtful, witty episode reviews that celebrate the atmosphere of antiques shops, Sunday-evening ITV, and Suffolk villages. The current UI is generic and fails to communicate the site's personality, differentiate it from typical blogs or wikis, or provide an excellent long-form reading experience that rewards careful viewers.

## What Changes

- **Homepage redesign** with hero section, clear tagline, featured review, series browsing, and introduction explaining the concept
- **Episode page improvements** focused on long-form reading comfort with enhanced typography, spacing, metadata display, and navigation
- **Episode card redesign** to be visually distinctive, supporting title, series/episode number, score, divvy moment, guest star, images, and working well without images
- **Series page improvements** with overview, clear episode display, and inviting presentation
- **Archive browsing** with clear ordering and simple navigation
- **Visual identity system** establishing warm cream/parchment backgrounds, dark green/burgundy/gold accents, elegant serif headings, readable body typography, and antique-inspired aesthetic
- **Navigation improvements** with clean top-level structure working beautifully on mobile
- **Responsive design** ensuring excellent experience on desktop, tablet, and mobile
- **Typography system** emphasizing readability for long-form content
- **Accessibility enhancements** including contrast, semantic HTML, keyboard access, heading hierarchy, and alt text support
- **Editorial workflow support** subtly distinguishing AI-assisted reference material (metadata panels, sidebars) from central human-written reviews

## Capabilities

### New Capabilities

- `homepage-redesign`: Complete homepage redesign with hero, tagline, featured review, series navigation, and introduction
- `episode-page-layout`: Enhanced episode review page with metadata display, score presentation, navigation, and long-form reading optimization
- `episode-cards`: Redesigned episode card component supporting all metadata fields with strong visual identity
- `series-pages`: Series overview pages with episode listings and optional statistics
- `visual-identity`: Brand colors, typography, spacing system, and antique-inspired aesthetic
- `navigation-structure`: Top-level navigation with mobile support
- `responsive-design`: Mobile-first responsive layouts for all page types
- `typography-system`: Serif headings, readable body text, and long-form content optimization

### Modified Capabilities

<!-- No existing capabilities are being modified -->

## Impact

**Code affected:**
- `src/components/` - New and modified UI components (episode cards, navigation, layout components)
- `src/pages/` - Homepage, episode pages, series pages, archive pages
- `src/styles/global.css` - Typography, color system, spacing, responsive breakpoints

**Dependencies:**
- Potential new dependencies for typography or UI utilities (to be evaluated during design phase)
- Existing React, Vite, MDX stack remains unchanged

**Systems:**
- MDX content structure remains compatible
- Static site generation workflow unchanged
- No backend, CMS, auth, or database introduced
- Build pipeline (`npm run build`) must continue to work
