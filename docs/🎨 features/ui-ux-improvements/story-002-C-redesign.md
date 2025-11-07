# Story 002-C: Professional Presentation Design Overhaul

## Story Information
- **Story Number**: 002-C
- **Parent Story**: 002 (UI/UX Improvements)
- **Title**: Professional Presentation Design - Typography, Layouts & Imagery
- **Priority**: High
- **Estimated Effort**: Large (4-5 hours)
- **Status**: Planning

## Description
Transform the presentation design from "boxy slides" to professional, modern presentations by implementing proper typography hierarchy, full-bleed images, asymmetric layouts, and generous whitespace. Move away from over-reliance on boxes/cards to more dynamic, visually engaging designs.

## Research Findings
See `presentation-design-research.md` for detailed analysis.

**Key Issues Identified:**
1. Over-reliance on boxes/cards
2. Poor typography hierarchy
3. Lack of whitespace (40-60% should be empty)
4. Small, boxed images (need full-bleed)
5. Everything centered (need asymmetry)

## User Stories
- As a presentation viewer, I want visually striking slides so that I'm engaged and focused
- As a presentation viewer, I want clear typography hierarchy so that I can quickly grasp key messages
- As a presentation viewer, I want professional layouts so that the content feels credible and polished
- As a presentation creator, I want modern design patterns so that presentations look like professional keynotes

## Acceptance Criteria
- [ ] Typography hierarchy dramatically improved (7xl-9xl headings)
- [ ] Whitespace increased (40-60% empty space per slide)
- [ ] Full-bleed image support with text overlays
- [ ] New layout components (Hero, Statement, Split)
- [ ] Existing components redesigned without boxes
- [ ] Asymmetric layouts available
- [ ] Gradient text for headings
- [ ] Image overlays with gradients
- [ ] Agent uses new design patterns
- [ ] Presentations feel like Apple keynotes, not PowerPoint

## Implementation Plan

### Phase 1: Typography Overhaul (1 hour)

#### Task 1.1: Update TextComponent Typography
**Changes:**
- Heading: 5xl → 7xl-9xl (responsive)
- Subheading: 3xl → 5xl-6xl
- Body: 2xl → 3xl with better line height (1.6)
- Add letter spacing for headings
- Gradient text option for headings
- Better font weights (300, 400, 600, 700)

#### Task 1.2: Update Global Typography Styles
**Changes:**
- Increase base font sizes in app.css
- Better line heights globally
- Add gradient text utilities
- Text shadow utilities for overlays

### Phase 2: New Layout Components (2 hours)

#### Task 2.1: Create HeroComponent
**Features:**
- Full-bleed background image
- Large text overlay (7xl-9xl)
- Gradient overlay for readability (0-60% opacity)
- Centered or left-aligned text
- Optional subheading

**Example:**
```json
{
  "type": "hero",
  "backgroundImage": "url",
  "heading": "Big Statement",
  "subheading": "Supporting text",
  "overlay": "gradient",
  "textAlign": "left"
}
```

#### Task 2.2: Create StatementComponent
**Features:**
- Huge text (8xl-9xl)
- Minimal words (1-7)
- Lots of whitespace
- Optional subtle background
- Gradient text option

**Example:**
```json
{
  "type": "statement",
  "text": "One Powerful Idea",
  "size": "9xl",
  "gradient": true
}
```

#### Task 2.3: Create SplitLayoutComponent
**Features:**
- Asymmetric split (60/40 or 70/30)
- Image on one side, content on other
- No borders or boxes
- Flexible content (text, list, etc.)
- Reversible (image left or right)

**Example:**
```json
{
  "type": "split",
  "imageUrl": "url",
  "imageSide": "left",
  "ratio": "60/40",
  "content": {
    "heading": "Feature",
    "points": ["Point 1", "Point 2"]
  }
}
```

### Phase 3: Existing Component Redesign (1.5 hours)

#### Task 3.1: Redesign ImageComponent
**Changes:**
- Full-bleed option (edge-to-edge)
- Remove default borders
- Add overlay support (gradient, solid)
- Text overlay capability
- Larger default size

#### Task 3.2: Redesign CardGridComponent
**Changes:**
- Remove boxes/borders
- Use whitespace for separation
- Larger icons/emojis
- Better typography
- Optional subtle backgrounds

