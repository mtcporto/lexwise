
import { config } from 'dotenv';
config();

import '@/ai/flows/counterargument-predictor.ts';
import '@/ai/flows/case-analyzer.ts';
import '@/ai/flows/lexml-search-flow.ts'; // Added new LexML search flow
