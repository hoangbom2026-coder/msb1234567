# MBayS Admin Dashboard

## 📂 Project Structure
- `public/`: Static assets for the admin panel.
- `src/`: Main source code.
  - `components/`: UI components and layout elements.
  - `hooks/`: Custom React hooks for admin features.
  - `lib/`: Utilities and API configuration.
  - `pages/`: Admin management pages (Users, Transactions, Games, etc.).
  - `styles/`: Styling and global CSS.

## 🚀 Getting Started
1. Setup environment variables: `cp .env.example .env`
2. Install dependencies: `npm install`
3. Run development: `npm run dev`
4. Build for production: `npm run build`

## ⚙️ Configuration
- **Vite Proxy**: Configured in `vite.config.ts` to proxy requests to the backend.
- **Tailwind CSS**: Theme and UI consistency in `tailwind.config.ts`.
