const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = window.matchMedia("(pointer: fine)").matches;

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}

function initNav() {
  const toggle = qs(".menu-toggle");
  const nav = qs(".nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) nav.classList.remove("is-open");
  });
}

function initProgress() {
  const bar = qs(".progress");
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    bar.style.width = `${p * 100}%`;
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initReveal() {
  const nodes = qsa(".reveal");
  if (!nodes.length) return;
  if (reduce || !("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-in");
        else entry.target.classList.remove("is-in");
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  nodes.forEach((n) => io.observe(n));
}

function initPreview() {
  const well = qs(".preview-well");
  const img = qs(".preview-well img");
  const rows = qsa(".index-row[data-preview]");
  if (!well || !img || !rows.length) return;

  const show = (src) => {
    img.src = src;
    well.classList.add("is-on");
  };
  const hide = () => well.classList.remove("is-on");

  rows.forEach((row) => {
    row.addEventListener("mouseenter", () => show(row.dataset.preview));
    row.addEventListener("focus", () => show(row.dataset.preview));
    row.addEventListener("mouseleave", hide);
    row.addEventListener("blur", hide);
  });
}

function initCursor() {
  const cursor = qs(".cursor");
  if (!cursor || reduce || !fine) return;
  document.body.classList.add("has-cursor");
  let x = 0;
  let y = 0;
  let cx = 0;
  let cy = 0;
  let on = false;

  window.addEventListener(
    "pointermove",
    (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!on) {
        on = true;
        cursor.classList.add("is-on");
        cx = x;
        cy = y;
      }
    },
    { passive: true }
  );

  document.addEventListener("pointerover", (e) => {
    const link = e.target.closest("a, button, input, textarea, label");
    cursor.classList.toggle("is-link", Boolean(link));
  });

  const tick = () => {
    cx += (x - cx) * 0.22;
    cy += (y - cy) * 0.22;
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(tick);
  };
  tick();
}

function initLightbox() {
  const links = qsa("[data-gallery]");
  if (!links.length) return;

  const lb = document.createElement("div");
  lb.className = "lb";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Просмотр изображения");
  lb.innerHTML = `
    <button class="lb-close" type="button">Закрыть</button>
    <button class="lb-prev" type="button" aria-label="Предыдущее">←</button>
    <img alt="">
    <button class="lb-next" type="button" aria-label="Следующее">→</button>
  `;
  document.body.appendChild(lb);

  const picture = qs("img", lb);
  const groups = {};
  links.forEach((link) => {
    const name = link.dataset.gallery || "default";
    groups[name] = groups[name] || [];
    groups[name].push(link);
  });

  let current = [];
  let index = 0;

  const render = () => {
    const item = current[index];
    picture.src = item.getAttribute("href");
    picture.alt = qs("img", item)?.alt || "";
  };

  const open = (link) => {
    const name = link.dataset.gallery || "default";
    current = groups[name];
    index = current.indexOf(link);
    render();
    lb.classList.add("is-open");
    qs(".lb-close", lb).focus();
  };

  const close = () => {
    lb.classList.remove("is-open");
    picture.removeAttribute("src");
  };

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      open(link);
    });
  });

  qs(".lb-close", lb).addEventListener("click", close);
  qs(".lb-prev", lb).addEventListener("click", () => {
    index = (index - 1 + current.length) % current.length;
    render();
  });
  qs(".lb-next", lb).addEventListener("click", () => {
    index = (index + 1) % current.length;
    render();
  });
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });
  window.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") qs(".lb-prev", lb).click();
    if (e.key === "ArrowRight") qs(".lb-next", lb).click();
  });
}

function initContact() {
  const form = qs("#contact-form");
  const status = qs("#contact-form-status");
  const submit = qs("#contact-form-submit");
  if (!form || !status) return;

  const setStatus = (type, text) => {
    status.textContent = text;
    status.classList.remove("is-ok", "is-err");
    if (type) status.classList.add(type === "ok" ? "is-ok" : "is-err");
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();

    if (!name || !email || !message) {
      setStatus("err", "Заполните все поля.");
      return;
    }

    setStatus("", "");
    if (submit) submit.disabled = true;

    fetch("/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then((result) => {
        if (result.ok && result.data?.ok) {
          form.reset();
          setStatus("ok", "Сообщение отправлено.");
        } else {
          setStatus("err", result.data?.error || "Не удалось отправить. Попробуйте позже.");
        }
      })
      .catch(() => setStatus("err", "Ошибка сети. Проверьте подключение."))
      .finally(() => {
        if (submit) submit.disabled = false;
      });
  });
}

function initYear() {
  const el = qs("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
}

initNav();
initProgress();
initReveal();
initPreview();
initCursor();
initLightbox();
initContact();
initYear();
