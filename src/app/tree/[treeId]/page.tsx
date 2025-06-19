"use client";
import { useRouter, useParams } from 'next/navigation';
import { getToken, logout } from '../../../utils/auth';
import FamilyTreeBuilder from '../../../components/FamilyTreeBuilder';
import { useEffect } from 'react';

export default function TreePage() {
  const router = useRouter();
  const params = useParams();
  const treeId = params?.treeId as string;

  useEffect(() => {
    if (!getToken()) router.push('/login');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-green-100">
      <div className="absolute top-4 right-4"><button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button></div>
      <FamilyTreeBuilder treeId={treeId} />
    </div>
  );
} 