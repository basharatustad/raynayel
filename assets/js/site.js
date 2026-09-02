(function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll("img[data-fallback-src]").forEach(function (image) {
    image.addEventListener("error", function () {
      if (image.dataset.fallbackApplied === "true") return;
      image.dataset.fallbackApplied = "true";
      image.src = image.dataset.fallbackSrc;
    });
  });

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (item) { item.classList.add("visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (item) { observer.observe(item); });
  }

  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var status = form.querySelector("[data-form-status]");
    var submit = form.querySelector("button[type=submit]");
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      status.className = "form-status";
      status.textContent = "Sending your message…";
      submit.disabled = true;
      var data = Object.fromEntries(new FormData(form).entries());
      try {
        var response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        var result = await response.json().catch(function () { return {}; });
        if (!response.ok) throw new Error(result.message || "We could not send your message.");
        status.classList.add("success");
        status.textContent = result.message || "Thank you. We will be in touch shortly.";
        form.reset();
      } catch (error) {
        status.classList.add("error");
        status.textContent = error.message + " You can also call +61 405 282 748.";
      } finally {
        submit.disabled = false;
      }
    });
  }
})();
