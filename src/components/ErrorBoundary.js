import React from "react";

import ErrorCard from "./ErrorCard";

// Catches render-time errors thrown by an individual app so a single crashing
// app shows an ErrorCard instead of taking down the whole kiosk (which would
// leave only the arrows and cycling icon over a black screen).
//
// Reset it by changing its `key` prop (e.g. to the current app index) so
// navigating to a different app starts fresh.
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorCard message={this.props.message} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
