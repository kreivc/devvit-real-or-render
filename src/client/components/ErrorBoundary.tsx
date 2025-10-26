import React from 'react';

type ErrorBoundaryProps = {
    children: React.ReactNode;
};

type ErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('App Error:', error, errorInfo);
    }

    override render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground p-4">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                    <p className="text-foreground/70 mb-4 text-center max-w-md">
                        The app encountered an unexpected error. Please try refreshing the page.
                    </p>
                    {this.state.error && (
                        <details className="mb-4 text-xs text-foreground/50 max-w-md">
                            <summary className="cursor-pointer hover:text-foreground/70">Error details</summary>
                            <pre className="mt-2 p-2 bg-card rounded text-left overflow-auto">
                                {this.state.error.toString()}
                            </pre>
                        </details>
                    )}
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold transition-colors min-h-[44px]"
                    >
                        Reload App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

