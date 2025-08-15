"use client";
import Link from "next/link";
import { HomeIcon, UsersIcon, HelpCircleIcon, MenuIcon, FolderTreeIcon } from "lucide-react";
import SearchBar from "./SearchBar";

export default function Header() {
	return (
		<header className="bg-white shadow-md px-4 py-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Link href="/dashboard" className="flex items-center">
						<FolderTreeIcon size={24} className="text-emerald-600 mr-1" />
						<div className="text-2xl font-bold text-emerald-600">FamilyTree</div>
					</Link>
					<div className="hidden md:flex items-center space-x-6 ml-10">
						<NavItem icon={<HomeIcon size={18} />} label="Home" to="/dashboard" />
						<NavItem icon={<UsersIcon size={18} />} label="Trees" to="/dashboard" />
						<NavItem icon={<HelpCircleIcon size={18} />} label="Help" to="#" />
					</div>
				</div>
				<div className="hidden md:block flex-1 max-w-md mx-4">
					<SearchBar />
				</div>
				<div className="flex items-center">
					<Link href="/dashboard" className="flex items-center bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-md hover:bg-emerald-200">
						<span>Open Dashboard</span>
					</Link>
					<button className="md:hidden ml-4">
						<MenuIcon />
					</button>
				</div>
			</div>
		</header>
	);
}

function NavItem({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) {
	return (
		<Link href={to} className="flex items-center text-gray-700 hover:text-emerald-600">
			<span className="mr-1">{icon}</span>
			<span>{label}</span>
		</Link>
	);
} 