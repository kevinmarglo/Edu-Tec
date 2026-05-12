import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border-2 border-indigo-950 rounded-3xl p-10 shadow-[8px_8px_0px_0px_rgba(30,27,75,1)]">
            <h1 className="text-3xl font-black text-indigo-950 mb-4 uppercase tracking-tighter">System Error</h1>
            <p className="text-slate-500 font-bold mb-6">
              {this.state.error?.message.includes('GEMINI_API_KEY') 
                ? "The AI API key is missing. If you are on Netlify, please add GEMINI_API_KEY to your environment variables."
                : "An unexpected error occurred while loading the application."}
            </p>
            <div className="bg-slate-100 p-4 rounded-xl mb-6 overflow-auto">
              <code className="text-xs font-mono text-red-600">{this.state.error?.toString()}</code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-indigo-950 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Refresh App
            </button>
          </div>
        </div>
      );
    }

    return this.children;
  }
}
