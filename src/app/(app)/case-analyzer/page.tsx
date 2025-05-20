import { CaseAnalyzer } from '@/components/case-analyzer/CaseAnalyzer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analisador de Caso | LexWise Assistant',
  description: 'Utilize IA para extrair pontos relevantes da descrição do seu caso.',
};

export default function CaseAnalyzerPage() {
  return <CaseAnalyzer />;
}
