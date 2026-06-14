# MaizAI — Disease Classifier Training Pipeline

Training pipeline for the MaizAI maize leaf disease classifier. Takes the public PlantVillage maize subset as input and produces a quantised TensorFlow Lite model that runs on Android devices in under two seconds per inference.

## Quick start

Open [training.ipynb](training.ipynb) in Google Colab, select GPU runtime (T4), and run all cells in order. The final cells download the `.tflite` model and supporting artefacts to your local machine.

## Outputs committed to the repository

Files saved to [ai/models/](models/) after a successful training run:

- `maize_classifier.tflite` — quantised TensorFlow Lite model
- `metrics.json` — test-set accuracy, precision, recall, F1 per class
- `confusion_matrix.png` — confusion matrix heatmap
- `training_curves.png` — accuracy and loss curves over epochs

## Dataset

**Kaggle:** https://www.kaggle.com/datasets/smaranjitghose/corn-or-maize-leaf-disease-dataset

The dataset is NOT committed to this repository. The notebook downloads it automatically on first run via `kagglehub`. Ensure your Kaggle API credentials are configured in the Colab environment before running.

## Reproducibility

All random seeds are fixed at `SEED = 42` (Python, NumPy, TensorFlow). Library versions are pinned in [requirements.txt](requirements.txt). To reproduce results outside Colab, create a virtual environment and run `pip install -r requirements.txt`.
