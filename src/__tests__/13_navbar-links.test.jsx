// Test: Navbar: muestra los enlaces públicos y de sesión, oculta el panel admin sin sesión y lo habilita cuando el usuario es administrador
// Función: Navbar()

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

const renderizar = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

const guardarSesion = (sesion) => {
  localStorage.setItem('ferrefix_sesion_activa_v1', JSON.stringify(sesion));
};

describe('Componente Navbar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  test('Navbar: muestra los enlaces públicos y de sesión, oculta el panel admin sin sesión y lo habilita cuando el usuario es administrador', () => {
    renderizar();
    expect(screen.getByRole('link', { name: 'Catálogo' }).getAttribute('href')).toBe('/catalogo');
    expect(screen.getByRole('link', { name: 'Arriendos' }).getAttribute('href')).toBe('/arriendos');
    expect(screen.getByRole('link', { name: 'Nosotros' }).getAttribute('href')).toBe('/nosotros');
    expect(screen.getByRole('link', { name: 'Cotizaciones' }).getAttribute('href')).toBe('/contacto');
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' }).getAttribute('href')).toBe('/login');
    expect(screen.getByRole('link', { name: 'Registrarse' }).getAttribute('href')).toBe('/registro');

    expect(screen.queryByText('Panel Administrativo')).toBeNull();
    expect(screen.queryByText('Cerrar Sesión')).toBeNull();
    cleanup();

    guardarSesion({
      idUsuario: 'USR-001',
      nombre: 'Administrador Ferrefix',
      email: 'admin@ferrefix.cl',
      rol: 'admin'
    });
    renderizar();
    expect(
      screen.getByTitle('Conectado como Administrador Ferrefix')
    ).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
    const panelAdmin = screen.getByRole('link', { name: /Panel Administrativo/i });
    expect(panelAdmin.getAttribute('href')).toBe('/admin');
    expect(screen.getByText('Cerrar Sesión')).toBeTruthy();
  });
});
