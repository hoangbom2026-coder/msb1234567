# MBayS Frontend System

## 📂 Project Structure
- `public/`: Static assets (images, flags, etc.).
- `src/`: Main source code.
  - `assets/`: Static assets imported by components.
  - `components/`: UI components and shared views.
  - `hooks/`: Custom React hooks.
  - `layouts/`: Page layouts.
  - `lib/`: Utilities, API configuration, and stores.
  - `pages/`: Main page views.
  - `styles/`: Global CSS and Tailwind styles.

## 🚀 Getting Started
1. Setup environment variables: `cp .env.example .env`
2. Install dependencies: `npm install`
3. Run development: `npm run dev`
4. Build for production: `npm run build`

## ⚙️ Configuration
- **Vite Proxy**: Configured in `vite.config.ts` to proxy `/api` and `/socket.io` to backend.
- **Tailwind CSS**: Custom theme and animations in `tailwind.config.ts`.
- **API**: Centralized axios instance in `src/lib/api.ts`.
