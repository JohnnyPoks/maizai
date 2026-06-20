import { PrismaClient, DiseaseClass, UrgencyLevel, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Credentials come from the environment — never hard-code them here.
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "Skipping super-admin seed: set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env.local to create one.",
    );
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.upsert({
      where: { email },
      update: { role: Role.SUPER_ADMIN },
      create: {
        email,
        passwordHash,
        fullName: "MaizAI Administrator",
        role: Role.SUPER_ADMIN,
      },
    });
  }

  const thresholds = [
    {
      diseaseClass: DiseaseClass.COMMON_RUST,
      parameter: "relativeHumidity",
      minValue: 80,
      maxValue: null,
      urgencyLevel: UrgencyLevel.HIGH,
      adviceType: "fungicide_urgent",
      adviceText:
        "Spray within 24 hours; high humidity is accelerating rust spread. Use a triazole-based fungicide and ensure full leaf coverage.",
    },
    {
      diseaseClass: DiseaseClass.COMMON_RUST,
      parameter: "relativeHumidity",
      minValue: null,
      maxValue: 80,
      urgencyLevel: UrgencyLevel.MEDIUM,
      adviceType: "fungicide_scheduled",
      adviceText:
        "Apply fungicide within 48–72 hours. Monitor humidity — if it rises above 80%, escalate treatment urgency.",
    },
    {
      diseaseClass: DiseaseClass.GRAY_LEAF_SPOT,
      parameter: "ambientTemperature",
      minValue: 22,
      maxValue: null,
      urgencyLevel: UrgencyLevel.HIGH,
      adviceType: "fungicide_and_remove",
      adviceText:
        "Apply fungicide immediately and remove visibly affected leaves. Warm, humid conditions favour rapid lesion expansion.",
    },
    {
      diseaseClass: DiseaseClass.GRAY_LEAF_SPOT,
      parameter: "ambientTemperature",
      minValue: null,
      maxValue: 22,
      urgencyLevel: UrgencyLevel.MEDIUM,
      adviceType: "monitor_fungicide",
      adviceText:
        "Monitor closely and consider a preventive fungicide application. Scout the plot every 48 hours for new lesions.",
    },
    {
      diseaseClass: DiseaseClass.BLIGHT,
      parameter: "soilMoisture",
      minValue: null,
      maxValue: null,
      urgencyLevel: UrgencyLevel.HIGH,
      adviceType: "fungicide_isolate",
      adviceText:
        "Apply targeted fungicide immediately and isolate infected plants where possible. Blight can devastate a plot within days under favourable conditions.",
    },
    {
      diseaseClass: DiseaseClass.HEALTHY,
      parameter: "soilMoisture",
      minValue: null,
      maxValue: 25,
      urgencyLevel: UrgencyLevel.LOW,
      adviceType: "irrigate",
      adviceText:
        "Increase irrigation — soil moisture is below the optimal range for maize (25–60%). Stressed plants are more susceptible to disease.",
    },
  ];

  // Only seed thresholds if none exist
  const existingCount = await prisma.ruleThreshold.count();
  if (existingCount === 0) {
    for (const t of thresholds) {
      await prisma.ruleThreshold.create({ data: t });
    }
  }

  console.log("Seed complete — Super-Admin user and 6 rule thresholds ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
