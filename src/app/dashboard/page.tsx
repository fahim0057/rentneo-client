import { DashboardOverview } from "./dashboard-overview";

// The dashboard shell waits for the session before rendering its children, so
// this route deliberately opts out of instant-navigation validation.
export const instant = false;

export default function DashboardPage() {
  return <DashboardOverview />;
}
