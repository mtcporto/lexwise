import { UnifiedSearch } from '@/components/search/UnifiedSearch';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pesquisa Unificada | LexWise Assistant',
  description: 'Realize buscas em diversas fontes de dados jurídicos.',
};

export default function UnifiedSearchPage() {
  return <UnifiedSearch />;
}
