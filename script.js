// ===== 1. Tus datos: edita estas listas para personalizar la página =====
const FRASES = ["desarrollador web", "amante del código", "aprendiz constante"];

const PROYECTOS = [
  { titulo: "Tienda online", desc: "Catálogo con carrito de compras hecho en JavaScript puro.", emoji: "🛒", categoria: "web", tags: ["HTML", "CSS", "JS"], link: "#" },
  { titulo: "Dashboard de ventas", desc: "Gráficas interactivas a partir de un archivo CSV.", emoji: "📊", categoria: "datos", tags: ["Chart.js", "CSV"], link: "#" },
  { titulo: "App del clima", desc: "Consulta el clima de cualquier ciudad usando una API pública.", emoji: "⛅", categoria: "web", tags: ["API", "Fetch"], link: "#" },
  { titulo: "Identidad visual", desc: "Logo, paleta de colores y tipografía para una marca local.", emoji: "🎨", categoria: "diseño", tags: ["Figma"], link: "#" },
  { titulo: "Análisis de datos", desc: "Limpieza y visualización de datos abiertos del gobierno.", emoji: "🔍", categoria: "datos", tags: ["Python", "Pandas"], link: "#" },
  { titulo: "Landing page", desc: "Página de presentación animada para un evento.", emoji: "🚀", categoria: "diseño", tags: ["CSS", "Animaciones"], link: "#" },
];

// Colores de fondo para cada categoría de tarjeta
const COLORES = { web: "#7c3aed33", datos: "#06b6d433", "diseño": "#f59e0b33" };

// ===== 2. Tema claro / oscuro (se guarda en el navegador) =====
const html = document.documentElement;
const botonTema = document.getElementById("tema");

function aplicarTema(tema) {
  html.dataset.theme = tema;
  botonTema.textContent = tema === "dark" ? "🌙" : "☀️";
  localStorage.setItem("tema", tema);
}
aplicarTema(localStorage.getItem("tema") || "dark");
botonTema.addEventListener("click", () => aplicarTema(html.dataset.theme === "dark" ? "light" : "dark"));

// ===== 3. Menú móvil =====
const menuBtn = document.querySelector(".menu-btn");
const menu = document.querySelector(".menu");
menuBtn.addEventListener("click", () => {
  const abierto = menu.classList.toggle("abierto");
  menuBtn.setAttribute("aria-expanded", abierto);
});
menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => menu.classList.remove("abierto")));

// ===== 4. Efecto de máquina de escribir =====
const destino = document.getElementById("escribiendo");
let iFrase = 0, iLetra = 0, borrando = false;

function escribir() {
  const frase = FRASES[iFrase];
  destino.textContent = frase.slice(0, iLetra);

  if (!borrando && iLetra < frase.length) iLetra++;
  else if (borrando && iLetra > 0) iLetra--;
  else if (!borrando) { borrando = true; return setTimeout(escribir, 1500); }
  else { borrando = false; iFrase = (iFrase + 1) % FRASES.length; }

  setTimeout(escribir, borrando ? 40 : 90);
}
escribir();

// ===== 5. Tarjetas de proyectos + filtros =====
const lista = document.getElementById("lista-proyectos");

function mostrarProyectos(filtro) {
  const visibles = PROYECTOS.filter(p => filtro === "todos" || p.categoria === filtro);
  lista.innerHTML = visibles.map((p, i) => `
    <article class="tarjeta" style="animation-delay:${i * 80}ms">
      <div class="tarjeta-img" style="background:${COLORES[p.categoria]}">${p.emoji}</div>
      <div class="tarjeta-cuerpo">
        <h3>${p.titulo}</h3>
        <p>${p.desc}</p>
        <div class="etiquetas">${p.tags.map(t => `<span class="etiqueta">${t}</span>`).join("")}</div>
        <a class="tarjeta-link" href="${p.link}">Ver proyecto →</a>
      </div>
    </article>`).join("");
  activarInclinacion();
}

document.querySelectorAll(".filtro").forEach(boton => {
  boton.addEventListener("click", () => {
    document.querySelector(".filtro.activo").classList.remove("activo");
    boton.classList.add("activo");
    mostrarProyectos(boton.dataset.filtro);
  });
});

// Efecto 3D: la tarjeta se inclina siguiendo el mouse
function activarInclinacion() {
  lista.querySelectorAll(".tarjeta").forEach(t => {
    t.addEventListener("mousemove", e => {
      const r = t.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      t.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
    });
    t.addEventListener("mouseleave", () => (t.style.transform = ""));
  });
}
mostrarProyectos("todos");