#### Task 3.3: Redesign QuoteComponent
**Changes:**
- Larger quote text (4xl-5xl)
- Remove box/border
- Better typography
- Gradient accent line
- More whitespace

#### Task 3.4: Redesign CodeBlockComponent
**Changes:**
- Better syntax highlighting for dark theme
- Larger font size
- More padding
- Subtle background (not heavy border)

#### Task 3.5: Update Chart Components
**Changes:**
- Remove gridlines
- Larger labels
- Better colors for dark theme
- More whitespace
- Focus on data story

### Phase 4: Spacing & Whitespace (0.5 hours)

#### Task 4.1: Update Global Spacing
**Changes:**
- Increase slide margins (5% → 15%)
- More padding between elements
- Generous line heights
- Don't fill every pixel

#### Task 4.2: Update ComponentRenderer
**Changes:**
- Add spacing between components
- Respect whitespace in layouts
- Better transition spacing

### Phase 5: Agent Prompt Updates (1 hour)

#### Task 5.1: Add Design Principles to Prompt
**Additions:**
- Use full-bleed images when available
- One idea per slide
- Huge headings (7xl-9xl)
- Embrace whitespace
- Avoid boxes/cards when possible
- Use Hero/Statement/Split layouts

#### Task 5.2: Add Layout Examples
**Examples:**
- Hero layout with full-bleed image
- Statement slide with huge text
- Split layout with asymmetric design
- Minimal slides with whitespace

## Technical Requirements

### New Components:
1. **HeroComponent.svelte** - Full-bleed image with text overlay
2. **StatementComponent.svelte** - Huge text, minimal design
3. **SplitLayoutComponent.svelte** - Asymmetric 60/40 layouts

### Component Updates:
1. TextComponent - Better typography
2. ImageComponent - Full-bleed support
3. CardGridComponent - Remove boxes
4. QuoteComponent - Larger, cleaner
5. CodeBlockComponent - Better highlighting
6. Chart components - Cleaner design

### Type Definitions:
- Add HeroComponent type
- Add StatementComponent type
- Add SplitLayoutComponent type
- Update existing types with new options

### CSS Updates:
- Gradient text utilities
- Text shadow utilities
- Better spacing utilities
- Full-bleed image support

## Design Principles to Follow

### Typography:
- Heading: 7xl-9xl (60-80pt equivalent)
- Subheading: 5xl-6xl (36-48pt)
- Body: 3xl (24-32pt)
- Line height: 1.6-1.8 for body
- Letter spacing: wider for headings

### Whitespace:
- 40-60% of slide should be empty
- Margins: 10-15% on all sides
- Generous padding between elements
- Don't fear emptiness

### Images:
- Full-bleed when possible
- 50-100% of slide
- Text overlays with gradients
- No borders or boxes

### Layout:
- Asymmetric (60/40, 70/30)
- Rule of thirds
- Off-center focal points
- One idea per slide

### Color:
- Off-white for body (slate-100)
- Pure white for emphasis only
- Gradient text for headings
- Accent colors sparingly

## Testing Strategy

### Visual Testing:
- Generate 10 presentations
- Verify typography hierarchy
- Check whitespace usage
- Confirm full-bleed images work
- Test new layout components

### Design Checklist:
- [ ] Headings are dramatically larger
- [ ] Slides have 40-60% whitespace
- [ ] Images are full-bleed or large
- [ ] No unnecessary boxes
- [ ] Asymmetric layouts used
- [ ] Typography is clear and hierarchical
- [ ] Feels like Apple keynote, not PowerPoint

## Success Metrics
- Presentations look professional and modern
- Clear visual hierarchy on every slide
- Generous whitespace throughout
- Images are prominent and impactful
- No more "boxy" feel
- Positive user feedback on design

## Definition of Done
- [ ] All new components implemented
- [ ] All existing components redesigned
- [ ] Typography dramatically improved
- [ ] Whitespace increased throughout
- [ ] Full-bleed images working
- [ ] Agent uses new design patterns
- [ ] Tests passing
- [ ] Documentation updated
- [ ] User testing shows improvement

## Notes
This is a significant redesign, not just polish. The goal is to transform the presentation feel from "basic slides" to "professional keynote."
