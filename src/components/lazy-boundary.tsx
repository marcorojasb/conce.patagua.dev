import { Component, Suspense, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Se llama si el chunk no carga (p. ej. sin red o tras un nuevo despliegue). */
  onError: () => void;
}

interface State {
  failed: boolean;
}

/**
 * Las fichas y herramientas se cargan con import() diferido. Si ese chunk
 * falla, sin un límite de error React desmonta toda la app y el mapa queda en
 * blanco; así solo se cierra lo que no cargó.
 */
export class LazyBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(): void {
    this.props.onError();
  }

  componentDidUpdate(prev: Props): void {
    if (this.state.failed && prev.children !== this.props.children) this.setState({ failed: false });
  }

  render() {
    if (this.state.failed) return null;
    return <Suspense fallback={null}>{this.props.children}</Suspense>;
  }
}
