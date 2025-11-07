export type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface TTSRequest {
	text: string;
	voice: OpenAIVoice;
	speed: number; // 0.25 to 4.0
}

export interface TTSResponse {
	audio: ArrayBuffer;
	contentType: string;
}

export interface TTSError {
	error: string;
	message: string;
}
