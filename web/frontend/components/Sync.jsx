import { useState } from "react";
import { LegacyCard, Text } from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function Sync() {
  const fetch = useAuthenticatedFetch();
  const syncData = async () => {
    const response = await fetch("/api/datasync", {
      method: "POST",
    });
    console.log(response);
  };
  return (
    <LegacyCard
      title="Sync your data to talk to GPT"
      sectioned
      primaryFooterAction={{
        content: "Sync data",
        onAction: () => {
          syncData();
        },
      }}
    >
      <p>View a summary of your online store’s performance.</p>
    </LegacyCard>
  );
}
