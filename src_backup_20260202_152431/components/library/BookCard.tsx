'use client';

interface BookCardProps {
    book: {
        id: string;
        title: string;
        author: string;
        genre: string;
        wordCount: number;
        progress: number;
        lastEdited: string;
        status: 'draft' | 'editing' | 'completed' | 'published';
    };
}

export function BookCard({ book }: BookCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-yellow-500/20 text-yellow-400';
            case 'editing': return 'bg-blue-500/20 text-blue-400';
            case 'completed': return 'bg-green-500/20 text-green-400';
            case 'published': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft': return '📝';
            case 'editing': return '✏️';
            case 'completed': return '✅';
            case 'published': return '🚀';
            default: return '📖';
        }
    };

    return (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-all hover:scale-[1.02] group text-white">
            {/* Cover Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-xl relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl opacity-30">📚</div>
                </div>
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(book.status)}`}>
                        {getStatusIcon(book.status)} {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                    {book.title}
                </h3>

                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <span>By {book.author}</span>
                    <span>•</span>
                    <span>{book.genre}</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{book.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${book.progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-2xl font-bold">{book.wordCount.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Words</div>
                    </div>
                    <div className="bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-2xl font-bold">
                            {new Date(book.lastEdited).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-400">Last Edited</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => window.location.href = `/writing/editor/${book.id}`}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-sm"
                    >
                        Continue Writing
                    </button>
                    <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg">
                        ⋮
                    </button>
                </div>
            </div>
        </div>
    );
}
