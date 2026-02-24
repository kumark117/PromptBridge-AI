import { useState } from 'react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset state
    setError('');
    setResult('');
    
    // Validate input
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    
    setLoading(true);
    try {
      //vercel env var for backend host or localhost fallback
      const envServer = import.meta.env.VITE_API_BASE_URL;
      const apiUrl = envServer ? `${envServer}/generate` : 'http://localhost:8000/generate';
      
      // Call backend API
      const response = await fetch( apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      // Check response status
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }
      
      // Parse and display result
      const data = await response.json();
      setResult(data.result);
      setPrompt('');
    } catch (err) {
      let errorMessage = '';
      
      // Handle different error types
      if (err instanceof TypeError) {
        // Network error - backend is not running
        errorMessage = '🔴 Backend Connection Failed\n\nThe backend server is not running. Please start it with:\npython main.py (in the backend folder)\n\nMake sure you have:\n• Python 3.8+\n• Dependencies installed (pip install -r requirements.txt)\n• OPENAI_API_KEY environment variable set';
      } else if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        errorMessage = '🔐 Authentication Error\n\nYour OpenAI API key is invalid or expired. Please check your OPENAI_API_KEY environment variable in the backend.';
      } else if (err.message?.includes('429') || err.message?.includes('rate limit')) {
        errorMessage = '⏳ Rate Limited\n\nYou\'ve hit the OpenAI API rate limit. Please wait a moment and try again.';
      } else if (err.message?.includes('500')) {
        errorMessage = '⚠️ Backend Error\n\nThe backend server encountered an error. Check the server logs for details.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <h1 style={styles.title}>🚀 PromptBridge AI</h1>
        <p style={styles.subtitle}>Powered by OpenAI GPT-4o Mini</p>
        
        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            disabled={loading}
            style={{
              ...styles.textarea,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'text',
            }}
          />
          
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </form>
        
        {/* Error Display */}
        {error && (
          <div style={styles.error}>
            <strong style={{ display: 'block', marginBottom: '12px' }}>Error</strong>
            <p style={{ margin: '0', whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '13px' }}>
              {error}
            </p>
          </div>
        )}
        
        {/* Result Display */}
        {result && (
          <div style={styles.resultBox}>
            <h2 style={styles.resultTitle}>Result:</h2>
            <p style={styles.resultText}>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#1a202c',
  },
  subtitle: {
    fontSize: '14px',
    color: '#718096',
    margin: '0 0 30px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px',
  },
  textarea: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    fontFamily: 'inherit',
    minHeight: '120px',
    resize: 'vertical',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  },
  error: {
    padding: '16px',
    background: '#fef2f2',
    border: '2px solid #fca5a5',
    borderRadius: '8px',
    color: '#991b1b',
    fontSize: '13px',
    marginBottom: '20px',
    fontFamily: 'monospace',
  },
  resultBox: {
    padding: '16px',
    background: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginTop: '20px',
  },
  resultTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
    margin: '0 0 12px 0',
  },
  resultText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#4a5568',
    margin: '0',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
};

export default App;
