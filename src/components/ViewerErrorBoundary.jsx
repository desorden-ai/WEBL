import { Component } from 'react'
import ViewerFallback from './ViewerFallback.jsx'

export default class ViewerErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('DESWEB3D viewer error', error, info)
    this.props.onError?.(error)
  }

  handleReset = () => {
    this.setState({ error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.error) {
      return <ViewerFallback reason="viewer-error" onReset={this.handleReset} />
    }

    return this.props.children
  }
}
