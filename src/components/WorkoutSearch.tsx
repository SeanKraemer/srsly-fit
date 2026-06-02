'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkoutSearch({ initialSearchTerm }: { initialSearchTerm: string }) {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const router = useRouter();

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (searchTerm.trim()) {
            params.set('search', searchTerm.trim());
        }
        router.push(`/workouts?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearchSubmit} className="w-full flex items-center gap-2">
            <div className="relative flex-grow">
                <label htmlFor="workout-search" className="sr-only">Search workouts</label>
                <input
                    id="workout-search"
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 text-sm text-black outline-2 placeholder:text-gray-500"
                    placeholder="Search workouts by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap transition-colors">
                Search
            </button>
        </form>
    );
}