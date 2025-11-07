# Implementation Plan: OpenAI TTS Integration

## Story Reference
- **Story Number**: 001
- **Story Title**: Replace Web Speech API with OpenAI TTS for Realistic Voice Narration
- **Implementation Start Date**: 2025-11-07
- **Target Completion**: 2025-11-08

## Technical Approach

### Architecture Changes
- [ ] Add backend API endpoint for TTS generation (`/api/tts/generate`)
- [ ] Modify presentation store to use audio elements instead of SpeechSynthesis
- [ ] Add audio caching layer (in-memory or file-based)
- [ ] Update environment configuration for OpenAI API key

### Technology Stack
- **Languages**: TypeScript, JavaScript
- **Frameworks**: SvelteKit (existing)
- **Libraries**: 
  - `openai` (OpenAI Node.js SDK) - new dependency
  - HTML5 Audio API (browser native)
- **Tools**: Vite (existing), npm (existing)

## Task Breakdown

### Phase 1: Foundation and Setup
- [ ] **Task 1.1**: Add OpenAI SDK dependency and configure API key
  - **Files to create/modify**: 
    - `package.json` (add openai dependency)
    - `.env.example` (add OPENAI_API_KEY)
    - `.env` (add actual API key - not committed)
  - **Tests to write**:
    - None (configuration only)
  - **Documentation to update**:
    - `docs/🏗️ architecture/system-overview.md` (add TTS architecture)
    - `README.md` (add environment setup instructions)
  - **Estimated Time**: 0.5 hours
  - **Dependencies**: None
  - **Acceptance Criteria**: OpenAI SDK installed, API key configured

- [ ] **Task 1.2**: Create TTS API endpoint
  - **Files to create/modify**: 
    - `src/routes/api/tts/generate/+server.ts` (new)
    - `src/lib/types/tts.ts` (new - type definitions)
  - **Tests to write**:
    - Unit tests for TTS endpoint request validation
    - Integration test for OpenAI API call
  - **Documentation to update**:
    - `docs/🔌 api/tts-endpoint.md` (new - API documentation)
  - **Estimated Time**: 2 hours
  - **Dependencies**: Task 1.1
  - **Acceptance Criteria**: Endpoint accepts text and voice parameters, returns audio buffer

### Phase 2: Core Implementation
- [ ] **Task 2.1**: Implement audio caching mechanism
  - **Files to create/modify**: 
    - `src/lib/services/audio-cache.ts` (new)
  - **Tests to write**:
    - Unit tests for cache set/get/clear operations
    - Test cache key generation
    - Test cache size limits
  - **Documentation to update**:
    - `docs/🏗️ architecture/system-overview.md` (add caching strategy)
  - **Estimated Time**: 2 hours
  - **Dependencies**: Task 1.2
  - **Acceptance Criteria**: Cache stores and retrieves audio by text+voice+speed key

- [ ] **Task 2.2**: Update presentation store to use OpenAI TTS
  - **Files to create/modify**: 
    - `src/lib/stores/presentation.svelte.ts` (modify speak method)
    - `src/lib/services/tts-service.ts` (new - TTS abstraction layer)
  - **Tests to write**:
    - Unit tests for TTS service
    - Integration tests for presentation store audio playback
    - Test audio loading and error handling
  - **Documentation to update**:
    - `docs/💻 coding-standards/audio-handling.md` (new)
  - **Estimated Time**: 3 hours
  - **Dependencies**: Task 2.1
  - **Acceptance Criteria**: Presentation uses OpenAI TTS instead of Web Speech API

- [ ] **Task 2.3**: Implement voice selection UI
  - **Files to create/modify**: 
    - `src/routes/session/[sessionId]/+page.svelte` (update voice settings UI)
    - `src/lib/stores/presentation.svelte.ts` (update voice management)
  - **Tests to write**:
    - E2E tests for voice selection
    - Test voice cycling with keyboard shortcut
  - **Documentation to update**:
    - `docs/🎨 features/realistic-tts/feature-overview.md` (new)
  - **Estimated Time**: 2 hours
  - **Dependencies**: Task 2.2
  - **Acceptance Criteria**: Users can select from 6 OpenAI voices, V key cycles voices

### Phase 3: Integration and Polish
- [ ] **Task 3.1**: Implement subtitle synchronization with audio
  - **Files to create/modify**: 
    - `src/lib/stores/presentation.svelte.ts` (update subtitle timing)
  - **Tests to write**:
    - Integration tests for subtitle sync
    - Test subtitle display at different speeds
  - **Documentation to update**:
    - None (internal implementation)
  - **Estimated Time**: 2 hours
  - **Dependencies**: Task 2.3
  - **Acceptance Criteria**: Subtitles appear/disappear in sync with audio playback

- [ ] **Task 3.2**: Implement error handling and fallback
  - **Files to create/modify**: 
    - `src/routes/api/tts/generate/+server.ts` (add error handling)
    - `src/lib/services/tts-service.ts` (add retry logic)
    - `src/routes/session/[sessionId]/+page.svelte` (add error UI)
  - **Tests to write**:
    - Unit tests for error scenarios
    - Test retry logic
    - Test user error messages
  - **Documentation to update**:
    - `docs/🎨 features/realistic-tts/troubleshooting.md` (new)
  - **Estimated Time**: 2 hours
  - **Dependencies**: Task 3.1
  - **Acceptance Criteria**: API errors show user-friendly messages, retry logic works

