import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; import './index.css';

// هذه القطعة البرمجية ستلتقط أي خطأ مخفي وتعرضه على الشاشة فوراً
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if ((this.state as any).hasError) {
      return (
        <div style={{ padding: '30px', backgroundColor: '#fee2e2', color: '#991b1b', direction: 'rtl', fontFamily: 'Arial' }}>
          <h2>⚠️ نظام الرادار: تم اصطياد الخطأ الذي يسبب الشاشة البيضاء!</h2>
          <p>يرجى نسخ هذا النص الإنجليزي وإرساله لي:</p>
          <pre dir="ltr" style={{ textAlign: 'left', fontWeight: 'bold', backgroundColor: '#fff', padding: '15px', border: '1px solid #fca5a5' }}>
            {(this.state as any).error && (this.state as any).error.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
