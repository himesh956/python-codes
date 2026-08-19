import { api } from "@/lib/api";

export async function initiateCall(payload: {
  receiverId: string;
  contextType: "BOOKING" | "APPLICATION";
  contextId: string;
}) {
  const res = await api.post("/calls", payload);
  return res.data.data.call;
}