import React, { useState, useCallback } from 'react';
import { setUserApiKey, getUserApiKey, clearUserApiKey } from '../../utils/gemini';
import './ApiKeyPrompt.css';

interface ApiKeyPromptProps {
    onKeySet: () => void;
    compact?: boolean;
    /** Optional reason to show, e.g. "quota exceeded" */
    reason?: string;
}

/**
 * Inline prompt for users to enter their own Gemini API key.
 * Shown when no key is configured, or when the current key hits errors (e.g. 429 quota).
 */
export const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onKeySet, compact = false, reason }) => {
    const [input, setInput] = useState('');
    const [saved, setSaved] = useState(false);
    const existingKey = getUserApiKey();

    const handleSave = useCallback(() => {
        const key = input.trim();
        if (!key) return;
        setUserApiKey(key);
        setSaved(true);
        setInput('');
        onKeySet();
    }, [input, onKeySet]);

    const handleClear = useCallback(() => {
        clearUserApiKey();
        setSaved(false);
        setInput('');
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
    }, [handleSave]);

    // Key just saved
    if (saved && existingKey) {
        return (
            <div className={`api-key-saved ${compact ? 'compact' : ''}`}>
                <span className="api-key-check">✓</span>
                <span className="api-key-text">
                    API key configured ({existingKey.slice(0, 6)}…)
                </span>
                <button className="api-key-change-btn" onClick={handleClear}>
                    Change
                </button>
            </div>
        );
    }

    return (
        <div className={`api-key-prompt ${compact ? 'compact' : ''}`}>
            {reason && (
                <div className="api-key-reason">
                    <span className="api-key-reason-icon">⚠️</span>
                    <span>{reason}</span>
                </div>
            )}
            <div className="api-key-info">
                <span className="api-key-icon">🔑</span>
                <div>
                    <p className="api-key-title">Use your own Gemini API Key</p>
                    <p className="api-key-desc">
                        Get a free key from{' '}
                        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                            aistudio.google.com
                        </a>
                    </p>
                </div>
            </div>
            <div className="api-key-input-row">
                <input
                    type="password"
                    className="api-key-input"
                    placeholder="AIza..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className="api-key-save-btn"
                    onClick={handleSave}
                    disabled={!input.trim()}
                >
                    Save
                </button>
            </div>
            <p className="api-key-note">
                Your key is stored locally in your browser only.
            </p>
        </div>
    );
};
