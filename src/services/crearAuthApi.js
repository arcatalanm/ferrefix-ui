
export function crearAuthApi(cliente) {
  const { http } = cliente;

  async function autenticar(ruta, datos) {
    const { data } = await http.post(`auth/${ruta}`, datos, { omitirAuth: true });
    return data;
  }

  return {
    registrar: (datos) => autenticar('register', datos),
    iniciarSesion: (identificador, password) => autenticar('login', { identificador, password }),
    async obtenerPerfil({ signal } = {}) {
      const { data } = await http.get('auth/me', { signal });
      return data;
    },
    async actualizarPerfil({ nombre, segNombre, apellidoPaterno, apellidoMaterno, rut, telefono, direccion, region, comuna }) {

      const { data } = await http.put('auth/me', { nombre, segNombre, apellidoPaterno, apellidoMaterno, rut, telefono, direccion, region, comuna });
      return data;
    },
  };
}
