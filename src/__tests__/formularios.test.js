import { describe, it, expect } from "vitest";
import { validarRut, validadores } from "../data/validaciones.js";

describe("Validaciones de Formularios (Lógica de Negocio)", () => {

  // --- Pruebas de RUT Chileno ---
  it("1. validarRut: debería aprobar un RUT chileno con dígito verificador numérico", () => {
    const resultado = validarRut("11.111.111-1");
    expect(resultado).toBe(true);
  });

  it("2. validarRut: debería aprobar un RUT chileno con dígito verificador K", () => {
    const resultado = validarRut("10.000.013-K");
    expect(resultado).toBe(true);
  });

  it("3. validarRut: debería rechazar un RUT con dígito verificador incorrecto", () => {
    const resultado = validarRut("12.345.678-0");
    expect(resultado).toBe(false);
  });

  it("4. validarRut: debería rechazar entradas fuera de negocio (vacías, null o undefined)", () => {
    expect(validarRut("")).toBe(false);
    expect(validarRut(null)).toBe(false);
    expect(validarRut(undefined)).toBe(false);
  });

  // --- Pruebas de Correo Electrónico ---
  it("5. validadores.email: debería aceptar un correo con formato válido", () => {
    const error = validadores.email("contacto@ferrefix.cl");
    expect(error).toBe("");
  });

  it("6. validadores.email: debería retornar mensaje de error si el correo no tiene formato válido", () => {
    const error = validadores.email("correo-sin-arroba");
    expect(error).toContain("Ingresa un correo válido");
  });

  // --- Pruebas de Nombre de Usuario / Cliente ---
  it("7. validadores.nombre: debería aceptar un nombre válido con apellidos", () => {
    const error = validadores.nombre("Juan Pérez González");
    expect(error).toBe("");
  });

  it("8. validadores.nombre: debería rechazar nombres con números o menores a 3 caracteres", () => {
    const errorConNumeros = validadores.nombre("Juan 123");
    const errorCorto = validadores.nombre("Al");
    expect(errorConNumeros).toBe("El nombre no puede contener números.");
    expect(errorCorto).toBe("El nombre debe tener al menos 3 caracteres.");
  });

});
