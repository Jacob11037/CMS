'use client';
import { useAuth } from '../context/AuthContext'

export default function LogoutButton() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return null;

  return <button onClick={logout}>Logout</button>;
}
