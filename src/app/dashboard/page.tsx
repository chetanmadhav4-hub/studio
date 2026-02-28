import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to the main orders page by default
  redirect('/dashboard/orders');
}