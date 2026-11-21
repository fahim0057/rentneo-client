export const CATEGORIES = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
] as const;
export const RENTAL_TYPES = ["daily", "weekly", "monthly"] as const;
export const CONDITIONS = ["new", "like-new", "good", "fair"] as const;

export type EquipmentStatus = "pending" | "approved" | "rejected";

export interface Equipment {
  _id: string;
  name: string;
  description: string;
  category: (typeof CATEGORIES)[number];
  location: string;
  rentalPrice: number;
  rentalType: (typeof RENTAL_TYPES)[number];
  availableQuantity: number;
  condition: (typeof CONDITIONS)[number];
  brand: string;
  model: string;
  image: string;
  terms: string;
  status: EquipmentStatus;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
}