# RayNayel Property Advocates

Responsive static website for RayNayel, recreated from the current public site as a lightweight HTML, CSS and JavaScript project.

## Pages

- Home
- About
- Services
- Buyers Advocacy
- Vendor Advocacy
- Property Investment
- Portfolio
- Socials
- Contact

## Run locally

Use any static web server from the repository root, for example:

```bash
npx serve .
```

The contact form endpoint is implemented as an Azure Static Web Apps API in `api/contact`.

## Azure Static Web Apps settings

Add these application settings before enabling live enquiry delivery:

- `COMMUNICATION_SERVICES_CONNECTION_STRING`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL` (normally `info@raynayel.com.au`)

Add the repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN` to enable the included deployment workflow. The validation step still runs when the token is not configured.

## Validation

```bash
node scripts/check-site.mjs
```

## Content and media

RayNayel business copy and media are retained for the RayNayel website. The first push includes an asset-sync workflow that copies the approved original media into this repository; pages temporarily fall back to the current public media URLs if a local copy is unavailable.
