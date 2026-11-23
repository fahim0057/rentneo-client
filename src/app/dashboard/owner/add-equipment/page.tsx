import { EquipmentForm } from "@/components/equipment-form";

// The dashboard shell waits for the session before rendering its children, so
// this route deliberately opts out of instant-navigation validation.
export const instant = false;

export default function AddEquipmentPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Add Equipment</h1>
      <EquipmentForm />
    </div>
  );
}