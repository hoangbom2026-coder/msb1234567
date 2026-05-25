# MBayS Backend System

## 📂 Project Structure
- `database/migrations/`: SQL schema and migration files.
- `logs/`: Application log files.
- `src/`: Main source code.
  - `config/`: Configuration for DB, Sockets, etc.
  - `controllers/`: Request handlers.
  - `jobs/`: Scheduled tasks (game scheduler).
  - `middleware/`: Auth, error, and upload middlewares.
  - `models/`: Database model helpers.
  - `public/`: Publicly accessible files (flags, uploads).
  - `routes/`: API routes definition.
  - `services/`: Business logic.
  - `sockets/`: Socket.io event handlers.
  - `utils/`: Helper functions and seed scripts.

## 🚀 Getting Started
1. Setup environment variables: `cp .env.example .env`
2. Install dependencies: `npm install`
3. Initialize Database: Import SQL files from `database/migrations/`.
4. Run Seeding: `npm run seed`
5. Start development: `npm run dev`
