import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { searchCache } from '@/lib/searchCache';

export function SearchSettings() {
    const {
        autoSearchEnabled,
        searchCacheEnabled,
        toggleAutoSearch,
        toggleSearchCache
    } = useSettingsStore();

    const stats = searchCache.getStats();

    const handleClearCache = () => {
        searchCache.clear();
        // Force re-render by triggering store update
        useSettingsStore.setState({});
    };

    return (
        <div className="search-settings-panel">
            <h3 className="settings-section-title">⚙️ Search Settings</h3>

            <div className="settings-grid">
                {/* Auto-Search Toggle */}
                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">
                            <span className="label-icon">🔍</span>
                            <span className="label-text">Automatic Web Search</span>
                        </div>
                        <p className="setting-description">
                            Automatically search the web when you ask for real-time information
                        </p>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={autoSearchEnabled}
                            onChange={toggleAutoSearch}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                {/* Cache Toggle */}
                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-label">
                            <span className="label-icon">⚡</span>
                            <span className="label-text">Cache Search Results</span>
                        </div>
                        <p className="setting-description">
                            Store recent searches to reduce API calls (5 minute TTL)
                        </p>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={searchCacheEnabled}
                            onChange={toggleSearchCache}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                {/* Cache Stats & Clear */}
                <div className="setting-item cache-stats">
                    <div className="setting-info">
                        <div className="setting-label">
                            <span className="label-icon">📊</span>
                            <span className="label-text">Cache Statistics</span>
                        </div>
                        <p className="setting-description">
                            {stats.size} / {stats.maxSize} entries cached • {stats.ttl / 1000}s TTL
                        </p>
                    </div>
                    <button
                        onClick={handleClearCache}
                        className="clear-cache-btn"
                        disabled={stats.size === 0}
                    >
                        🗑️ Clear Cache
                    </button>
                </div>
            </div>
        </div>
    );
}
