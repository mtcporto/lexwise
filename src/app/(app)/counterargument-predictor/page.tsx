import { CounterargumentPredictor } from '@/components/counterargument-predictor/CounterargumentPredictor';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preditor de Contra-Argumentos | LexWise Assistant',
  description: 'Antecipe contra-argumentos com o auxílio de IA e fortaleça sua estratégia.',
};

export default function CounterArgumentPredictorPage() {
  return <CounterargumentPredictor />;
}
