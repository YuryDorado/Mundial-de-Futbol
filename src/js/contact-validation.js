const validators = {
  "full-name": {
    message: "Ingresa tu nombre completo.",
    test: (value) => value.trim().length > 2,
  },
  email: {
    message: "Ingresa un correo electrónico válido.",
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  },
  phone: {
    message: "Usa solo números, espacios, + o guiones.",
    test: (value) => /^[+0-9\s-]{7,20}$/.test(value.trim()),
  },
  subject: {
    message: "Ingresa un asunto.",
    test: (value) => value.trim().length > 2,
  },
  message: {
    message: "El mensaje debe tener mínimo 10 caracteres.",
    test: (value) => value.trim().length >= 10,
  },
};

export function initContactValidation() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");

  if (!form) {
    return;
  }

  function setFieldState(field, message = "") {
    const wrapper = field.closest(".form-field");
    const error = form.querySelector(`[data-error-for="${field.id}"]`);
    const hasError = Boolean(message);

    wrapper?.classList.toggle("is-invalid", hasError);
    field.setAttribute("aria-invalid", String(hasError));

    if (error) {
      error.textContent = message;
    }
  }

  function validateField(field) {
    const validator = validators[field.id];

    if (!validator) {
      return true;
    }

    const isValid = validator.test(field.value);
    setFieldState(field, isValid ? "" : validator.message);
    return isValid;
  }

  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => {
      validateField(field);
      if (status) {
        status.textContent = "";
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const fields = Array.from(form.querySelectorAll("input, textarea"));
    const isValid = fields.every(validateField);

    if (!status) {
      return;
    }

    if (isValid) {
      status.textContent = "Formulario validado correctamente. Gracias por contactar la plataforma.";
      form.reset();
      fields.forEach((field) => setFieldState(field));
      return;
    }

    status.textContent = "Revisa los campos marcados antes de enviar.";
  });
}
