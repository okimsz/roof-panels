# SHELTER / Insulated roof studio

A complete furnished house with a landscaped plot, pitched sandwich-panel roof, interactive roof section, heat-flow markers, and an educational thermal comparison. Navy/cyan architecture-inspired interface. All assets and Three.js are local.

## VS Code
Open this folder with Node.js 20+ installed. No npm install required.

```sh
npm run dev
```
Visit http://127.0.0.1:5176/. Keep the terminal running. Do not open modular index.html via file:// because browsers restrict module imports.

```sh
npm test
npm run build
```
Open `dist/insulated-roof-house.html` directly for the single-file offline version. It includes Three.js and its MIT license. WebGL is required.

## Source
- `src/scene.js`: procedural house, garden, furnishings, roof layers and camera.
- `src/physics.js`: resistance, roof heat flow and exact first-order indoor temperature integration.
- `src/app.js`: controls, chart and telemetry.
- `src/styles.css`: responsive page design.
- `scripts/`: local server and limited named-import offline bundler.

## Model
SI R-values. Core R=d/k; U=1/(.14002+d/k). Representative conductivities PU .025, EPS .036, mineral wool .040 W/(m K). Roof area 54.4 m². Sol-air temperature is ambient + .55*irradiance/25. Indoor balance: C dT/dt = UA(Tsol-air-Troom) + 70(Tambient-Troom) + 180 W; C=3 MJ/K. The comparison uses the same model with zero core resistance. All temperatures start at 26 °C. Exact exponential integration avoids numerical overshoot at accelerated time scales. Reduction compares roof U values at the same temperature difference, not total energy savings.

Roof geometry uses proportional core thickness (50–300 mm); the selected quadrant lifts in inspection mode without altering the thermal balance. Surrounding house and garden stay visible. Roof overhangs are decorative and excluded from thermal area. Surface skins are visually thickened. Heat markers are schematic, not fluid particles. No personal roster data from the reference form is included.

No HVAC, detailed weather, thermal bridging, moisture, roof storage or long-wave sky exchange. The model illustrates trends, not certified building performance or material ratings. Full assumptions and primary educational reference links are in Model notes.
