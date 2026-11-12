import axios from 'axios';
import { crearClienteApi } from './crearClienteApi';

let manejarSesionExpirada = () => {};
export const clienteApi = crearClienteApi(axios, {
  onUnauthorized: () => manejarSesionExpirada(),
});

export function alExpirarSesion(callback) {
  manejarSesionExpirada = callback;
}
