export interface ISpeechToTextProvider {
  transcribe(audioBuffer: Buffer, mimeType: string): Promise<string>;
  isAvailable(): boolean;
}