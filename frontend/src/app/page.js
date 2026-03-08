import { redirect } from 'next/navigation';

export default function Home() {
  // Directly redirect to the dashboard
  redirect('/dashboard');
}