// ===== 6. Animaciones al hacer scroll =====
function animarContador(el) {
  const meta = +el.dataset.meta;
  const inicio = performance.now();
  const duracion = 1500;
  (function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    el.textContent = Math.floor(meta * (1 - Math.pow(1 - progreso, 3))) + (progreso === 1 ? "+" : "");
    if (progreso < 1) requestAnimationFrame(paso);
  })(inicio);
}

const observador = new IntersectionObserver(entradas => {
  entradas.forEach(entrada => {
    if (!entrada.isIntersecting) return;
    const sec = entrada.target;
    sec.classList.add("visible");
    sec.querySelectorAll(".numero").forEach(animarContador);
    sec.querySelectorAll(".relleno").forEach(b => (b.style.width = b.dataset.nivel + "%"));
    observador.unobserve(sec);
  });
}, { threshold: 0.2 });
document.querySelectorAll(".revelar").forEach(s => observador.observe(s));

// Resalta en el menú la sección visible y le pone fondo a la barra al bajar
const nav = document.querySelector(".nav");
const enlaces = document.querySelectorAll(".menu a");
window.addEventListener("scroll", () => {
  nav.classList.toggle("con-fondo", window.scrollY > 40);
  let actual = "";
  document.querySelectorAll("main section").forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) actual = s.id;
  });
  enlaces.forEach(a => a.classList.toggle("activo", a.getAttribute("href") === "#" + actual));
});

// ===== 7. Formulario con validación =====
// GitHub Pages no tiene servidor, así que el formulario no puede enviar correos por sí solo.
// Para recibir mensajes de verdad, usa un servicio como Formspree (formspree.io):
// crea un formulario allí y pon su URL en ENDPOINT_FORMULARIO.
const ENDPOINT_FORMULARIO = ""; // ej: "https://formspree.io/f/xxxxxxx"

const form = document.getElementById("formulario");
const estado = document.getElementById("form-estado");

form.addEventListener("submit", async e => {
  e.preventDefault();
  let valido = true;
  form.querySelectorAll("[required]").forEach(campo => {
    const ok = campo.checkValidity() && campo.value.trim() !== "";
    campo.classList.toggle("invalido", !ok);
    if (!ok) valido = false;
  });
  if (!valido) { estado.textContent = "Revisa los campos marcados en rojo."; return; }

  if (!ENDPOINT_FORMULARIO) {
    mostrarToast("¡Mensaje listo! (Modo demo: configura Formspree para recibirlo)");
    form.reset(); estado.textContent = "";
    return;
  }

  estado.textContent = "Enviando…";
  try {
    const r = await fetch(ENDPOINT_FORMULARIO, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error();
    form.reset(); estado.textContent = "";
    mostrarToast("¡Gracias! Tu mensaje fue enviado ✉️");
  } catch {
    estado.textContent = "No se pudo enviar. Inténtalo más tarde.";
  }
});

function mostrarToast(texto) {
  const toast = document.getElementById("toast");
  toast.textContent = texto;
  toast.classList.add("mostrar");
  setTimeout(() => toast.classList.remove("mostrar"), 3000);
}

// ===== 8. Fondo de partículas conectadas =====
const canvas = document.getElementById("particulas");
const ctx = canvas.getContext("2d");
let puntos = [];
const raton = { x: null, y: null };

function iniciarParticulas() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const cantidad = Math.min(90, Math.floor((innerWidth * innerHeight) / 15000));
  puntos = Array.from({ length: cantidad }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
  }));
}

function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const color = html.dataset.theme === "dark" ? "124, 58, 237" : "6, 182, 212";

  puntos.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.fillStyle = `rgba(${color}, 0.7)`;
    ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();

    // Líneas entre puntos cercanos (y hacia el mouse)
    for (const q of [...puntos.slice(i + 1), raton]) {
      if (q.x === null) continue;
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 130) {
        ctx.strokeStyle = `rgba(${color}, ${1 - d / 130})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    }
  });
  requestAnimationFrame(dibujar);
}

addEventListener("resize", iniciarParticulas);
addEventListener("mousemove", e => { raton.x = e.clientX; raton.y = e.clientY; });
addEventListener("mouseout", () => { raton.x = raton.y = null; });

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  iniciarParticulas();
  dibujar();
}

document.getElementById("anio").textContent = new Date().getFullYear();
