import { Component } from 'react'

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
      return (
        <section className="viewer-error" role="alert">
          <div className="viewer-error__content">
            <p className="viewer-error__label">NO SE HA PODIDO CARGAR EL PROYECTO</p>
            <button className="viewer-error__button" type="button" onClick={this.handleReset}>
              VOLVER
            </button>
          </div>
        </section>
      )
    }

    return this.props.children
  }
}
