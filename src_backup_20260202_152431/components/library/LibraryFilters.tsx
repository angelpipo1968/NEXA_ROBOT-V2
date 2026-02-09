'use client';

interface LibraryFiltersProps {
    currentFilter: string;
    onFilterChange: (filter: string) => void;
}

export function LibraryFilters({ currentFilter, onFilterChange }: LibraryFiltersProps) {
    const filters = [
        { id: 'all', label: 'All Books', icon: '📚' },
        { id: 'draft', label: 'Drafts', icon: '📝' },
        { id: 'editing', label: 'Editing', icon: '✏️' },
        { id: 'published', label: 'Published', icon: '🚀' }
    ];

    return (
        <div className="flex gap-2 text-white">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${currentFilter === filter.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        }`}
                >
                    <span>{filter.icon}</span>
                    <span className="hidden md:inline">{filter.label}</span>
                </button>
            ))}
        </div>
    );
}
