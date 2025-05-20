import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/dashboard');
  return null; // Or a loading spinner, but redirect should handle it
}
