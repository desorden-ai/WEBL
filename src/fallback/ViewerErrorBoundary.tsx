import { Component, type ErrorInfo, type ReactNode } from 'react';
import WebGLFallback from './WebGLFallback';

type Props = {
  children: ReactNode;
  onReset?: () => void;
};

type State = {
  failed: boolean;
};

export default class ViewerErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('CASA01 BOSQUE viewer error', error, info);
  }

  private handleRetry = () => {
    this.setState({ failed: false });
    this.props.onReset?.();
  };

  render() {
    if (this.state.failed) {
      return <WebGLFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
