# MaizAI

MaizAI is a mobile-first maize leaf disease detection system for Cameroonian smallholder farmers. It combines on-device computer vision (TensorFlow Lite), a cloud back-end (Next.js + PostgreSQL), and an IoT environmental sensor node (ESP32) to deliver timely, contextualised disease intervention recommendations. The system targets the documented 30–35% maize yield loss attributable to delayed disease detection.

## Repository structure

```
maizai/
├── docs/        Architecture documents, data model, and API contracts
├── ai/          TensorFlow Lite disease classifier training pipeline (Python / Colab)
├── web/         Next.js 15 full-stack PWA — cloud back-end and admin UI
├── mobile/      React Native (Expo) Android mobile app
└── firmware/    ESP32 PlatformIO sensor node firmware
```

## Subproject documentation

- [ai/README.md](ai/README.md) — Disease classifier training pipeline
- [web/README.md](web/README.md) — Next.js cloud back-end and admin UI
- [mobile/README.md](mobile/README.md) — React Native (Expo) Android mobile app
- [firmware/README.md](firmware/README.md) — Sensor node firmware

## Academic context

This repository is the software artefact for a Master of Engineering dissertation submitted to the University of Buea, Faculty of Engineering and Technology, Department of Computer Engineering, academic year 2025/2026. Supervised by Dr. Djouela Ines.

## License

MIT — see [LICENSE](LICENSE).
