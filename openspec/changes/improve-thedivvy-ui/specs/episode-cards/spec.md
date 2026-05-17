## ADDED Requirements

### Requirement: Episode card displays core metadata
The episode card SHALL display title, series/episode number, summary, score, divvy moment, guest star, and link to review.

#### Scenario: Card shows all available metadata
- **WHEN** an episode card renders with complete frontmatter
- **THEN** the card displays episode title, series and episode number, summary excerpt, Lovejoy Units score, divvy moment highlight, and guest star name

#### Scenario: Card handles missing metadata
- **WHEN** an episode card renders with incomplete frontmatter
- **THEN** the card gracefully handles missing fields without breaking layout

### Requirement: Episode card supports images
The episode card SHALL support displaying an episode image when available.

#### Scenario: Card with image
- **WHEN** an episode has an associated image
- **THEN** the card displays the image prominently

#### Scenario: Card without image
- **WHEN** an episode has no image
- **THEN** the card still looks visually strong using typography, color, and score display

### Requirement: Visual distinctiveness
The episode card SHALL be visually distinctive and reflect The Divvy's brand identity.

#### Scenario: Card reflects brand
- **WHEN** episode cards display in lists or grids
- **THEN** cards use warm cream/parchment backgrounds, accent colors, elegant typography, and subtle antique-inspired styling

### Requirement: Clickable card navigation
The episode card SHALL be fully clickable to navigate to the episode review.

#### Scenario: User clicks card
- **WHEN** a visitor clicks anywhere on an episode card
- **THEN** they navigate to the full episode review page

### Requirement: Responsive card layout
The episode card SHALL work effectively in both grid and list layouts across device sizes.

#### Scenario: Cards in grid layout
- **WHEN** episode cards display in a grid on larger screens
- **THEN** cards maintain consistent height and alignment

#### Scenario: Cards in list layout
- **WHEN** episode cards display in a list on smaller screens
- **THEN** cards stack vertically with full width and comfortable spacing
