import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and display errors gracefully
 * 
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * 
 * @example
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorPage />}>
 *   <DashboardPage />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

// ============================================
// ERROR FALLBACK COMPONENT
// ============================================

interface ErrorFallbackProps {
  error: Error | null;
  onRetry?: () => void;
}

function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{t('errors.somethingWentWrong')}</CardTitle>
          <CardDescription>
            {t('errors.unexpectedError')}
          </CardDescription>
        </CardHeader>
        {error && import.meta.env.DEV && (
          <CardContent>
            <pre className="overflow-auto rounded-md bg-muted p-4 text-xs">
              {error.message}
            </pre>
          </CardContent>
        )}
        <CardFooter className="justify-center">
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="me-2 h-4 w-4" />
            {t('common.retry')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// ============================================
// PAGE ERROR COMPONENT
// ============================================

interface PageErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function PageError({ title, description, onRetry }: PageErrorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>{title || t('errors.pageError')}</CardTitle>
          <CardDescription>
            {description || t('errors.pageErrorDescription')}
          </CardDescription>
        </CardHeader>
        {onRetry && (
          <CardFooter className="justify-center">
            <Button onClick={onRetry}>
              <RefreshCw className="me-2 h-4 w-4" />
              {t('common.retry')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
