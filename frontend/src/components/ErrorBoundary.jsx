import React from 'react';
import { FaExclamationTriangle, FaSync, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
            <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-medium text-red-800 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-6">
              We encountered an error while displaying this content. Please try again.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FaSync className="mr-2" />
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700"
              >
                <FaArrowLeft className="mr-2" />
                Go Back
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 text-left">
                <p className="text-sm text-red-600 font-mono break-all">
                  {this.state.error && this.state.error.toString()}
                </p>
                <pre className="mt-2 text-xs text-gray-500 overflow-auto max-h-40">
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 