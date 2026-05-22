import DashboardLayout from "../components/DashboardLayout";
import SavedTeamsManager from "../components/SavedTeamsManager";

export default function MyTeams() {
  return (
    <DashboardLayout
      title="My Teams"
      subtitle="Your roster"
    >
      <SavedTeamsManager />
    </DashboardLayout>
  );
}
