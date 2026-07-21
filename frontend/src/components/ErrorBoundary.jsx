import React, { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught rendering error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-center select-none font-sans">
          <div className="max-w-md w-full glass-panel p-8 border border-red-500/20 shadow-lg shadow-red-500/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Something went wrong</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              AegisHealth encountered an unexpected rendering error. For safety reasons, we have halted the current screen.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all shadow-lg hover:shadow-red-900/10 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
