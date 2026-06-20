import { useState, useCallback } from "react";
import { classifyLeaf, type ClassificationResult } from "@/lib/inference";

export function useInference() {
  const [isRunning, setIsRunning] = useState(false);

  // Throws on failure so the caller can surface the real error message.
  const classify = useCallback(
    async (imageUri: string): Promise<ClassificationResult> => {
      setIsRunning(true);
      try {
        return await classifyLeaf(imageUri);
      } finally {
        setIsRunning(false);
      }
    },
    [],
  );

  return { classify, isRunning };
}
