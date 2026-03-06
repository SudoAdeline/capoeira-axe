import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { runMigrations } from './migrate.js';
import authRoutes from './routes/auth.js';
import stripeRoutes from './routes/stripe.js';
import userDataRoutes from './routes/user-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Stripe webhook needs raw body — must be BEFORE express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/data', userDataRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => res.sendFile(join(__dirname, '..', 'dist', 'index.html')));
}

runMigrations().then(() => {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
