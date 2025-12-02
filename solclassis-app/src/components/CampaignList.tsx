"use client";
import { useEffect, useState } from "react";

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    fetch("/api/fetchCampaigns")
      .then((res) => res.json())
      .then((data) => setCampaigns(data))
      .catch((error) => console.error("Error fetching campaigns:", error));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold">Campaigns</h2>
      <ul>
        {campaigns.length === 0 ? (
          <p>No campaigns found</p>
        ) : (
          campaigns.map((campaign) => (
            <li key={campaign.id} className="p-4 border-b">
              <h3 className="font-semibold">{campaign.title}</h3>
              <p>Target: {campaign.targetAmount} SOL</p>
              <p>Raised: {campaign.raisedAmount} SOL</p>
              <p>Ends: {campaign.endDate}</p>
              <p>Creator: {campaign.creator}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
