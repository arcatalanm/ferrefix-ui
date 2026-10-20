import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import ProductCard from "../components/ProductCard.jsx";
import EspacioImagen from "../components/EspacioImagen.jsx";

describe("Componentes React y Navegación", () => {

  const productoMock = {
    idProducto: "5422223214",
    nombre: "Taladro Percutor Inalámbrico 20V",
    marca: "DeWalt",
    precioVenta: 129990,
    imagen: "/taladro.webp"
  };

  it("9. ProductCard: debería renderizar el nombre y la marca del producto", () => {
    render(
      <MemoryRouter>
        <ProductCard producto={productoMock} />
      </MemoryRouter>
    );

    expect(screen.getByText("Taladro Percutor Inalámbrico 20V")).toBeTruthy();
    expect(screen.getByText("DeWalt")).toBeTruthy();
  });

  it("10. ProductCard: debería renderizar el precio formateado en pesos chilenos ($ CLP)", () => {
    render(
      <MemoryRouter>
        <ProductCard producto={productoMock} />
      </MemoryRouter>
    );

    expect(screen.getByText(/\$129\.990/)).toBeTruthy();
  });

  it("11. ProductCard: debería contener el enlace hacia la ruta de detalle del producto", () => {
    render(
      <MemoryRouter>
        <ProductCard producto={productoMock} />
      </MemoryRouter>
    );

    const enlace = screen.getByRole("link");
    expect(enlace).toBeTruthy();
    expect(enlace.getAttribute("href")).toBe("/producto/5422223214");
  });

  it("12. ProductCard: no debería romper la aplicación si recibe un producto nulo", () => {
    const { container } = render(
      <MemoryRouter>
        <ProductCard producto={null} />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it("13. EspacioImagen: debería mostrar la etiqueta de texto en pantalla cuando no hay imagen", () => {
    render(<EspacioImagen etiqueta="Foto no disponible" />);
    expect(screen.getByText("Foto no disponible")).toBeTruthy();
  });

});
