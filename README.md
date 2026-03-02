<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Ubden Solar FX Portal

Advanced solar array planning workspace with deterministic energy calculations, meter-based nesting, and a dedicated 3D review scene.

## Runtime

- Node.js `22.x`
- npm `10+`

The repo is pinned to Node 22 via [`.nvmrc`](./.nvmrc) and `package.json > engines`.

## Local Development

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. Run quality checks:
   `npm run lint`
   `npm run test`
   `npm run build`

## Notes

- The app stores project state under `ubden-solar-fx:v2` in local storage and migrates legacy scattered keys on first load.
- External CI or Docker images should use a Node 22 base image to stay aligned with the repo toolchain.
