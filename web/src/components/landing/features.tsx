import { Wifi, MapPin, Wheat } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const features = [
  {
    icon: Wifi,
    title: "Offline first",
    description:
      "The disease classifier runs entirely on your device using TensorFlow Lite. Recommendations are cached locally so the app works with no internet connection on the plot.",
  },
  {
    icon: MapPin,
    title: "Local context",
    description:
      "Disease recommendations are enriched with live soil moisture, temperature, and humidity readings from the ESP32 sensor node installed on your farm.",
  },
  {
    icon: Wheat,
    title: "Built for Cameroon",
    description:
      "Validated on Cameroonian maize plots targeting the four most economically significant diseases: Common Rust, Gray Leaf Spot, Blight, and Healthy crop.",
  },
];

export function Features() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-brand-900">
          Why MaizAI?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-earth-600">
          Targeting the 30–35% maize yield loss attributable to delayed disease detection.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="border-brand-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                    <Icon size={20} className="text-brand-600" />
                  </div>
                  <h3 className="font-semibold text-brand-900">{f.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-earth-600">{f.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
