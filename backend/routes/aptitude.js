import express from 'express';
import { generateAptitude } from '../controllers/aptitudeController.js';

const router = express.Router();

router.get('/generate', generateAptitude);

export default router;