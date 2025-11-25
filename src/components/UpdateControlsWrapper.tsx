"use client";

import { useRouter } from 'next/navigation';
import UpdateControls from './UpdateControls';

export default function UpdateControlsWrapper({ lastUpdated, username }: { lastUpdated: Date | null | undefined, username?: string }) {
  const router = useRouter();

  const handleUpdate = async () => {
    await fetch('/api/update', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
    router.refresh();
  };

  // Convert undefined to null for the component
  const date = lastUpdated ?? null;

  return <UpdateControls lastUpdated={date} onUpdate={handleUpdate} />;
}
