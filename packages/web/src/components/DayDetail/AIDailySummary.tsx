import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Panchangam } from '@ishubhamx/panchangam-js';
import { generateDailySummary, getSummaryCacheKey, isGeminiAvailable } from '../../utils/gemini';
import { ApiKeyPrompt } from '../ApiKeyPrompt/ApiKeyPrompt';
import './AIDailySummary.css';

interface AIDailySummaryProps {
    panchang: Panchangam;
    date: Date;
    timezone: string;
}

type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

/**
 * Simple markdown-to-HTML converter for bold, line breaks, and bullet lists
 */
function renderMarkdown(text: string): string {
    return text
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Line breaks
        .replace(/\n/g, '<br/>')
        // Bullet lists (• or -)
        .replace(/(?:^|<br\/>)\s*[•\-]\s+/g, '<br/>• ');
}

export const AIDailySummary: React.FC<AIDailySummaryProps> = ({ panchang, date, timezone }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [status, setStatus] = useState<Status>('idle');
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef(false);

    // Check for cached result on mount / date change
    useEffect(() => {
        const cacheKey = getSummaryCacheKey(date);
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            setContent(cached);
            setStatus('done');
            setIsExpanded(true);
        } else {
            setContent('');
            setStatus('idle');
            setIsExpanded(false);
        }
        setError(null);
    }, [date]);

    // Auto-scroll content as it streams
    useEffect(() => {
        if (status === 'streaming' && contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [content, status]);

    const handleGenerate = useCallback(async () => {
        if (status === 'loading' || status === 'streaming') return;

        abortRef.current = false;
        setStatus('loading');
        setContent('');
        setError(null);
        setIsExpanded(true);

        try {
            let fullText = '';
            const stream = generateDailySummary(panchang, date, timezone);

            setStatus('streaming');

            for await (const chunk of stream) {
                if (abortRef.current) break;
                fullText += chunk;
                setContent(fullText);
            }

            // Cache the result
            const cacheKey = getSummaryCacheKey(date);
            sessionStorage.setItem(cacheKey, fullText);
            setStatus('done');
        } catch (err: any) {
            console.error('AI Summary error:', err);
            let msg = 'Failed to generate summary. Please try again.';

            if (err?.message) {
                if (err.message.includes('429') || err.message.includes('quota')) {
                    msg = 'API quota exceeded. Please try again later or use your own key.';
                } else if (err.message.includes('503') || err.message.includes('overloaded')) {
                    msg = 'AI service is currently overloaded. Please try again in a moment.';
                } else if (err.message.includes('network') || err.message.includes('fetch')) {
                    msg = 'Network error. Please check your connection.';
                }
            }

            setError(msg);
            setStatus('error');
        }
    }, [panchang, date, timezone, status]);

    const handleStop = useCallback(() => {
        abortRef.current = true;
        setStatus('done');
    }, []);

    // Force re-render when user sets an API key
    const [, forceUpdate] = useState(0);
    const handleKeySet = useCallback(() => forceUpdate(n => n + 1), []);

    // Show key prompt if no key at all
    if (!isGeminiAvailable()) {
        return (
            <div className="ai-summary-wrapper">
                <div className="ai-summary-header">
                    <div className="ai-header-left">
                        <span className="ai-sparkle">✨</span>
                        <span className="ai-title">AI Insights</span>
                    </div>
                </div>
                <div className="ai-summary-body" style={{ borderTop: '1px solid var(--glass-border)' }}>
                    <ApiKeyPrompt onKeySet={handleKeySet} />
                </div>
            </div>
        );
    }

    return (
        <div className="ai-summary-wrapper">
            {/* Header — always visible */}
            <button
                className={`ai-summary-header ${isExpanded ? 'expanded' : ''}`}
                onClick={() => {
                    if (status === 'idle') {
                        handleGenerate();
                    } else {
                        setIsExpanded(prev => !prev);
                    }
                }}
            >
                <div className="ai-header-left">
                    <span className="ai-sparkle">✨</span>
                    <span className="ai-title">AI Insights</span>
                    {status === 'done' && <span className="ai-badge">Generated</span>}
                </div>
                <div className="ai-header-right">
                    {status === 'idle' && (
                        <span className="ai-generate-hint">Tap to generate</span>
                    )}
                    {(status === 'done' || status === 'error') && (
                        <span className={`ai-chevron ${isExpanded ? 'open' : ''}`}>▾</span>
                    )}
                    {(status === 'loading' || status === 'streaming') && (
                        <span className="ai-streaming-dot" />
                    )}
                </div>
            </button>

            {/* Expandable Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="ai-summary-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        {/* Loading skeleton */}
                        {status === 'loading' && (
                            <div className="ai-skeleton">
                                <div className="ai-skeleton-line wide" />
                                <div className="ai-skeleton-line" />
                                <div className="ai-skeleton-line narrow" />
                                <div className="ai-skeleton-line" />
                                <div className="ai-skeleton-line wide" />
                            </div>
                        )}

                        {/* Streaming / Done content */}
                        {(status === 'streaming' || status === 'done') && content && (
                            <div
                                ref={contentRef}
                                className={`ai-content ${status === 'streaming' ? 'streaming' : ''}`}
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                            />
                        )}

                        {/* Error state */}
                        {status === 'error' && (
                            <div className="ai-error">
                                <span className="ai-error-icon">⚠️</span>
                                <p>{error}</p>
                                {error && (error.includes('429') || error.includes('quota') || error.includes('rate')) ? (
                                    <ApiKeyPrompt
                                        onKeySet={handleKeySet}
                                        reason="API quota exceeded — use your own key to continue"
                                    />
                                ) : (
                                    <button className="ai-retry-btn" onClick={handleGenerate}>
                                        Retry
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Footer actions */}
                        <div className="ai-summary-footer">
                            {status === 'streaming' && (
                                <button className="ai-stop-btn" onClick={handleStop}>
                                    ⏹ Stop
                                </button>
                            )}
                            {status === 'done' && (
                                <button className="ai-regenerate-btn" onClick={handleGenerate}>
                                    🔄 Regenerate
                                </button>
                            )}
                            <span className="ai-disclaimer">Powered by Gemini • Interpretations are for guidance only</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
