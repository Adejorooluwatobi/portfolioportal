const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '[::1]'
);

export const environment = {
  production: !isLocalhost,
  localApiUrl: 'http://localhost:5024/api',
  serverApiUrl: 'https://portfoliobackend-wisd.onrender.com/api',
  apiUrl: isLocalhost
    ? 'http://localhost:5024/api'
    : 'https://portfoliobackend-wisd.onrender.com/api'
};
