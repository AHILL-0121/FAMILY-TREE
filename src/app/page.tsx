"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Plus, Edit3, Trash2, Save, X, Users, Download, FileText } from "lucide-react";
import { useRouter } from 'next/navigation';
import { getToken, logout } from '../utils/auth';
import { apiFetch } from '../utils/api';
import TreeList from '../components/TreeList';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function HomePage() {
  const [trees, setTrees] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) router.push('/login');
    else fetchTrees();
  }, []);

  async function fetchTrees() {
    const res = await apiFetch(process.env.NEXT_PUBLIC_API_URL + '/trees');
    if (res && res.ok) setTrees(await res.json());
  }

  async function handleCreate(name: string) {
    const res = await apiFetch(process.env.NEXT_PUBLIC_API_URL + '/trees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (res && res.ok) fetchTrees();
  }

  function handleSelect(id: number) {
    router.push(`/tree/${id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-green-100 flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4"><button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button></div>
      <TreeList trees={trees} onCreate={handleCreate} onSelect={handleSelect} />
    </div>
  );
}
