import CampaignForm from "@/components/CampaignForm";
import CampaignList from "@/components/CampaignList";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Solclassis Crowdfunding</h1>
      <CampaignForm />
      <div className="mt-10">
        <CampaignList />
      </div>
    </div>
  );
}
