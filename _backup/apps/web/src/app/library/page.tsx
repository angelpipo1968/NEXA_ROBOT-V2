'use client';

import { useState, useEffect } from 'react';
import { BookCard } from '@/components/library/BookCard';
import { LibraryFilters } from '@/components/library/LibraryFilters';

interface Book {
    id: string;
    title: string;
    author: string;
    coverImage?: string;
    genre: string;
    wordCount: number;
    progress: number;
    lastEdited: string;
    status: 'draft' | 'editing' | 'completed' | 'published';
}

export default function LibraryPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Simular carga de datos
        const loadBooks = () => {
            setTimeout(() => {
                setBooks([
                    {
                        id: '1',
                        title: 'The AI Revolution',
                        author: 'You',
                        genre: 'Technology',
                        wordCount: 32456,
                        progress: 65,
                        lastEdited: '2024-01-15',
                        status: 'draft'
                    },
                    {
                        id: '2',
                        title: 'Digital Dreams',
                        author: 'You',
                        genre: 'Science Fiction',
                        wordCount: 51234,
                        progress: 90,
                        lastEdited: '2024-01-14',
                        status: 'editing'
                    },
                    {
                        id: '3',
                        title: 'Business in Digital Age',
                        author: 'You',
                        genre: 'Business',
                        wordCount: 28765,
                        progress: 45,
                        lastEdited: '2024-01-10',
                        status: 'draft'
                    },
                    {
                        id: '4',
                        title: 'Published Success',
                        author: 'You',
                        genre: 'Self-Help',
                        wordCount: 45678,
                        progress: 100,
                        lastEdited: '2024-01-05',
                        status: 'published'
                    }
                ]);
                setLoading(false);
            }, 1000);
        };
        loadBooks();
    }, []);

    const filteredBooks = books.filter(book => {
        if (filter !== 'all' && book.status !== filter) return false;
        if (searchQuery && !book.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const stats = {
        total: books.length,
        drafts: books.filter(b => b.status === 'draft').length,
        editing: books.filter(b => b.status === 'editing').length,
        published: books.filter(b => b.status === 'published').length,
        totalWords: books.reduce((sum, book) => sum + book.wordCount, 0)
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-10">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-purple-400">📚</span> My Library
                    </h1>
                    <p className="text-gray-400">
                        View, edit, and manage all your writing projects
                    </p>
                </header>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-sm text-gray-400">Total Books</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                        <div className="text-2xl font-bold">{stats.drafts}</div>
                        <div className="text-sm text-gray-400">Drafts</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                        <div className="text-2xl font-bold">{stats.editing}</div>
                        <div className="text-sm text-gray-400">Editing</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                        <div className="text-2xl font-bold">{stats.published}</div>
                        <div className="text-sm text-gray-400">Published</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                        <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Total Words</div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-gray-800">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search books by title or genre..."
                                    className="w-full p-4 pl-12 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                                />
                                <div className="absolute left-4 top-4 text-gray-400">
                                    🔍
                                </div>
                            </div>
                        </div>

                        <LibraryFilters currentFilter={filter} onFilterChange={setFilter} />

                        <button
                            onClick={() => window.location.href = '/studio'}
                            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold whitespace-nowrap"
                        >
                            + New Book
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                        <h3 className="text-xl mb-2">Loading your library...</h3>
                        <p className="text-gray-400">Fetching your writing projects</p>
                    </div>
                ) : (
                    /* Books Grid */
                    <div className="mb-12">
                        {filteredBooks.length === 0 ? (
                            <div className="text-center py-20 bg-gray-900/30 rounded-xl border border-gray-800">
                                <div className="text-6xl mb-4">📭</div>
                                <h3 className="text-2xl mb-2">No books found</h3>
                                <p className="text-gray-400 mb-6">
                                    {searchQuery
                                        ? `No books match "${searchQuery}"`
                                        : "You haven't created any books yet"}
                                </p>
                                <button
                                    onClick={() => window.location.href = '/studio'}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold"
                                >
                                    Create Your First Book
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredBooks.map((book) => (
                                    <BookCard key={book.id} book={book} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Recent Activity */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                    <h2 className="text-2xl font-bold mb-6">📅 Recent Activity</h2>
                    <div className="space-y-4">
                        {[
                            { action: 'Edited', book: 'The AI Revolution', time: '2 hours ago' },
                            { action: 'Exported', book: 'Digital Dreams', time: '1 day ago' },
                            { action: 'Published', book: 'Published Success', time: '3 days ago' },
                            { action: 'Created', book: 'New Project', time: '5 days ago' }
                        ].map((activity, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center">
                                    {activity.action === 'Edited' && '✏️'}
                                    {activity.action === 'Exported' && '📤'}
                                    {activity.action === 'Published' && '🚀'}
                                    {activity.action === 'Created' && '🆕'}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold">{activity.book}</div>
                                    <div className="text-sm text-gray-400">
                                        {activity.action} • {activity.time}
                                    </div>
                                </div>
                                <button className="text-blue-400 hover:text-blue-300">
                                    View →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
