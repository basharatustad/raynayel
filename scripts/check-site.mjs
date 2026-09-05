import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pages = [
  "index.html",
  "about/index.html",
  "services/index.html",
  "buyers-advocacy/index.html",
  "vendor-advocacy/index.html",
  "property-investment/index.html",
  "portfolio/index.html",
  "socials/index.html",
  "contact/index.html",
  "404.html"
];
const support = [
  "assets/css/site.css",
  "assets/js/site.js",
  "api/contact/index.js",
  "api/contact/function.json",
  "api/package.json",
  "staticwebapp.config.json"
];
const errors = [];

for (const file of [...pages, ...support]) {
  if (!fs.existsSync(path.join(root, file))) errors.push("Missing " + file);
}

for (const file of pages.filter((item) => item !== "404.html")) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  for (const token of ["<header", "<main", "<footer", "<h1", "assets/css/site.css", "assets/js/site.js"]) {
    if (!html.includes(token)) errors.push(file + " is missing " + token);
  }
  const h1Count = (html.match(/<h1[ >]/g) || []).length;
  if (h1Count !== 1) errors.push(file + " must contain exactly one h1");
  const links = [...html.matchAll(/href="(\/[^"#?]*)/g)].map((match) => match[1]);
  for (const href of links) {
    if (href.startsWith("/api/")) continue;
    const target = href === "/" ? "index.html" : path.join(href.slice(1), "index.html");
    if (!fs.existsSync(path.join(root, target)) && !fs.existsSync(path.join(root, href.slice(1)))) {
      errors.push(file + " links to missing " + href);
    }
  }
}

const contact = fs.readFileSync(path.join(root, "contact/index.html"), "utf8");
for (const name of ["name=\"name\"", "name=\"email\"", "name=\"phone\"", "name=\"service\"", "name=\"message\"", "data-contact-form"]) {
  if (!contact.includes(name)) errors.push("Contact form is missing " + name);
}

const azureWorkflowPath = ".github/workflows/azure-static-web-apps-victorious-field-0379ce500.yml";
if (fs.existsSync(path.join(root, azureWorkflowPath))) {
  const workflow = fs.readFileSync(path.join(root, azureWorkflowPath), "utf8");
  if (!/app_location:\s*["']?\/["']?\s*(?:#.*)?$/m.test(workflow)) {
    errors.push("Azure Static Web Apps workflow must deploy from repository root /");
  }
  if (/app_location:\s*["']?\.\/about["']?/m.test(workflow)) {
    errors.push("Azure Static Web Apps workflow must not deploy only the about folder");
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("RayNayel site validation passed for " + pages.length + " pages.");
