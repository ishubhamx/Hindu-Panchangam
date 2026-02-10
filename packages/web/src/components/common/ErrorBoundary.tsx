import { Component, type ErrorInfo, type ReactNode } from 'react';
import { trackError } from '../../utils/analytics';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary - Catches rendering errors and tracks them via analytics
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        trackError(error.message, info.componentStack?.slice(0, 200) || 'unknown');
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>Something went wrong</h2>
                    <p style={{ opacity: 0.7 }}>{this.state.error?.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'var(--accent, #667eea)',
                            color: '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
