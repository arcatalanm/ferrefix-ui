

export function crearClienteApi(axios, {
  baseURL = import.meta.env.VITE_API_URL || '/api/v1',
  onUnauthorized = () => {},
} = {}) {
  let accessToken = null;
  const http = axios.create({
    baseURL,
    timeout: 15000,
    allowAbsoluteUrls: false,
    headers: { Accept: 'application/json' },
  });

  http.interceptors.request.use((config) => {
    if (accessToken && !config.omitirAuth) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return config;
  });

  http.interceptors.response.use(
    (response) => response,
    (error) => {

      const tokenEnviado = error.config?.headers?.get?.('Authorization')
        ?? error.config?.headers?.Authorization;
      if (error.response?.status === 401 && accessToken
          && tokenEnviado === `Bearer ${accessToken}`) {
        accessToken = null;
        onUnauthorized();
      }
      return Promise.reject(error);
    },
  );

  return {
    http,
    establecerToken(token) { accessToken = token; },
    limpiarToken() { accessToken = null; },
  };
}

export function obtenerMensajeApi(error) {
  return error.response?.data?.detail
    || (error.code === 'ECONNABORTED'
      ? 'El servidor tardó demasiado en responder.'
      : 'No se pudo completar la solicitud. Intenta nuevamente.');
}
