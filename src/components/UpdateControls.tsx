"use client";

import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UpdateControls({ lastUpdated, onUpdate }: { lastUpdated: Date | null, onUpdate: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [canUpdate, setCanUpdate] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastUpdated) {
        setCanUpdate(true);
        return;
      }

      const now = new Date();
      const diff = now.getTime() - new Date(lastUpdated).getTime();
      const oneHour = 60 * 60 * 1000;
      
      if (diff < oneHour) {
        setCanUpdate(false);
        const remaining = oneHour - diff;
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setCanUpdate(true);
        setTimeLeft("");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await onUpdate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900">
      <div className="flex-1">
        <p className="text-sm text-zinc-500">Last Updated</p>
        <p className="font-medium">
          {lastUpdated ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true }) : 'Never'}
        </p>
      </div>
      
      {timeLeft && (
        <div className="text-sm text-orange-500 font-mono">
          Next update in: {timeLeft}
        </div>
      )}

      <Button 
        onClick={handleUpdate} 
        disabled={!canUpdate || loading}
        variant={canUpdate ? "default" : "secondary"}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Updating...' : 'Update Data'}
      </Button>
    </div>
  );
}
