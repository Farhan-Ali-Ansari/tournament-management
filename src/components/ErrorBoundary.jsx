import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-page">
          <div className="error-page__card ui-card">
            <p className="error-page__eyebrow">Unexpected error</p>
            <h1 className="error-page__title">Something went wrong</h1>
            <p className="error-page__message">
              {this.state.error.message || "An unexpected error occurred."}
            </p>
            <button
              type="button"
              className="btn-action"
              onClick={() => window.location.reload()}
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
