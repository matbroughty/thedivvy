## 1. Foundation - Design System

- [x] 1.1 Define CSS custom properties for color system in `src/styles/global.css` (cream/parchment backgrounds, dark green/burgundy/gold accents, text colors, borders)
- [x] 1.2 Define CSS custom properties for typography scale (heading sizes h1-h6, body text, small text)
- [x] 1.3 Define CSS custom properties for spacing system (consistent padding, margin, and gap values)
- [x] 1.4 Add Google Fonts import for serif headings (evaluate Libre Baskerville, Crimson Pro, or Lora)
- [x] 1.5 Configure font families with web-safe fallbacks (Georgia, Garamond)
- [x] 1.6 Set up responsive breakpoints (640px tablet, 1024px desktop)
- [x] 1.7 Apply base typography styles (line height 1.6-1.8, appropriate font sizes)
- [x] 1.8 Test color contrast ratios against WCAG AA standards (4.5:1 for normal text, 3:1 for large text)

## 2. Layout Components

- [x] 2.1 Create `Header` component with site title and placeholder for navigation
- [x] 2.2 Create `Footer` component with basic site information
- [x] 2.3 Create `MainLayout` component wrapping Header, children, and Footer
- [x] 2.4 Create `ArticleLayout` component for episode pages with main content area and sidebar support
- [x] 2.5 Implement responsive behavior for `ArticleLayout` (sidebar stacks below on mobile)
- [x] 2.6 Apply CSS Grid or Flexbox layouts to layout components

## 3. Episode Components

- [x] 3.1 Create `ScoreDisplay` component for Lovejoy Units with visual treatment (decide badge vs large number vs icon)
- [x] 3.2 Create `EpisodeCard` component with title, series/episode number, summary, score, divvy moment, guest star
- [x] 3.3 Add image support to `EpisodeCard` with fallback styling for cards without images
- [x] 3.4 Style `EpisodeCard` with warm colors, soft shadows, and antique-inspired aesthetic
- [x] 3.5 Make `EpisodeCard` fully clickable for navigation
- [x] 3.6 Implement responsive `EpisodeCard` layout (grid on desktop, stack on mobile)
- [x] 3.7 Create `EpisodeHeader` component with episode title, metadata, score, and hero image support
- [x] 3.8 Add image credit display to `EpisodeHeader` when hero image is present

## 4. Navigation Components

- [x] 4.1 Create `Navigation` component with Home, Reviews/Archive, Series, About links
- [x] 4.2 Implement desktop horizontal navigation with hover states
- [x] 4.3 Implement mobile navigation pattern (decide hamburger menu, bottom nav, or slide-out drawer)
- [x] 4.4 Add current page indication to navigation
- [x] 4.5 Create `Breadcrumbs` component for episode pages
- [x] 4.6 Create `PrevNextNav` component for episode-to-episode navigation
- [x] 4.7 Ensure touch-friendly interaction on mobile (44x44px minimum touch targets)

## 5. Homepage Implementation

- [x] 5.1 Create `HeroSection` component with site name, tagline, and visual identity
- [x] 5.2 Implement featured review section on homepage using `EpisodeCard` variant
- [x] 5.3 Create `SeriesNav` component for browsing series (decide grid vs list pattern)
- [x] 5.4 Implement recent reviews list on homepage using `EpisodeCard` components
- [x] 5.5 Add introduction section explaining The Divvy concept and value proposition
- [x] 5.6 Apply homepage layout with hero, featured, series nav, and recent reviews sections
- [x] 5.7 Test homepage responsive behavior on mobile, tablet, and desktop

## 6. Episode Page Implementation

- [x] 6.1 Update episode page to use `ArticleLayout`
- [x] 6.2 Integrate `EpisodeHeader` at top of episode pages
- [x] 6.3 Apply long-form typography to episode review content (60-75 character line length)
- [x] 6.4 Style MDX sections (Plot in one breath, Opening Scene Observations, Review, etc.)
- [x] 6.5 Create metadata sidebar component for AI-assisted reference material (guest stars, air dates, etc.)
- [x] 6.6 Integrate `PrevNextNav` at bottom of episode pages
- [x] 6.7 Add breadcrumbs and series/archive links to episode pages
- [x] 6.8 Test episode page reading experience on mobile devices

## 7. Series Pages Implementation

- [x] 7.1 Create series page layout with series title and overview description
- [x] 7.2 Display all episodes in series using `EpisodeCard` components
- [x] 7.3 Implement episode ordering by episode number
- [x] 7.4 Add optional series statistics (average score, total episode count)
- [x] 7.5 Apply inviting, curated design using visual identity
- [x] 7.6 Test series page responsive behavior

## 8. Archive Page Implementation

- [x] 8.1 Create archive page layout with clear page title
- [x] 8.2 Display all episodes using `EpisodeCard` components in chronological order
- [x] 8.3 Implement simple, lightweight browsing interface
- [x] 8.4 Test archive page responsive behavior
- [x] 8.5 Decide if series filter dropdown is needed (optional)

## 9. Responsive Design Polish

- [x] 9.1 Test all pages on 320px width mobile devices
- [x] 9.2 Test all pages on tablet (640px-1023px)
- [x] 9.3 Test all pages on desktop (1024px+)
- [x] 9.4 Verify mobile reading experience for episode reviews
- [x] 9.5 Ensure responsive images work correctly across screen sizes
- [x] 9.6 Test touch interactions on mobile devices
- [x] 9.7 Adjust line length, font sizing, and spacing as needed for mobile

## 10. Accessibility & Quality Assurance

- [x] 10.1 Verify semantic HTML throughout (proper heading hierarchy, landmarks, etc.)
- [x] 10.2 Test keyboard navigation and focus states
- [x] 10.3 Add alt text support to all image components
- [x] 10.4 Verify WCAG AA contrast compliance for all color combinations
- [ ] 10.5 Test with screen reader (VoiceOver or NVDA)
- [x] 10.6 Ensure `npm run build` passes successfully
- [x] 10.7 Verify MDX content structure remains compatible
- [ ] 10.8 Test site in multiple browsers (Chrome, Firefox, Safari, Edge)

## 11. Final Integration & Testing

- [x] 11.1 Integrate `Navigation` component into `Header`
- [x] 11.2 Verify all page types work together cohesively
- [x] 11.3 Test navigation flow through homepage → series → episode → archive
- [x] 11.4 Verify visual identity is consistent across all pages
- [x] 11.5 Ensure no unnecessary dependencies were added
- [ ] 11.6 Git commit all changes with appropriate commit messages
- [x] 11.7 Final visual QA of nostalgic, warm, antique-inspired aesthetic
- [x] 11.8 Verify site clearly communicates purpose within 5 seconds of homepage visit
