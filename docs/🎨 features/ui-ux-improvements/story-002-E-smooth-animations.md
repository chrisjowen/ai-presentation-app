# Story 002-E: Smooth Animations & Transitions

## Story Information
- **Story Number**: 002-E
- **Parent Story**: 002 (UI/UX Improvements)
- **Title**: Smooth Animations & Transitions - Professional Presentation Feel
- **Priority**: High
- **Estimated Effort**: Small (2-3 hours)
- **Status**: Planning

## Description
Replace robotic text transitions with smooth, professional animations that make the presentation feel like a polished, real-time deck.

## User Stories
- As a presentation viewer, I want smooth text animations so that the presentation feels professional
- As a presentation viewer, I want natural transitions so that I'm not distracted by jarring movements
- As a presentation viewer, I want the presentation to feel like a live deck, not a robot reading text

## Acceptance Criteria
- [ ] Text appears smoothly with natural fade-in
- [ ] Transitions between slides are smooth and professional
- [ ] No "floating text" or robotic feel
- [ ] Animations run at 60fps (performance tested)
- [ ] Initial load experience is polished
- [ ] Subtitle synchronization is smooth
- [ ] All transitions feel intentional and purposeful

## Current Issues to Fix
1. **Robotic Text**: Text appears too abruptly
2. **Floating Feel**: Components don't feel grounded
3. **Jarring Transitions**: Slide changes are too sudden
4. **Initial Load**: Loading experience is basic
5. **Subtitle Sync**: Subtitles can feel disconnected from audio

## Animation Improvements

### Text Animations
- Smooth fade-in with slight upward motion
- Stagger animations for multiple text elements
- Natural timing (not too fast, not too slow)
- Respect user's motion preferences

### Slide Transitions
- Smooth cross-fade between slides
- Subtle motion blur for movement
- Consistent timing across all transitions
- Clear visual hierarchy

### Component Animations
- Entrance animations for each component type
- Exit animations when clearing slides
- Hover states for interactive elements
- Loading states for async content

### Initial Load
- Elegant loading animation
- Smooth transition to first slide
- Progress indication
- No jarring "pop-in"

## Technical Requirements
### Functional Requirements
- **FR1**: Create custom transition utilities
- **FR2**: Update all component transitions
- **FR3**: Implement staggered animations
- **FR4**: Add motion preferences detection
- **FR5**: Optimize animation performance

### Non-Functional Requirements
- **Performance**: All animations must run at 60fps
- **Accessibility**: Respect prefers-reduced-motion
- **Consistency**: Unified animation timing and easing
- **Smoothness**: No jank or stuttering

## Dependencies
### Internal Dependencies
- [ ] All component files
- [ ] Presentation store
- [ ] Timeline event system

### External Dependencies
- None (use CSS transitions and Svelte transitions)

## Implementation Tasks
1. **Create transition utilities** (`src/lib/utils/transitions.ts`)
2. **Update TextComponent** with smooth animations
3. **Update ComponentRenderer** with better transitions
4. **Add staggered animations** for multiple elements
5. **Improve LoadingAnimation** component
6. **Test performance** on various devices
7. **Add motion preferences** detection

## Testing Strategy
- Visual testing of all animations
- Performance testing (60fps requirement)
- Test on low-end devices
- Test with prefers-reduced-motion enabled
- User testing for "feel" and polish

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Animations run at 60fps
- [ ] Motion preferences respected
- [ ] User feedback is positive
- [ ] Code committed with descriptive messages

## Notes
- Use CSS transforms for best performance
- Avoid animating layout properties (width, height, top, left)
- Use transform and opacity for smooth 60fps animations
- Test on actual devices, not just desktop
