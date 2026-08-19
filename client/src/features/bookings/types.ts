export interface Booking {
  _id: string;
  customer: string;
  worker: {
    _id: string;
    fullName: string;
    photoUrl?: string;
    trustScore: number;
    averageRating: number;
  };
  category: { _id: string; name: string; icon?: string };
  isUrgent: boolean;
  requestedFor: string;
  respondBy?: string;
  status:
    | "REQUESTED"
    | "ACCEPTED"
    | "DECLINED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "DISPUTED";
  agreedWage: { type: string; amount: number; currency: string };
  location: { city: string; addressNote?: string };
  isRepeatBooking: boolean;
  createdAt: string;
}