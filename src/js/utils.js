export async function fetchJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path}: ${response.status}`);
  }

  return response.json();
}

export function createElement(tagName, className, textContent) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (typeof textContent === "string") {
    element.textContent = textContent;
  }

  return element;
}

export function clearElement(element) {
  if (element) {
    element.replaceChildren();
  }
}

export function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function appendList(parent, items, className) {
  const list = createElement("ul", className);

  items.filter(Boolean).forEach((item) => {
    const listItem = createElement("li", "", item);
    list.appendChild(listItem);
  });

  parent.appendChild(list);
  return list;
}
