// pages/forbidden.js
'use client';
import { useRouter } from 'next/navigation';

export default function Forbidden() {
  const router = useRouter();

  return (
    <div>
      <h1>403 - Forbidden</h1>
      <p>You do not have the required permissions to view this page.</p>
      <button onClick={() => router.push('/')}>Go Back Home</button>
    </div>
  );
}
