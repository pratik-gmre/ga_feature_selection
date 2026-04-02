# 🧬 GA Feature Selection System

Full-stack application using a **Genetic Algorithm** to find the optimal feature subset for ML classification models.

---

## 📁 Project Structure

```
ga-feature-selection/
├── backend/                        ← Python · FastAPI
│   ├── main.py                     ← REST API (6 endpoints)
│   ├── requirements.txt
│   ├── ga/
│   │   ├── __init__.py
│   │   └── genetic_algorithm.py    ← Full GA engine
│   └── ml/
│       ├── __init__.py
│       └── evaluator.py            ← ML fitness oracle
│
├── frontend/                       ← React · Tailwind CSS · Vite
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── context/
│       │   └── GAContext.jsx       ← Global state
│       ├── services/
│       │   └── api.js              ← All API calls
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── UI.jsx
│       │   ├── GAConfigForm.jsx
│       │   ├── EvolutionChart.jsx
│       │   └── AccuracyChart.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── Upload.jsx
│           ├── Simulation.jsx
│           └── Results.jsx
│
├── sample_dataset.csv
└── README.md
```

---

## ⚙️ Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API → http://localhost:8000  
Docs → http://localhost:8000/docs

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/upload` | Upload CSV |
| POST | `/initialize` | Init GA + ML |
| POST | `/run` | Run N generations |
| POST | `/step` | One generation |
| GET | `/result` | Best subset + metrics |

---

## 💻 Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend → http://localhost:3000

---

## 🧬 GA Design

**Chromosome:** binary vector — 1 = feature selected, 0 = excluded

**Fitness:** `Accuracy − α × (n_selected / n_total)`

**Operators:** Tournament selection · Two-point crossover · Bit-flip mutation · Elitism

**Models:** Logistic Regression · Decision Tree · Random Forest

---

## 🚀 Quick Start

1. `cd backend && uvicorn main:app --reload`
2. `cd frontend && npm install && npm run dev`
3. Open http://localhost:3000
4. Upload `sample_dataset.csv`, select `species` as target
5. Initialize GA → Run Full GA → View Results
