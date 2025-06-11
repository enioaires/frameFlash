import React, { Component, ErrorInfo } from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Filtrar erros de extensões do browser
    const isExtensionError = 
      error.message?.includes('Extension context invalidated') ||
      error.message?.includes('Could not establish connection') ||
      error.message?.includes('Receiving end does not exist') ||
      error.stack?.includes('chrome-extension://') ||
      error.stack?.includes('moz-extension://');

    if (!isExtensionError) {
      console.error('Application Error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI apenas para erros críticos da aplicação
      return (
        <div className="flex-center min-h-screen bg-dark-1 text-light-1">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Algo deu errado</h2>
            <p className="text-light-3 mb-4">Tente recarregar a página</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;