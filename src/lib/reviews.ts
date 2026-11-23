export interface Review {
  _id: string;
  bookingId?: string;
  equipmentId?: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
}

export interface ReviewListResponse {
  data: Review[];
  summary: ReviewSummary;
}
