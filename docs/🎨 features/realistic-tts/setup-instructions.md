# OpenAI TTS Setup Instructions

## Prerequisites
- OpenAI API account with billing enabled
- OpenAI API key

## Configuration Steps

### 1. Obtain OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you won't be able to see it again)

### 2. Configure Environment Variables
1. Create a `.env` file in the project root (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

2. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. Restart the development server for changes to take effect

### 3. Verify Installation
1. Start the development server: `npm run dev`
2. Create or open a presentation
3. Play the presentation - you should hear high-quality OpenAI TTS voices
4. Press `V` to cycle through the 6 available voices:
   - alloy
   - echo
   - fable
   - onyx
   - nova
   - shimmer

## Voice Characteristics

- **alloy**: Neutral, balanced voice
- **echo**: Clear, professional voice
- **fable**: Warm, expressive voice
- **onyx**: Deep, authoritative voice
- **nova**: Bright, energetic voice
- **shimmer**: Soft, gentle voice

## Speed Control
- Press `+` to increase speed (up to 2.0x)
- Press `-` to decrease speed (down to 0.5x)
- Default speed: 1.2x

## Troubleshooting

### Audio Not Playing
1. Check browser console for errors
2. Verify OPENAI_API_KEY is set in `.env`
3. Ensure OpenAI account has billing enabled
4. Check network connectivity

### API Rate Limits
- OpenAI TTS has rate limits based on your account tier
- Audio is cached to minimize API calls
- Cache stores up to 50 audio files for 1 hour

### Cost Management
- OpenAI TTS costs ~$15 per 1M characters
- Typical presentation slide: 50-200 characters
- Caching significantly reduces costs for repeated content
- Monitor usage in OpenAI dashboard

## API Endpoint
The TTS functionality is exposed via:
- **Endpoint**: `POST /api/tts/generate`
- **Request Body**:
  ```json
  {
    "text": "Text to convert to speech",
    "voice": "alloy",
    "speed": 1.2
  }
  ```
- **Response**: Audio file (audio/mpeg)

## Security Notes
- Never commit `.env` file to version control
- API key is only used server-side
- Audio responses are cached with long expiration headers
- Rate limiting should be implemented for production use
