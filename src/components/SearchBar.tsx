"use client";
import { SearchIcon } from "lucide-react";

export default function SearchBar() {
	return (
		<div className="relative">
			<input
				type="text"
				placeholder="Search for family members..."
				className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
			/>
			<SearchIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
		</div>
	);
} 