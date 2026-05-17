## Context

The Divvy is a static React + Vite + MDX site with reviews stored as MDX files under `src/content/reviews/series-XX/`. The current UI is generic and fails to communicate the site's unique value proposition: a warm, nostalgic, witty companion guide to Lovejoy episodes.

**Current state:**
- Basic React component structure in `src/components/`
- Simple page layouts in `src/pages/`
- Minimal styling in `src/styles/global.css`
- MDX content system already functional
- No backend, CMS, auth, or database

**Constraints:**
- Must remain static site (no backend)
- Must preserve MDX workflow and existing content structure
- Must maintain `npm run build` compatibility
- Must avoid unnecessary dependencies
- Mobile reading experience is critical priority

**Stakeholders:**
- Content authors (manual MDX editing workflow)
- Site visitors (primarily episode readers seeking thoughtful reviews)

## Goals / Non-Goals

**Goals:**
- Establish distinctive visual identity with warm, nostalgic, antique-inspired aesthetic
- Create excellent long-form reading experience for episode reviews
- Design reusable component system for episode cards, navigation, layouts
- Implement responsive design prioritizing mobile reading
- Support editorial workflow distinguishing human reviews from AI-assisted reference material
- Maintain simple, maintainable React/CSS architecture

**Non-Goals:**
- Adding backend, CMS, authentication, or database
- Implementing search functionality (future consideration)
- Creating complex animation system
- Adding user comments or interaction features
- Changing MDX content structure or authoring workflow
- Over-engineering with excessive dependencies or abstractions

## Decisions

### Decision 1: CSS Variables for Design System

**Choice:** Use CSS custom properties (variables) for colors, typography scale, and spacing system defined in `src/styles/global.css`.

**Rationale:**
- Native browser support, no build dependency
- Easy theming and consistency across components
- Simple to maintain and override
- Familiar pattern for React developers

**Alternatives considered:**
- CSS-in-JS (styled-components, emotion) - rejected for unnecessary complexity and bundle size
- Tailwind CSS - rejected for not aligning with warm, bespoke design aesthetic
- SCSS/SASS - rejected for unnecessary build tooling

### Decision 2: Serif Typography Using Web-Safe Fonts + Optional Web Font

**Choice:** Use web-safe serif fonts (Georgia, Garamond) with optional Google Fonts fallback for headings, sans-serif for body or carefully chosen serif for body.

**Rationale:**
- Web-safe fonts ensure immediate rendering
- Georgia/Garamond provide elegant serif character suitable for nostalgic aesthetic
- Optional web font (e.g., Libre Baskerville, Crimson Pro) for enhanced brand character
- Balances performance with aesthetic goals

**Alternatives considered:**
- Premium typefaces - rejected for cost and licensing complexity
- System font stack only - rejected for insufficient character and warmth
- Multiple web fonts - rejected for performance concerns

### Decision 3: Component Architecture

**Choice:** Create focused React components organized by function:
- Layout components: `Header`, `Footer`, `MainLayout`, `ArticleLayout`
- Content components: `EpisodeCard`, `EpisodeHeader`, `SeriesNav`, `HeroSection`
- Utility components: `ScoreDisplay`, `Breadcrumbs`, `PrevNextNav`

**Rationale:**
- Clear separation of concerns
- Easy to compose pages from reusable components
- Straightforward to maintain and extend
- Avoids over-abstraction

**Alternatives considered:**
- Atomic design pattern - rejected as too complex for project scale
- Page-specific components only - rejected for lack of reusability
- Component library (MUI, Chakra) - rejected for generic aesthetic and unnecessary weight

### Decision 4: Responsive Strategy

**Choice:** Mobile-first CSS with breakpoints at 640px (tablet) and 1024px (desktop), using CSS Grid and Flexbox for layouts.

**Rationale:**
- Mobile reading is highest priority
- CSS Grid/Flexbox are mature, well-supported, performant
- Three breakpoints sufficient for design requirements
- No framework dependency needed

**Alternatives considered:**
- Desktop-first approach - rejected for not prioritizing mobile reading
- Container queries - rejected for browser support concerns at time of implementation
- More breakpoints - rejected for unnecessary complexity

### Decision 5: Image Handling

**Choice:** Use Vite's asset handling for images stored in `public/images/`, with responsive image sizing via CSS rather than multiple image versions initially.

