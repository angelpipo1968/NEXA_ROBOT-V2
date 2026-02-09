// nexa/ui/components/search_result.js
export default function SearchResult({ data }) {
    if (!data || !data.results) return null;

    return (
        <div className="search-results p-4 bg-black/50 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
            <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                🔍 Resultados de búsqueda
            </h3>
            <div className="space-y-4">
                {data.results.map((item, i) => (
                    <div key={i} className="result-item hover:bg-cyan-900/10 p-2 rounded transition-colors">
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group block"
                        >
                            <h4 className="text-white font-medium group-hover:text-cyan-300 transition-colors">
                                {item.title}
                            </h4>
                        </a>
                        <p className="snippet text-gray-400 text-sm mt-1 line-clamp-2">
                            {item.snippet}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] uppercase tracking-wider text-cyan-600 font-mono border border-cyan-900 px-1 rounded">
                                {item.source}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
