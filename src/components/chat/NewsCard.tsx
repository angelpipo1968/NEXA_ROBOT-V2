import React from 'react';
import { formatRelativeTime } from '@/lib/services/newsService';
import type { NewsArticle } from '@/lib/services/newsService';

interface NewsCardProps {
    articles: NewsArticle[];
    query: string;
}

export function NewsCard({ articles, query }: NewsCardProps) {
    if (articles.length === 0) {
        return (
            <div className="news-card-container">
                <div className="news-empty">
                    <span className="empty-icon">📰</span>
                    <p>No se encontraron noticias para "{query}"</p>
                </div>
            </div>
        );
    }

    return (
        <div className="news-card-container">
            <div className="news-header">
                <h3 className="news-title">
                    📰 Noticias sobre "{query}"
                </h3>
                <span className="news-count">{articles.length} artículos</span>
            </div>

            <div className="news-grid">
                {articles.map((article, index) => (
                    <a
                        key={index}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-article-card"
                    >
                        {article.imageUrl && (
                            <div className="article-image">
                                <img src={article.imageUrl} alt={article.title} />
                            </div>
                        )}

                        <div className="article-content">
                            <h4 className="article-title">{article.title}</h4>

                            {article.description && (
                                <p className="article-description">{article.description}</p>
                            )}

                            <div className="article-meta">
                                <span className="article-source">
                                    📡 {article.source}
                                </span>
                                <span className="article-time">
                                    🕐 {formatRelativeTime(article.publishedAt)}
                                </span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            <div className="news-source">
                <span className="source-badge news-source-badge">
                    📰 NewsAPI
                </span>
            </div>
        </div>
    );
}
