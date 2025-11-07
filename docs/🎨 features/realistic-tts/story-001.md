# Story 001: Integrate OpenAI TTS for Realistic Voice Narration

## Story Information
- **Story Number**: 001
- **Title**: Replace Web Speech API with OpenAI TTS for Realistic Voice Narration
- **Priority**: High
- **Estimated Effort**: Medium
- **Status**: Planning

## Description
Replace the current browser-based Web Speech API (SpeechSynthesis) with OpenAI's Text-to-Speech API to provide significantly more realistic and natural-sounding voice narration for presentations. The OpenAI TTS API offers 6 high-quality neural voices with better prosody, emotion, and naturalness compared to browser TTS.

## User Stories
- As a presentation viewer, I want to hear natural, human-like voice narration so that the presentation is more engaging and professional
- As a presentation creator, I want to choose from multiple high-quality voices so that I can match the voice to the presentation's tone and audience
- As a presentation viewer, I want smooth audio playback without robotic artifacts so that I can focus on the content rather than the voice quality

## Acceptance Criteria
- [ ] OpenAI TTS API is integrated and replaces Web Speech API for voice narration
- [ ] Users can select from all 6 OpenAI voices (alloy, echo, fable, onyx, nova, shimmer)
- [ ] Voice speed control (0.5x to 2.0x) continues to work with OpenAI TTS
- [ ] Audio playback is smooth with minimal latency
- [ ] Subtitle synchronization continues to work correctly
- [ ] Existing keyboard shortcuts (V for voice cycling, +/- for speed) continue to function
- [ ] Audio plays automatically when presentation advances (if autoAdvance is enabled)
- [ ] Error handling for API failures with graceful fallback
- [ ] API key is securely stored in environment variables

## Business Context
### Problem Statement
The current Web Speech API provides robotic, low-quality voice narration that detracts from the professional presentation experience. Users expect natural, engaging voice narration similar to modern AI assistants and audiobook narrators.

### Success Metrics
- Improved voice quality (subjective user feedback)
- Reduced user complaints about voice quality
- Increased presentation completion rates
- Positive user feedback on voice naturalness

### Assumptions
- OpenAI API key is available or can be obtained
- Network connectivity is reliable for API calls
- Audio streaming/buffering can be implemented for smooth playback
- Cost of OpenAI TTS is acceptable (~$15 per 1M characters)

## Technical Requirements
### Functional Requirements
- **FR1**: Integrate OpenAI TTS API client in backend
- **FR2**: Create API endpoint to generate speech from text
- **FR3**: Support all 6 OpenAI voices with voice selection UI
- **FR4**: Support speed adjustment (0.25x to 4.0x as per OpenAI API)
- **FR5**: Stream or buffer audio for smooth playback
- **FR6**: Maintain subtitle synchronization with audio playback
- **FR7**: Handle API errors gracefully with user feedback
- **FR8**: Cache generated audio to reduce API calls and costs

### Non-Functional Requirements
- **Performance**: Audio generation latency < 2 seconds for typical slide narration
- **Performance**: Audio playback starts within 500ms of request
- **Security**: API keys stored in environment variables, never exposed to client
- **Security**: Rate limiting to prevent API abuse
- **Reliability**: Graceful degradation if API is unavailable
- **Cost**: Implement caching to minimize redundant API calls
- **Compatibility**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## Dependencies
### Internal Dependencies
- [ ] Existing presentation store (`src/lib/stores/presentation.svelte.ts`)
- [ ] Timeline event system for speech synchronization
- [ ] Environment configuration for API keys

### External Dependencies
- [ ] OpenAI API key (requires account and billing setup)
- [ ] OpenAI Node.js SDK or HTTP client
- [ ] Audio playback library (HTML5 Audio API or Web Audio API)

## Risks and Considerations
### Technical Risks
- **Risk 1**: API latency could cause delays in presentation flow
  - *Mitigation*: Pre-generate and cache audio for known slides, implement buffering
- **Risk 2**: Network failures could interrupt audio playback
  - *Mitigation*: Implement retry logic, fallback to cached audio, graceful error messages
- **Risk 3**: Audio synchronization with subtitles may be more complex than Web Speech API
  - *Mitigation*: Use audio timeupdate events, test thoroughly with different speeds
- **Risk 4**: Browser audio playback restrictions (autoplay policies)
  - *Mitigation*: Require user interaction before first audio play, show clear play button

### Business Risks
- **Risk 1**: OpenAI API costs could increase with usage
  - *Impact*: Implement aggressive caching, monitor usage, set budget alerts
- **Risk 2**: OpenAI API rate limits could affect user experience
  - *Impact*: Implement request queuing, show loading states, cache aggressively

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All tests pass (unit, integration, e2e)
- [ ] Code review completed
- [ ] Documentation updated (system architecture, API docs)
- [ ] Performance requirements met (latency < 2s, playback < 500ms)
- [ ] Security review passed (API key handling, rate limiting)
- [ ] Error handling tested (API failures, network issues)
- [ ] Cost monitoring implemented (logging API usage)
- [ ] User testing completed with positive feedback on voice quality

## Notes
- OpenAI TTS supports two models: `tts-1` (faster, lower quality) and `tts-1-hd` (slower, higher quality)
- Consider starting with `tts-1` for better performance, allow users to opt into `tts-1-hd`
- OpenAI TTS API returns audio in various formats (mp3, opus, aac, flac) - mp3 is most compatible
- The API supports streaming responses which could improve perceived latency
- Consider implementing a simple audio cache in browser localStorage or IndexedDB for frequently used narrations
