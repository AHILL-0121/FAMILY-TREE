"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusIcon, FolderTreeIcon, UserIcon, SettingsIcon, HelpCircleIcon, LogOutIcon, SearchIcon, DownloadIcon, UploadIcon } from "lucide-react";
import { apiFetch } from "../../utils/api";

export default function DashboardPage() {
	const [trees, setTrees] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [newTreeName, setNewTreeName] = useState("");

	useEffect(() => {
		fetchTrees();
	}, []);

	async function fetchTrees() {
		try {
			const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/trees`);
			if (res && res.ok) {
				const data = await res.json();
				setTrees(data);
			}
		} catch (error) {
			console.error("Failed to fetch trees:", error);
		} finally {
			setLoading(false);
		}
	}

	async function handleCreateTree() {
		if (!newTreeName.trim()) return;
		
		try {
			const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/trees`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newTreeName })
			});
			
			if (res && res.ok) {
				setNewTreeName("");
				setShowCreateModal(false);
				fetchTrees();
			}
		} catch (error) {
			console.error("Failed to create tree:", error);
		}
	}

	const filteredTrees = trees.filter(tree => 
		tree.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading family trees...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-md px-4 py-3">
				<div className="flex items-center justify-between max-w-7xl mx-auto">
					<div className="flex items-center space-x-2">
						<div className="text-2xl font-bold text-emerald-600">FamilyTree</div>
					</div>
					<div className="flex items-center space-x-4">
						<div className="relative">
							<button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full py-1 px-3">
								<UserIcon size={18} />
								<span className="text-sm font-medium">Guest</span>
							</button>
						</div>
					</div>
				</div>
			</header>
			<main className="max-w-7xl mx-auto px-4 py-6">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
					<div>
						<h1 className="text-2xl font-bold text-gray-800">Your Family Trees</h1>
						<p className="text-gray-600 mt-1">Manage and explore your family connections</p>
					</div>
					<div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
						<button 
							onClick={() => setShowCreateModal(true)} 
							className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md"
						>
							<PlusIcon size={18} className="mr-2" />
							Create New Tree
						</button>
						<div className="flex space-x-2">
							<button className="flex items-center justify-center bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50">
								<UploadIcon size={18} className="mr-2" />
								Import
							</button>
							<button className="flex items-center justify-center bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50">
								<DownloadIcon size={18} className="mr-2" />
								Export
							</button>
						</div>
					</div>
				</div>
				<div className="relative mb-6">
					<SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
					<input 
						type="text" 
						placeholder="Search your family trees..." 
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md" 
					/>
				</div>
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Edited</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredTrees.map(tree => (
								<tr key={tree.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<FolderTreeIcon size={18} className="text-emerald-500 mr-3" />
											<Link href={`/tree/${tree.id}`} className="text-emerald-600 hover:underline font-medium">
												{tree.name}
											</Link>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{new Date(tree.updated_at || tree.created_at).toLocaleDateString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{tree.member_count || 0} members
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<Link href={`/tree/${tree.id}`} className="text-emerald-600 hover:text-emerald-800 mr-4">View</Link>
										<button className="text-gray-600 hover:text-gray-800">Edit</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{filteredTrees.length === 0 && (
						<div className="text-center py-8">
							<FolderTreeIcon size={48} className="mx-auto text-gray-300" />
							<p className="mt-2 text-gray-500">No family trees found</p>
							<button 
								onClick={() => setShowCreateModal(true)} 
								className="mt-3 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200"
							>
								Create your first family tree
							</button>
						</div>
					)}
				</div>
			</main>
			<nav className="fixed left-0 top-0 bottom-0 w-16 bg-emerald-800 flex flex-col items-center py-6 space-y-8">
				<Link href="/dashboard" className="text-white p-2 rounded-lg bg-emerald-700">
					<FolderTreeIcon size={24} />
				</Link>
				<Link href="#" className="text-emerald-300 hover:text-white p-2 rounded-lg hover:bg-emerald-700">
					<UserIcon size={24} />
				</Link>
				<Link href="#" className="text-emerald-300 hover:text-white p-2 rounded-lg hover:bg-emerald-700">
					<SettingsIcon size={24} />
				</Link>
				<Link href="#" className="text-emerald-300 hover:text-white p-2 rounded-lg hover:bg-emerald-700">
					<HelpCircleIcon size={24} />
				</Link>
				<button className="mt-auto text-emerald-300 hover:text-white p-2 rounded-lg hover:bg-emerald-700">
					<LogOutIcon size={24} />
				</button>
			</nav>

			{/* Create Tree Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
						<h2 className="text-xl font-semibold mb-4">Create New Family Tree</h2>
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">Tree Name</label>
							<input 
								type="text" 
								value={newTreeName}
								onChange={(e) => setNewTreeName(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md" 
								placeholder="e.g., Paternal Family Tree" 
							/>
						</div>
						<div className="flex justify-end space-x-3">
							<button 
								onClick={() => setShowCreateModal(false)} 
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button 
								onClick={handleCreateTree}
								className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
							>
								Create Tree
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
} 