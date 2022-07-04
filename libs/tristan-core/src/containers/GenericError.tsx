import React, { ReactNode } from 'react'

interface Error {
  stack?: string;
}

export class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  override state = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <h1>Une erreur fatale est survenue, veuillez recharger TRISTAN.</h1>
      );
    }

    return this.props.children;
  }
}
