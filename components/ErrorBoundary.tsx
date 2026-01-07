// React Error Boundary 元件
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = (): void => {
        window.location.reload();
    };

    handleReset = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gradient-to-b from-[#2a0a12] to-[#1a0510] flex items-center justify-center p-8">
                    <div className="max-w-lg w-full bg-red-900/30 border border-red-500/30 rounded-2xl p-8 text-center space-y-6">
                        <div className="text-6xl">⚠️</div>
                        <h1 className="text-2xl font-bold text-red-300">
                            系統發生錯誤
                        </h1>
                        <p className="text-red-200/70 text-sm">
                            抱歉，抽獎系統遇到了一些問題。請嘗試重新載入頁面。
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <details className="text-left bg-black/40 rounded-lg p-4 mt-4">
                                <summary className="text-amber-400 cursor-pointer text-sm font-medium">
                                    技術細節 (開發模式)
                                </summary>
                                <pre className="mt-2 text-xs text-red-300/80 overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-4 justify-center pt-4">
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-lg border border-amber-500/30 transition-colors"
                            >
                                嘗試恢復
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
                            >
                                重新載入
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
