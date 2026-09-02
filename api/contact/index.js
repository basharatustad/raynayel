const { EmailClient } = require("@azure/communication-email");

const text = (value, max) => String(value || "").trim().slice(0, max);
const safe = (value) => text(value, 5000)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

module.exports = async function (context, req) {
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  if (body.company) {
    context.res = { status: 200, jsonBody: { message: "Thank you. We will be in touch shortly." } };
    return;
  }

  const name = text(body.name, 120);
  const email = text(body.email, 254);
  const phone = text(body.phone, 40);
  const service = text(body.service, 80);
  const message = text(body.message, 3000);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !validEmail || message.length < 10) {
    context.res = { status: 400, jsonBody: { message: "Please provide your name, a valid email address and a short message." } };
    return;
  }

  const connectionString = process.env.COMMUNICATION_SERVICES_CONNECTION_STRING;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!connectionString || !from || !to) {
    context.log.error("Contact email settings are incomplete.");
    context.res = { status: 503, jsonBody: { message: "Online enquiries are temporarily unavailable." } };
    return;
  }

  const html = [
    "<h2>New RayNayel website enquiry</h2>",
    "<p><strong>Name:</strong> " + safe(name) + "</p>",
    "<p><strong>Email:</strong> " + safe(email) + "</p>",
    "<p><strong>Phone:</strong> " + safe(phone || "Not provided") + "</p>",
    "<p><strong>Service:</strong> " + safe(service || "General enquiry") + "</p>",
    "<p><strong>Message:</strong><br>" + safe(message).replace(/\n/g, "<br>") + "</p>"
  ].join("");

  try {
    const client = new EmailClient(connectionString);
    const poller = await client.beginSend({
      senderAddress: from,
      recipients: { to: [{ address: to }] },
      replyTo: [{ address: email, displayName: name }],
      content: {
        subject: "RayNayel website enquiry — " + name,
        plainText: "Name: " + name + "\nEmail: " + email + "\nPhone: " + (phone || "Not provided") + "\nService: " + (service || "General enquiry") + "\n\n" + message,
        html
      }
    });
    await poller.pollUntilDone();
    context.res = { status: 200, jsonBody: { message: "Thank you. We will be in touch shortly." } };
  } catch (error) {
    context.log.error("Contact email failed", error);
    context.res = { status: 502, jsonBody: { message: "We could not send your message right now." } };
  }
};
