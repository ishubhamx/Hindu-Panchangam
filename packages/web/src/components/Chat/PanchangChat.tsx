import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Chat } from '@google/genai';
import { Observer, getPanchangam, getSunrise } from '@ishubhamx/panchangam-js';
import {
    isGeminiAvailable,
    buildPanchangContext,
    createChatSession,
    sendChatMessage,
} from '../../utils/gemini';
import { ApiKeyPrompt } from '../ApiKeyPrompt/ApiKeyPrompt';
import { getTimezoneOffset } from '../../utils/timezone';
import type { Location } from '../../types';
import './PanchangChat.css';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    isStreaming?: boolean;
}

interface PanchangChatProps {
    location: Location;
}

const WELCOME_MESSAGE: ChatMessage = {
    role: 'model',
    text: `🙏 Namaste! I'm **Jyotish AI**, your Vedic astrology assistant.\n\nAsk me anything about today's Panchang — tithis, nakshatras, muhurta timings, festivals, or Vedic astrology concepts!`,
};

/**
 * Simple markdown-to-HTML for chat bubbles
 */
function renderMarkdown(text: string): string {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br/>')
        .replace(/(?:^|<br\/>)\s*[•\-]\s+/g, '<br/>• ');
}

const SUGGESTION_CHIPS = [
    'Is today auspicious?',
    'Best time for travel?',
    'Explain today\'s Tithi',
    'Any festivals today?',
];

export const PanchangChat: React.FC<PanchangChatProps> = ({ location }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [session, setSession] = useState<Chat | null>(null);
    const [showKeyPrompt, setShowKeyPrompt] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Build panchang context for today's date
    const panchangContext = useMemo(() => {
        try {
            const observer = new Observer(location.lat, location.lon, location.elevation);
            const timezoneOffset = getTimezoneOffset(location.timezone, new Date());
            const sunrise = getSunrise(new Date(), observer);
            const panchang = sunrise
                ? getPanchangam(sunrise, observer, { timezoneOffset })
                : getPanchangam(new Date(), observer, { timezoneOffset });
            return buildPanchangContext(panchang, new Date(), location.timezone);
        } catch (e) {
            console.error('Error building panchang context for chat:', e);
            return '';
        }
    }, [location]);

    // Initialize chat session when opened
    useEffect(() => {
        if (isOpen && !session && panchangContext) {
            const newSession = createChatSession(panchangContext);
            setSession(newSession);
        }
    }, [isOpen, session, panchangContext]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleSend = useCallback(async (messageText?: string) => {
        const text = (messageText || input).trim();
        if (!text || isTyping || !session) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', text }]);
        setIsTyping(true);

        // Add placeholder for streaming response
        setMessages(prev => [...prev, { role: 'model', text: '', isStreaming: true }]);

        try {
            let fullResponse = '';
            const stream = sendChatMessage(session, text);

            for await (const chunk of stream) {
                fullResponse += chunk;
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'model', text: fullResponse, isStreaming: true };
                    return updated;
                });
            }

            // Mark as done
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'model', text: fullResponse, isStreaming: false };
                return updated;
            });
        } catch (err: any) {
            console.error('Chat error:', err);
            const errMsg = err?.message || '';
            const isQuota = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate');
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: 'model',
                    text: isQuota
                        ? '⚠️ API quota exceeded. You can use your own API key to continue chatting.'
                        : '⚠️ Sorry, I encountered an error. Please try again.',
                    isStreaming: false,
                };
                return updated;
            });
            if (isQuota) setShowKeyPrompt(true);
        } finally {
            setIsTyping(false);
        }
    }, [input, isTyping, session]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    const handleClear = useCallback(() => {
        setMessages([WELCOME_MESSAGE]);
        setShowKeyPrompt(false);
        // Reset session
        if (panchangContext) {
            const newSession = createChatSession(panchangContext);
            setSession(newSession);
        }
    }, [panchangContext]);

    // Force re-render when user sets an API key
    const [, forceUpdate] = useState(0);
    const handleKeySet = useCallback(() => {
        forceUpdate(n => n + 1);
        setShowKeyPrompt(false);
        // Initialize session after key is set
        if (panchangContext) {
            const newSession = createChatSession(panchangContext);
            setSession(newSession);
        }
    }, [panchangContext]);

    const apiAvailable = isGeminiAvailable();

    // Always show the FAB so users can enter their key

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                className={`chat-fab ${isOpen ? 'hidden' : ''}`}
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open Jyotish AI Chat"
            >
                <span className="chat-fab-icon">🪷</span>
                <span className="chat-fab-label">Ask AI</span>
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chat-panel"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                        {/* Header */}
                        <div className="chat-header">
                            <div className="chat-header-info">
                                <span className="chat-avatar">🪷</span>
                                <div>
                                    <span className="chat-name">Jyotish AI</span>
                                    <span className="chat-status">
                                        {isTyping ? 'Typing...' : 'Online'}
                                    </span>
                                </div>
                            </div>
                            <div className="chat-header-actions">
                                <button
                                    className="chat-action-btn"
                                    onClick={handleClear}
                                    title="Clear chat"
                                >
                                    🗑
                                </button>
                                <button
                                    className="chat-action-btn chat-close-btn"
                                    onClick={() => setIsOpen(false)}
                                    title="Close"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Messages or API Key Prompt */}
                        {!apiAvailable ? (
                            <div className="chat-messages" style={{ justifyContent: 'center' }}>
                                <ApiKeyPrompt onKeySet={handleKeySet} compact />
                            </div>
                        ) : (
                            <div className="chat-messages">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`chat-bubble ${msg.role}`}>
                                        <div
                                            className={`chat-bubble-content ${msg.isStreaming ? 'streaming' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text || '...') }}
                                        />
                                    </div>
                                ))}

                                {/* Suggestion chips — only after welcome message */}
                                {messages.length === 1 && (
                                    <div className="chat-suggestions">
                                        {SUGGESTION_CHIPS.map((chip, i) => (
                                            <button
                                                key={i}
                                                className="chat-chip"
                                                onClick={() => handleSend(chip)}
                                            >
                                                {chip}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div ref={messagesEndRef} />

                                {/* Show BYOK prompt after quota error */}
                                {showKeyPrompt && (
                                    <ApiKeyPrompt
                                        onKeySet={handleKeySet}
                                        reason="API quota exceeded — use your own key to continue"
                                        compact
                                    />
                                )}
                            </div>
                        )}

                        {/* Input — only show when API is available */}
                        {apiAvailable && (
                            <div className="chat-input-area">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="chat-input"
                                    placeholder="Ask about today's Panchang..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isTyping}
                                />
                                <button
                                    className="chat-send-btn"
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isTyping}
                                >
                                    ➤
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