**Rationale:**
- Simple to implement and maintain
- No build-time image optimization needed for initial phase
- Can add responsive images later if performance requires
- Public folder structure keeps images organized by series

**Alternatives considered:**
- Vite image plugin with optimization - deferred as premature optimization
- External image CDN - rejected for adding external dependency
- Multiple image sizes at build time - deferred to future iteration

### Decision 6: Color System

**Choice:** Define 6-8 CSS variables for brand colors:
- Primary background (warm cream/parchment)
- Secondary background (lighter cream)
- Accent colors (dark green, burgundy, muted gold)
- Text colors (dark brown, medium brown for secondary text)
- Border/divider colors (muted tan/beige)

**Rationale:**
- Manageable palette size
- Clear semantic naming
- Easy to adjust and maintain
- Supports accessibility through defined contrast ratios

**Alternatives considered:**
- Larger color palette - rejected for complexity
- Single accent color - rejected for insufficient visual interest
- Dynamic color generation - rejected as unnecessary

### Decision 7: Metadata Display Strategy

**Choice:** Use sidebar or supporting blocks for AI-assisted reference material (guest stars, air dates, metadata), keep main review content in primary content area.

**Rationale:**
- Visually distinguishes human-authored content from reference material
- Supports editorial workflow requirements
- Responsive design can stack sidebar below on mobile
- Familiar pattern for readers

**Alternatives considered:**
- Inline metadata throughout review - rejected for blurring human/AI distinction
- Metadata in footer only - rejected for reduced discoverability
- Tabs or accordions - rejected for adding interaction complexity

## Risks / Trade-offs

**[Risk: Web font loading delay causing FOUT/FOIT]**
→ Mitigation: Use `font-display: swap` and ensure web-safe fallbacks provide good reading experience during load

**[Risk: Color palette may not have sufficient contrast for accessibility]**
→ Mitigation: Test all color combinations against WCAG AA standards (4.5:1 for normal text, 3:1 for large text)

**[Risk: Mobile line length may be too short on very small screens]**
→ Mitigation: Test on 320px width devices and adjust padding/margins if needed

**[Risk: Episode cards without images may feel less engaging]**
→ Mitigation: Use score display, typography, and accent colors to create visual interest without images

**[Risk: Serif body text may reduce readability on lower-resolution screens]**
→ Mitigation: Test readability extensively on mobile devices; consider sans-serif for body if issues arise

**[Trade-off: Minimal dependencies vs. potential reinvention of solved problems]**
→ Accepted: Prefer simplicity and maintainability over feature completeness for initial implementation

**[Trade-off: Static site limitations vs. dynamic features users might expect (search, comments)]**
→ Accepted: Explicit non-goal; static site aligns with project vision

## Migration Plan

**Implementation phases:**
1. **Phase 1: Foundation** - Establish CSS variables, typography system, color palette in `global.css`
2. **Phase 2: Layout Components** - Create `Header`, `Footer`, `MainLayout`, `ArticleLayout` components
3. **Phase 3: Episode Components** - Build `EpisodeCard`, `EpisodeHeader`, `ScoreDisplay` components
4. **Phase 4: Homepage** - Implement hero section, featured review, series navigation, recent reviews
5. **Phase 5: Episode Pages** - Apply `ArticleLayout` and enhanced episode page structure
6. **Phase 6: Series & Archive** - Implement series overview and archive browsing pages
7. **Phase 7: Navigation** - Finalize top-level navigation with mobile menu
8. **Phase 8: Polish** - Responsive refinements, accessibility testing, visual QA

**Rollback strategy:**
- All changes are UI-only and don't affect content structure
- Git commit after each phase for granular rollback
- MDX content remains unchanged, ensuring safe rollback at any point

## Open Questions

1. **Exact serif typeface selection** - Need to evaluate specific Google Fonts options (Libre Baskerville, Crimson Pro, Lora) for character and readability
2. **Score display visual treatment** - How prominent should Lovejoy Units be? Badge, large number, decorative icon?
3. **Series navigation pattern** - Grid of series cards, simple list, or combination?
4. **Mobile navigation pattern** - Hamburger menu, bottom nav, or slide-out drawer?
5. **Archive filtering/sorting** - Simple chronological only, or add series filter dropdown?

These will be resolved during implementation based on visual design testing.
