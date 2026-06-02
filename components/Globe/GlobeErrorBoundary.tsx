"use client";

import { Component, type ReactNode } from "react";

/**
 * If the WebGL scene throws (context loss, shader/texture failure), fall back
 * to the 2D dashboard so the page never blanks.
 */
export class GlobeErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Globe failed — falling back to 2D:", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
