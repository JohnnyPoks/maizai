import { useState, useCallback } from "react";
import { classifyLeaf, type ClassificationResult } from "@/lib/inference";

export function useInference() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classify = useCallback(
    async (imageUri: string): Promise<ClassificationResult | null> => {
      setIsRunning(true);
      setError(null);
      try {
        const result = await classifyLeaf(imageUri);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        return null;
      } finally {
        setIsRunning(false);
      }
    },
    [],
  );

  return { classify, isRunning, error };
}
