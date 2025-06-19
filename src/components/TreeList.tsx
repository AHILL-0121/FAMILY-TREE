import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';

export default function TreeList({ trees, onCreate, onSelect }: { trees: any[], onCreate: (name: string) => void, onSelect: (id: number) => void }) {
  const [newName, setNewName] = useState('');
  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow space-y-4 text-black">
      <h2 className="text-lg font-bold flex items-center gap-2 text-black"><Users className="w-5 h-5 text-green-600" /> Your Family Trees</h2>
      <ul className="space-y-2">
        {trees.map(tree => (
          <li key={tree.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 hover:bg-green-50 cursor-pointer text-black" onClick={() => onSelect(tree.id)}>
            <span className="text-black">{tree.name}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={e => { e.preventDefault(); if (newName) { onCreate(newName); setNewName(''); } }} className="flex gap-2">
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New tree name" className="flex-1 px-2 py-1 border rounded text-black placeholder-black" />
        <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-green-600"><Plus className="w-4 h-4" />Create</button>
      </form>
    </div>
  );
} 