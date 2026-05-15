export function initNavigation() {
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const menuButton = document.querySelector(".mobile-menu-toggle");
  const links = Array.from(document.querySelectorAll(".nav-link"));
  const sections = links
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  function closeMenu() {
    body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Abrir menú de navegación");
  }

  function setActive(id) {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.section === id);
    });
  }

  menuButton?.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación");
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!body.classList.contains("menu-open")) {
      return;
    }

    const target = event.target;
    const clickedOutside = target instanceof Node && !sidebar?.contains(target) && !menuButton?.contains(target);

    if (clickedOutside) {
      closeMenu();
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) {
        setActive(visible.target.id);
      }
    },
    {
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0.18, 0.35, 0.6],
    },
  );

  sections.forEach((section) => observer.observe(section));
}
