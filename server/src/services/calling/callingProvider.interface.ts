export interface InitiateCallInput {
  callerId: string;
  receiverId: string;
  contextId: string;
}

export interface InitiateCallResult {
  providerCallId: string;
  status: "INITIATED" | "RINGING" | "CONNECTED" | "FAILED";
}

export interface CallStatusResult {
  status: "INITIATED" | "RINGING" | "CONNECTED" | "COMPLETED" | "FAILED" | "MISSED";
  durationSeconds?: number;
}

/**
 * Per the brief: "Create a provider abstraction... can later be
 * connected to a real telephony provider." No real number-masking
 * (Twilio Proxy, Exotel, etc.) is implemented — this interface is the
 * contract a real provider would fulfill. Explicitly NOT fake number
 * masking, as instructed — the mock provider below returns clear
 * "not available yet" statuses rather than pretending a call happened.
 */
export interface ICallingProvider {
  initiateCall(input: InitiateCallInput): Promise<InitiateCallResult>;
  endCall(providerCallId: string): Promise<void>;
  getCallStatus(providerCallId: string): Promise<CallStatusResult>;
  isAvailable(): boolean;
}