- [ ] **Task 3.3**: Performance optimization and testing
  - **Files to create/modify**: 
    - `src/lib/services/audio-cache.ts` (optimize cache strategy)
    - `src/lib/services/tts-service.ts` (add preloading)
  - **Tests to write**:
    - Performance tests for audio generation latency
    - Test cache hit rates
    - E2E tests for full presentation flow
  - **Documentation to update**:
    - `docs/🎨 features/realistic-tts/performance.md` (new)
  - **Estimated Time**: 2 hours
  - **Dependencies**: Task 3.2
  - **Acceptance Criteria**: Audio generation < 2s, playback starts < 500ms

## Testing Strategy

### Unit Tests
- [ ] TTS endpoint request validation
- [ ] Audio cache operations (set, get, clear, key generation)
- [ ] TTS service methods (generate, cache lookup, error handling)
- [ ] Presentation store audio playback methods
- [ ] Error handling and retry logic

### Integration Tests
- [ ] OpenAI API integration (with mocked responses)
- [ ] Audio cache integration with TTS service
- [ ] Presentation store integration with TTS service
- [ ] Subtitle synchronization with audio playback

### End-to-End Tests
- [ ] Full presentation playback with OpenAI TTS
- [ ] Voice selection and cycling
- [ ] Speed adjustment (0.5x to 2.0x)
- [ ] Error scenarios (API failure, network issues)
- [ ] Cache behavior across multiple presentations
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

## Documentation Requirements

### Technical Documentation
- [ ] API endpoint documentation (`docs/🔌 api/tts-endpoint.md`)
- [ ] Architecture updates (`docs/🏗️ architecture/system-overview.md`)
- [ ] Audio handling standards (`docs/💻 coding-standards/audio-handling.md`)
- [ ] Code comments for TTS service and cache

### User Documentation
- [ ] Feature overview (`docs/🎨 features/realistic-tts/feature-overview.md`)
- [ ] Setup instructions (README.md - environment variables)
- [ ] Troubleshooting guide (`docs/🎨 features/realistic-tts/troubleshooting.md`)
- [ ] Performance characteristics (`docs/🎨 features/realistic-tts/performance.md`)

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| API latency causes presentation delays | Medium | High | Implement aggressive caching, preload next slide audio |
| Network failures interrupt playback | Medium | Medium | Retry logic, cache fallback, clear error messages |
| Audio sync with subtitles is complex | Low | Medium | Use audio timeupdate events, thorough testing |
| Browser autoplay restrictions | High | Low | Require user interaction, show play button |
| OpenAI API rate limits | Low | Medium | Implement request queuing, monitor usage |

### Dependencies and Blockers
- [ ] **Blocker 1**: OpenAI API key required - obtain from OpenAI account
- [ ] **Blocker 2**: None identified

## Quality Gates

### Before Each Commit
- [ ] All new tests pass
- [ ] All existing tests pass
- [ ] Code follows project standards (ESLint, Prettier)
- [ ] Documentation updated
- [ ] No TypeScript errors

### Before Task Completion
- [ ] Task acceptance criteria met
- [ ] Integration tests pass
- [ ] Performance benchmarks met (if applicable)
- [ ] Code review ready

### Before Story Completion
- [ ] All story acceptance criteria met
- [ ] Full test suite passes (unit, integration, e2e)
- [ ] Code coverage maintained/improved
- [ ] Documentation complete and accurate
- [ ] Performance requirements met (< 2s generation, < 500ms playback)
- [ ] Security requirements met (API key not exposed)
- [ ] User testing completed with positive feedback

## Progress Tracking

### Confidence Assessment
| Area | Score (1-10) | Notes |
|------|--------------|-------|
| Requirements Clarity | 9 | Clear requirements, well-defined API |
| Technical Approach | 8 | Straightforward integration, some complexity in audio sync |
| Effort Estimation | 7 | Reasonable estimates, may need adjustment for audio sync |
| Risk Mitigation | 8 | Good mitigation strategies, caching is key |
| **Overall Confidence** | **8** | High confidence, clear path forward |

### Time Tracking
| Phase | Estimated | Actual | Variance | Notes |
|-------|-----------|--------|----------|-------|
| Phase 1 | 2.5 hours | - | - | Setup and API endpoint |
| Phase 2 | 7 hours | - | - | Core implementation |
| Phase 3 | 6 hours | - | - | Integration and polish |
| **Total** | **15.5 hours** | **-** | **-** | ~2 days of focused work |

## Implementation Notes

### Decisions Made
- **2025-11-07**: Chose OpenAI TTS over ElevenLabs for better integration with existing OpenAI usage
- **2025-11-07**: Using `tts-1` model initially for better performance, can upgrade to `tts-1-hd` later
- **2025-11-07**: Implementing in-memory cache first, can move to IndexedDB if needed

### Changes from Original Plan
- None yet

### Lessons Learned
- To be updated during implementation

## Completion Checklist
- [ ] All tasks completed
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Story acceptance criteria verified
- [ ] Quality gates passed
- [ ] Implementation notes updated
- [ ] Agent changelog updated
