import {
  ICallingProvider,
  InitiateCallInput,
  InitiateCallResult,
  CallStatusResult,
} from "./callingProvider.interface";

/**
 * The only provider currently wired up. Honestly reports itself as
 * NOT available for real calls (isAvailable() = false) — this is what
 * drives the graceful "Calling isn't set up yet, message the worker
 * instead" UI state, rather than pretending a phone call happens.
 * When a real telephony provider (Twilio, Exotel) is integrated
 * later, it implements this same interface and is swapped in in
 * calling.service.ts — nothing else in the app changes.
 */
export class MockCallingProvider implements ICallingProvider {
  isAvailable(): boolean {
    return false;
  }

  async initiateCall(_input: InitiateCallInput): Promise<InitiateCallResult> {
    throw new Error("No telephony provider is configured yet");
  }

  async endCall(_providerCallId: string): Promise<void> {
    throw new Error("No telephony provider is configured yet");
  }

  async getCallStatus(_providerCallId: string): Promise<CallStatusResult> {
    throw new Error("No telephony provider is configured yet");
  }
}