import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DiseaseClass } from "./inference";
import type { ApiRuleThreshold } from "@/types/api";
import type { UrgencyLevel } from "@/types/domain";

const THRESHOLDS_KEY = "maizai_rule_thresholds";
const THRESHOLDS_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface SensorContext {
  soilMoisture: number;
  ambientTemperature: number;
  relativeHumidity: number;
}

export interface Recommendation {
  adviceType: string;
  adviceText: string;
  urgencyLevel: UrgencyLevel;
}

// Default thresholds mirror the web back-end seed data
const DEFAULT_THRESHOLDS: ApiRuleThreshold[] = [
  {
    id: "d1", diseaseClass: "Common_Rust", parameter: "relativeHumidity",
    minValue: 70, maxValue: null, urgencyLevel: "HIGH",
    adviceType: "SPRAY", adviceText: "High humidity favours rust spread. Apply fungicide immediately and improve air circulation.",
    active: true,
  },
  {
    id: "d2", diseaseClass: "Gray_Leaf_Spot", parameter: "relativeHumidity",
    minValue: 75, maxValue: null, urgencyLevel: "HIGH",
    adviceType: "SPRAY", adviceText: "Conditions are ideal for gray leaf spot. Apply strobilurin fungicide promptly.",
    active: true,
  },
  {
    id: "d3", diseaseClass: "Blight", parameter: "ambientTemperature",
    minValue: 25, maxValue: 35, urgencyLevel: "HIGH",
    adviceType: "REMOVE", adviceText: "Remove and destroy severely blighted plants to prevent further spread. Do not compost.",
    active: true,
  },
  {
    id: "d4", diseaseClass: "Common_Rust", parameter: "ambientTemperature",
    minValue: null, maxValue: 25, urgencyLevel: "MEDIUM",
    adviceType: "MONITOR", adviceText: "Cool temperatures slow rust development. Monitor daily and apply fungicide if symptoms worsen.",
    active: true,
  },
  {
    id: "d5", diseaseClass: "Gray_Leaf_Spot", parameter: "soilMoisture",
    minValue: null, maxValue: 30, urgencyLevel: "MEDIUM",
    adviceType: "IRRIGATE", adviceText: "Low soil moisture may stress the plant. Irrigate and apply protective fungicide.",
    active: true,
  },
  {
    id: "d6", diseaseClass: "Blight", parameter: "soilMoisture",
    minValue: 80, maxValue: null, urgencyLevel: "HIGH",
    adviceType: "DRAIN", adviceText: "Waterlogged soil promotes blight. Improve drainage immediately and apply copper-based bactericide.",
    active: true,
  },
];

// Fallback recommendations when no sensor data is available
const FALLBACK_RECOMMENDATIONS: Record<DiseaseClass, Recommendation> = {
  Healthy: {
    adviceType: "OK",
    adviceText: "This leaf appears healthy. Continue routine monitoring.",
    urgencyLevel: "LOW",
  },
  Common_Rust: {
    adviceType: "SPRAY",
    adviceText: "Common Rust detected. Apply registered fungicide and monitor neighbouring plants.",
    urgencyLevel: "MEDIUM",
  },
  Gray_Leaf_Spot: {
    adviceType: "SPRAY",
    adviceText: "Gray Leaf Spot detected. Apply strobilurin fungicide and avoid overhead irrigation.",
    urgencyLevel: "MEDIUM",
  },
  Blight: {
    adviceType: "REMOVE",
    adviceText: "Blight detected. Remove affected material and apply copper-based bactericide.",
    urgencyLevel: "HIGH",
  },
};

// Confidence above this is treated as a confident call; below it the advice
// text is hedged so farmers know to treat the diagnosis with some caution.
const CONFIDENT_THRESHOLD = 0.85;

function hedge(rec: Recommendation, confidence: number): Recommendation {
  if (confidence >= CONFIDENT_THRESHOLD) return rec;
  return {
    ...rec,
    adviceText: `The model is moderately confident in this result. ${rec.adviceText}`,
  };
}

export function generateRecommendation(
  classification: { diseaseClass: DiseaseClass; confidence: number },
  sensorContext: SensorContext | null,
  thresholds: ApiRuleThreshold[],
): Recommendation {
  if (classification.diseaseClass === "Healthy") {
    return FALLBACK_RECOMMENDATIONS.Healthy;
  }

  if (!sensorContext) {
    return hedge(FALLBACK_RECOMMENDATIONS[classification.diseaseClass], classification.confidence);
  }

  // Find the highest-urgency matching threshold for this disease
  const active = thresholds.filter(
    (t) => t.active && t.diseaseClass === classification.diseaseClass,
  );

  const urgencyOrder: UrgencyLevel[] = ["HIGH", "MEDIUM", "LOW"];
  for (const urgency of urgencyOrder) {
    const match = active.find((t) => {
      if (t.urgencyLevel !== urgency) return false;
      const val = sensorContext[t.parameter];
      const aboveMin = t.minValue === null || val >= t.minValue;
      const belowMax = t.maxValue === null || val <= t.maxValue;
      return aboveMin && belowMax;
    });
    if (match) {
      return hedge(
        {
          adviceType: match.adviceType,
          adviceText: match.adviceText,
          urgencyLevel: match.urgencyLevel,
        },
        classification.confidence,
      );
    }
  }

  // No threshold matched; fall back to default for this disease
  return hedge(FALLBACK_RECOMMENDATIONS[classification.diseaseClass], classification.confidence);
}

export async function getCachedThresholds(): Promise<ApiRuleThreshold[]> {
  try {
    const raw = await AsyncStorage.getItem(THRESHOLDS_KEY);
    if (!raw) return DEFAULT_THRESHOLDS;
    const { thresholds, cachedAt } = JSON.parse(raw) as {
      thresholds: ApiRuleThreshold[];
      cachedAt: number;
    };
    if (Date.now() - cachedAt > THRESHOLDS_TTL_MS) return DEFAULT_THRESHOLDS;
    return thresholds;
  } catch {
    return DEFAULT_THRESHOLDS;
  }
}

export async function cacheThresholds(thresholds: ApiRuleThreshold[]): Promise<void> {
  await AsyncStorage.setItem(
    THRESHOLDS_KEY,
    JSON.stringify({ thresholds, cachedAt: Date.now() }),
  );
}
