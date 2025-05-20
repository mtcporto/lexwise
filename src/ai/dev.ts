
import { config } from 'dotenv';
config();

import '@/ai/flows/counterargument-predictor.ts';
import '@/ai/flows/case-analyzer.ts';
import '@/ai/flows/lexml-search-flow.ts';
import '@/ai/flows/senado-search-flow.ts'; // Added new Senado search flow
import '@/ai/flows/camara-search-flow.ts'; // Added new Camara search flow
import '@/ai/flows/cnj-search-flow.ts';   // Added new CNJ search flow
