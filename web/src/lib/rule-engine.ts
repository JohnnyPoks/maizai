import { DiseaseClass, UrgencyLevel } from "@prisma/client";
import { db } from "@/lib/db";

export interface RuleEngineInput {
  classification: {
    diseaseClass: DiseaseClass;
    confidence: number;
  };
  reading?: {
    soilMoisture: number;
    ambientTemperature: number;
    relativeHumidity: number;
  };
}

export interface RuleEngineOutput {
  adviceType: string;
  adviceText: string;
  urgencyLevel: UrgencyLevel;
}

const DEFAULT_RECOMMENDATION: RuleEngineOutput = {
  adviceType: "monitor",
  adviceText:
    "Continue monitoring your crop. Scout the plot every 48 hours and photograph any new symptoms.",
  urgencyLevel: UrgencyLevel.LOW,
};

export async function generateRecommendation(
  input: RuleEngineInput
): Promise<RuleEngineOutput> {
  const { classification, reading } = input;

  if (classification.diseaseClass === DiseaseClass.HEALTHY && !reading) {
    return {
      adviceType: "healthy",
      adviceText: "Your maize appears healthy. Continue standard agronomic practices.",
      urgencyLevel: UrgencyLevel.LOW,
    };
  }

  const thresholds = await db.ruleThreshold.findMany({
    where: {
      diseaseClass: classification.diseaseClass,
      active: true,
    },
    orderBy: { urgencyLevel: "desc" },
  });

  if (thresholds.length === 0) return DEFAULT_RECOMMENDATION;

  if (reading) {
    for (const t of thresholds) {
      const sensorValue = reading[t.parameter as keyof typeof reading];
      if (typeof sensorValue !== "number") continue;

      const aboveMin = t.minValue === null || sensorValue >= t.minValue;
      const belowMax = t.maxValue === null || sensorValue <= t.maxValue;

      if (aboveMin && belowMax) {
        return {
          adviceType: t.adviceType,
          adviceText: t.adviceText,
          urgencyLevel: t.urgencyLevel,
        };
      }
    }
  }

  // Fall back to the first (highest-urgency) threshold for this disease with reduced urgency
  const fallback = thresholds[0];
  return {
    adviceType: fallback.adviceType,
    adviceText: fallback.adviceText,
    urgencyLevel:
      fallback.urgencyLevel === UrgencyLevel.HIGH ? UrgencyLevel.MEDIUM : UrgencyLevel.LOW,
  };
}
