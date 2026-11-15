import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Las animaciones solo corren si el usuario no pidió movimiento reducido.
export const SIN_REDUCIR = '(prefers-reduced-motion: no-preference)';

const unaVez = (trigger, start = 'top 85%') => ({ trigger, start, once: true });

// Formato de los números que cuentan (misma presentación que el texto estático).
export function formatearConteo(valor, { prefijo = '', sufijo = '', decimales = 0 } = {}) {
  const numero = decimales > 0
    ? Number(valor).toFixed(decimales)
    : Math.round(Number(valor)).toLocaleString('es-CL');
  return `${prefijo}${numero}${sufijo}`;
}

// Entrada al abrir la página: los elementos suben con un fade, uno tras otro.
export function entradaInicial(elementos, { y = 24, duracion = 0.6, escalon = 0.12 } = {}) {
  return gsap.fromTo(elementos, { opacity: 0, y }, {
    opacity: 1, y: 0, duration: duracion, stagger: escalon, ease: 'power2.out', clearProps: 'opacity,transform',
  });
}

// Bloque que aparece una sola vez al llegar a él con el scroll.
export function revelarAlScroll(elementos, trigger, { y = 28, x = 0, duracion = 0.6, escalon = 0.1, start } = {}) {
  return gsap.fromTo(elementos, { opacity: 0, y, x }, {
    opacity: 1, y: 0, x: 0, duration: duracion, stagger: escalon, ease: 'power2.out', clearProps: 'opacity,transform',
    scrollTrigger: unaVez(trigger, start),
  });
}

// Tarjetas que entran con un rebote suave.
export function rebotarAlScroll(elementos, trigger, { escalon = 0.12, start } = {}) {
  return gsap.fromTo(elementos, { opacity: 0, y: 30, scale: 0.9 }, {
    opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: escalon, ease: 'back.out(1.7)', clearProps: 'opacity,transform',
    scrollTrigger: unaVez(trigger, start),
  });
}

// Número que cuenta desde 0 hasta su valor final. Devuelve una función que restaura el texto final.
export function contarAlScroll(elemento, hasta, formato, { duracion = 1.6, start } = {}) {
  const final = formatearConteo(hasta, formato);
  const contador = { valor: 0 };
  elemento.textContent = formatearConteo(0, formato);
  gsap.to(contador, {
    valor: hasta, duration: duracion, ease: 'power2.out',
    onUpdate: () => { elemento.textContent = formatearConteo(contador.valor, formato); },
    onComplete: () => { elemento.textContent = final; },
    scrollTrigger: unaVez(elemento, start || 'top 90%'),
  });
  return () => { elemento.textContent = final; };
}
