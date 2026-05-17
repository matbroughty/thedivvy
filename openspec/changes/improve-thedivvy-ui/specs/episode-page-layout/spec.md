## ADDED Requirements

### Requirement: Episode header displays metadata
The episode page SHALL display a prominent header with episode title, series/episode number, and metadata.

#### Scenario: User views episode information
- **WHEN** a visitor opens an episode review page
- **THEN** the header displays episode title, series and episode number, air date if available, and review date if available

### Requirement: Score prominently presented
The episode page SHALL display the Lovejoy Units score in a visually prominent manner.

#### Scenario: User sees episode rating
- **WHEN** a visitor views an episode page
- **THEN** the Lovejoy Units score displays clearly near the top of the page with distinctive visual treatment

### Requirement: Hero image with attribution
The episode page SHALL support a hero image with proper image credit.

#### Scenario: Episode has hero image
- **WHEN** an episode review includes a hero image in frontmatter
- **THEN** the image displays prominently with image credit shown

#### Scenario: Episode has no hero image
- **WHEN** an episode review has no hero image
- **THEN** the page layout still works well without the image

### Requirement: Long-form reading optimization
The episode page SHALL optimize typography, spacing, and layout for comfortable long-form reading.

#### Scenario: User reads full review
- **WHEN** a visitor reads an episode review
- **THEN** the text displays with generous line height, comfortable line length (60-75 characters), clear heading hierarchy, and ample whitespace

### Requirement: MDX section structure supported
The episode page SHALL support the existing MDX section structure including Plot in one breath, Opening Scene Observations, Review, Lovejoy Units, Divvy Moment, Guest Star Watch, Line of the Episode, and Divvy Fact.

#### Scenario: All MDX sections render correctly
- **WHEN** an episode review includes multiple MDX sections
- **THEN** each section displays with appropriate styling and visual hierarchy

### Requirement: Episode navigation
The episode page SHALL provide navigation to previous and next episodes in the series.

#### Scenario: User navigates between episodes
- **WHEN** a visitor finishes reading an episode review
- **THEN** previous/next episode navigation displays with episode titles and links

### Requirement: Series and archive links
The episode page SHALL provide clear navigation back to the series page and archive.

#### Scenario: User returns to series overview
- **WHEN** a visitor wants to return to the series
- **THEN** a link to the series page is clearly available in the navigation or breadcrumbs

#### Scenario: User returns to archive
- **WHEN** a visitor wants to browse all episodes
- **THEN** a link to the archive is clearly available

### Requirement: Review centrepiece design
The episode page SHALL make the human-written review feel like the centrepiece while supporting reference material in secondary positions.

#### Scenario: Review is primary focus
- **WHEN** a visitor views an episode page
- **THEN** the main review content is visually prominent while metadata, guest stars, and reference material appear in sidebars or supporting blocks
