import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hmms';



import router from './routes.js';
import authRouter from './auth.js';

app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use('/api/auth', authRouter);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


app.get('/', (req, res) => {
  res.send('HMMS Backend Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
