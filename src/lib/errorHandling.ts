// Interceptador para suprimir erros de extensões e melhorar experiência

// Lista de padrões de erro para ignorar
const IGNORED_ERROR_PATTERNS = [
  // Extensões do browser
  'Extension context invalidated',
  'Could not establish connection',
  'Receiving end does not exist',
  'chrome-extension://',
  'moz-extension://',
  'safari-web-extension://',
  
  // Erros de storage do browser (temporários)
  'PersistentStorage not yet initialized',
  'BrowserStorage: PersistentStorage not yet initialized',
  
  // Erros de rede temporários
  'NetworkError when attempting to fetch resource',
  'Failed to fetch',
  'Load failed',
  
  // WASM loading issues (não críticos)
  'WASM is not initialized',
  'WebAssembly',
  
  // Menu/UI temporários
  'Cannot find menu item',
  'tabToggleExclusion',
  
  // Appwrite sessões expiradas (normais)
  'user_session_not_found',
  'user_invalid_credentials',
  'Session not found'
];

const shouldIgnoreError = (error: any): boolean => {
  if (!error) return true;
  
  const errorString = error.toString?.() || error.message || '';
  const errorStack = error.stack || '';
  
  return IGNORED_ERROR_PATTERNS.some(pattern => 
    errorString.includes(pattern) || errorStack.includes(pattern)
  );
};

// Interceptar erros não capturados
const setupGlobalErrorHandling = () => {
  // Promise rejections não tratadas
  window.addEventListener('unhandledrejection', (event) => {
    if (shouldIgnoreError(event.reason)) {
      event.preventDefault(); // Previne log no console
      return;
    }
    
    // Log apenas erros críticos
    console.warn('Unhandled promise rejection:', event.reason);
  });

  // Erros JavaScript gerais
  window.addEventListener('error', (event) => {
    if (shouldIgnoreError(event.error)) {
      event.preventDefault(); // Previne log no console
      return;
    }
    
    // Log apenas erros críticos
    console.warn('Unhandled error:', event.error);
  });

  // Interceptar console.error para filtrar spam
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorMessage = args.join(' ');
    
    if (shouldIgnoreError({ message: errorMessage })) {
      return; // Não loggar
    }
    
    originalConsoleError.apply(console, args);
  };

  // Interceptar console.warn para filtrar spam
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    const warnMessage = args.join(' ');
    
    if (shouldIgnoreError({ message: warnMessage })) {
      return; // Não loggar
    }
    
    originalConsoleWarn.apply(console, args);
  };
};

// Exportar função para inicializar
export const initializeErrorHandling = () => {
  // Só configurar em produção ou quando necessário
  if (process.env.NODE_ENV === 'production' || 
      window.location.hostname !== 'localhost') {
    setupGlobalErrorHandling();
  }
};

export default setupGlobalErrorHandling;