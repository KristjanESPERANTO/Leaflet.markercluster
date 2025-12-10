# TODO

## Globale Leaflet.\* Registrierungen entfernen (v3 Breaking Change)

**Ansatz: Clean-Cut - Radikal & Sauber (ohne Rückwärtskompatibilität)**

**Problem:**

- `package.json` deklariert `"sideEffects": false"`
- Aber fast alle Hauptklassen machen globale Registrierungen: `Leaflet.ClassName = ...`
- Dies widerspricht dem ES6-Module-First Ansatz und verhindert echtes Tree-Shaking

**Betroffene Dateien (6 Registrierungen):**

- `src/MarkerCluster.js`: `Leaflet.MarkerCluster = ...`
- `src/MarkerClusterGroup.js`: `Leaflet.MarkerClusterGroup = ...` und `Leaflet.markerClusterGroup = ...`
- `src/DistanceGrid.js`: `Leaflet.DistanceGrid = ...`
- `src/MarkerCluster.QuickHull.js`: `Leaflet.QuickHull = ...`
- `src/MarkerCluster.Spiderfier.js`: `Leaflet.MarkerClusterNonAnimated = ...`

**Aktueller Code-Pattern:**

```javascript
export const ClassName = Leaflet.ClassName = Class.extend({ ... })
```

**Ziel-Pattern (Pure ES6):**

```javascript
export const ClassName = Class.extend({ ... })
```

**Migration (Clean-Cut):**

1. Alle `Leaflet.X = ` Chain-Assignments im Source-Code entfernen
2. Nur noch ES6 `export const` behalten
3. `src/index.js` prüfen - alle exports sind bereits vorhanden ✅
4. ✅ **IIFE-Build komplett entfernt** aus `build/rollup-config.js` - nur noch ES-Module-Build
5. **Nur ES-Module Build** behalten (format: 'es') ✅
6. ✅ `package.json` bereinigen - **FERTIG**:
   - ✅ `"main"` und `"module"` beide auf ES-Build zeigen
   - ✅ `"type": "module"` ist gesetzt
   - ✅ `"exports"` zeigt auf ES-Build
   - ✅ `"sideEffects": false` ist gesetzt
7. ✅ **Tests aktualisieren** - **FERTIG!** Alle 35 Test-Dateien auf ES6 Module umgestellt:
   - ✅ Migration-Script erstellt (`spec/migrate-tests.js`)
   - ✅ Alle Test-Dateien von `L.ClassName` auf Named Imports konvertiert
   - ✅ Browser-Mocking auf Sinon-Stubs umgestellt
   - ✅ Import Map in `spec/index.html` konfiguriert
   - ✅ ESLint für bare specifier 'leaflet.markercluster' konfiguriert
   - ✅ **Alle 179 Tests bestehen!**
8. **Examples aktualisieren** - ✅ **FERTIG!** Alle 19 HTML-Dateien auf ES6 Module umgestellt:
   - ✅ **marker-clustering.html** fertig - als Template für andere nutzen
   - **Wichtige Learnings:**
     - ✅ Import Map verwenden (Browser-Standard 2023+, alle modernen Browser)
     - ✅ Named Imports statt globales `L`: `import { Map, TileLayer, Marker } from 'leaflet'`
     - ✅ `const` statt `let` wo möglich (moderner Code-Stil)
     - ✅ Kommentar bei Import Map: "in production, use a CDN or bundler"
     - ⚠️ NICHT: relativen Pfad in Rollup-Config hardcoden (Plugin soll Leaflet nicht mitliefern)
     - ⚠️ NICHT: `import L from 'leaflet'` (klingt nach globalem L, verwirrt)
   - **Template-Struktur:**

     ```html
     <!-- Import map for ES modules - in production, use a CDN or bundler -->
     <script type="importmap">
       { "imports": { "leaflet": "../node_modules/leaflet/dist/leaflet.js" } }
     </script>

     <script type="module">
       import { Map, TileLayer, Marker, DomUtil } from 'leaflet';
       import { MarkerClusterGroup } from '../dist/leaflet.markercluster.js';

       const map = new Map('map', { ... });
       const markers = new MarkerClusterGroup();
     </script>
     ```

   - ✅ **Alle 19 Dateien konvertiert:**
     - marker-clustering.html
     - marker-clustering-accessibility.html
     - marker-clustering-convexhull.html
     - marker-clustering-custom.html
     - marker-clustering-dragging.html
     - marker-clustering-everything.html
     - marker-clustering-geojson.html
     - marker-clustering-pane.html
     - marker-clustering-singlemarkermode.html
     - marker-clustering-spiderfier.html
     - marker-clustering-zoomtobounds.html
     - marker-clustering-zoomtoshowlayer.html
     - marker-clustering-realworld.388.html
     - marker-clustering-realworld.10000.html
     - marker-clustering-realworld.50000.html
     - marker-clustering-realworld-maxzoom.388.html
     - marker-clustering-realworld-mobile.388.html
     - geojson.html
     - remove-geoJSON-when-spiderfied.html

9. ✅ **Dokumentation aktualisiert** - **FERTIG!**
   - ✅ README.md: Alle Code-Beispiele auf ES6 umgestellt
   - ✅ Source-Code JSDoc-Kommentare: Alle `L.` Referenzen entfernt (6 Dateien)
   - ✅ globalThis.L.Browser Fallbacks entfernt (MarkerClusterGroup.js, MarkerCluster.Spiderfier.js)
   - ✅ Direct Browser import from 'leaflet' - sauberer Code ohne Legacy-Fallbacks
   - ✅ CHANGELOG: v3.0.0-alpha.1 dokumentiert
   - ⏳ Migration Guide: noch offen - für Nutzer erstellen

10. ✅ **.include() Pattern eliminiert mit ES6 Spread!** - **FERTIG!**
    - ✅ **QuickHull**: `getConvexHull()` als `quickHullMethods` export → `...quickHullMethods` in MarkerCluster
    - ✅ **Refresh**: `refreshClusters()` etc. als `refreshMethods` export → `...refreshMethods` in MarkerClusterGroup
    - ✅ **Animation**: `_noAnimation`, `_withAnimation` als `animationMethods` export → `...animationMethods` in MarkerClusterGroup
    - ✅ **Spiderfier**: Method-Objects als separate exports → ES6 Spread in beide Klassen
    - ✅ **Alle 179 Tests bestehen!**
    - **Neue Architektur:**
      - Thematische Trennung in separate Dateien **behalten** ✅
      - Kein `.include()` mehr - stattdessen ES6 Spread Operator ✅
      - Gleiche Funktionalität, modernerer Code ✅
      - Dateien bleiben klein und fokussiert ✅

11. ✅ **TypeScript Declarations** - **FERTIG!** (ursprünglich für v3.1 geplant)
    - ✅ `types/index.d.ts` mit vollständigen Typdefinitionen
    - ✅ MarkerClusterGroupOptions, MarkerClusterGroup, MarkerCluster typisiert
    - ✅ Alle öffentlichen Methoden und Events dokumentiert
    - ✅ package.json: `"types"` Feld und `"exports"` angepasst
    - ✅ `types/**/*` zu `files` hinzugefügt

12. ⏳ **Final Release vorbereiten:**
    - ~~Migration Guide erstellen~~ - nicht nötig (keine existierenden Nutzer)
    - ✅ README.md Fork-Hinweis ergänzt
    - ⏳ CI/CD Pipeline einrichten

**Bereits erledigt:**

- ✅ `QuickHull` und `MarkerClusterNonAnimated` werden in `index.js` als Named Exports bereitgestellt
- ✅ Alle Hauptklassen (`MarkerClusterGroup`, `MarkerCluster`, `DistanceGrid`) bereits exportiert

**Vorteile (Clean-Cut):**

- ✂️ **Keine Legacy-Last** - alte Zöpfe abgeschnitten
- 📦 **Kleineres Package** - nur 1 Build statt 2
- 🚀 **Optimales Tree-Shaking** - echte ES6 Module
- 🎯 **Ein klarer Weg** - ES6 imports, keine Verwirrung
- 🧹 **Sauberer Code** - keine doppelten Registrierungen
- ⚡ **Konsistent** mit `"sideEffects": false"`
- 🎨 **Modern** - zeitgemäße Web-Entwicklung

**Warum der radikale Ansatz die richtige Strategie ist:**

1. **Browser-Support ist exzellent**
   - ES6 Modules: Chrome 61+ (2017), Firefox 60+ (2018), Safari 11+ (2017), Edge 79+ (2020)
   - Import Maps: Chrome 89+ (2021), Firefox 108+ (2022), Safari 16.4+ (2023)
   - Alle modernen Browser seit ~2023 unterstützen beides nativ

2. **Zukunftssicher statt rückwärtskompatibel**
   - ES6 Modules sind **DER Standard** seit ~2020
   - Bundler (Vite, Webpack, Rollup) unterstützen ES6 nativ perfekt
   - TypeScript-Integration funktioniert besser
   - IDE Auto-Imports funktionieren out-of-the-box

3. **Major Version = Breaking Changes erlaubt**
   - v3 ist der perfekte Zeitpunkt für einen Clean Break
   - Nutzer die alte Browser unterstützen müssen, können bei v2.x bleiben
   - v2.x wird nicht gelöscht, bleibt verfügbar
   - Klare Trennung: v2 = legacy, v3 = modern

4. **Bessere Developer Experience**
   - Kein Rätselraten über globales `L` vs. imports
   - Ein klarer Weg: `import { MarkerClusterGroup } from 'leaflet.markercluster'`
   - Moderne Tooling-Unterstützung
   - Weniger Code = weniger Bugs = einfachere Wartung

5. **Die Realität: Die meisten Nutzer verwenden bereits Bundler**
   - npm/bundler-Ära: Vite, Webpack, Parcel, Rollup
   - Nutzer die noch `<script src="...">` verwenden: können Import Maps nutzen
   - Verschwindend kleiner Anteil mit alten Browsern: bleiben bei v2.x
   - Das ist okay! Major Version = erlaubt uns, modern zu sein

**Migration Guide für Nutzer:**

**Alt (v2.x - funktioniert NICHT mehr):**

```html
<script src="leaflet.js"></script>
<script src="leaflet.markercluster.js"></script>
<script>
  const mcg = L.markerClusterGroup(); // ❌ BREAKING
  const mcg2 = new L.MarkerClusterGroup(); // ❌ BREAKING
</script>
```

**Neu (v3.x - ES6 Modules):**

```html
<script type="module">
  import L from "leaflet";
  import { MarkerClusterGroup } from "leaflet.markercluster";

  const mcg = new MarkerClusterGroup(); // ✅
  map.addLayer(mcg);
</script>
```

**Oder mit Bundler (Vite, Webpack, etc.):**

```javascript
import { MarkerClusterGroup } from "leaflet.markercluster";

const mcg = new MarkerClusterGroup({
  maxClusterRadius: 50
});
```

**Verfügbare Exports:**

- `MarkerClusterGroup` - Haupt-Klasse für Clustering
- `MarkerCluster` - Einzelner Cluster
- `DistanceGrid` - Interne Spatial-Grid-Struktur
- `QuickHull` - ConvexHull-Algorithmus
- `MarkerClusterNonAnimated` - Nicht-animierte Cluster-Variante

**Fortschritt:**

- ✅ **Source-Code (6 Dateien): FERTIG** - alle `Leaflet.X = ` Registrierungen entfernt
  - ✅ `src/MarkerCluster.js` - `Leaflet.MarkerCluster = ` entfernt
  - ✅ `src/MarkerClusterGroup.js` - `Leaflet.MarkerClusterGroup = ` entfernt
  - ✅ `src/MarkerClusterGroup.js` - `Leaflet.markerClusterGroup()` Factory entfernt
  - ✅ `src/DistanceGrid.js` - `Leaflet.DistanceGrid = ` entfernt
  - ✅ `src/MarkerCluster.QuickHull.js` - `Leaflet.QuickHull = ` entfernt
  - ✅ `src/MarkerCluster.Spiderfier.js` - `Leaflet.MarkerClusterNonAnimated = ` entfernt
  - ✅ Alle ungenutzten `import Leaflet` default imports entfernt
  - ✅ Build erfolgreich getestet - keine Fehler
- ✅ **Build-Config (1 Datei): FERTIG** - IIFE-Build entfernt, nur ES-Module
- ✅ **package.json: FERTIG** - alle exports zeigen auf ES-Build
- ✅ **Examples (19 Dateien): FERTIG** - alle auf ES6 modules umgestellt
- ✅ **Tests (35 Dateien): FERTIG** - alle auf ES6 modules umgestellt, 179 Tests bestehen
- ✅ **Dokumentation: KOMPLETT FERTIG**
  - ✅ README.md Code-Beispiele auf ES6 aktualisiert
  - ✅ Source-Code Kommentare (JSDoc) - alle `L.` Referenzen entfernt
  - ✅ globalThis.L Fallbacks entfernt - direkter Browser import
  - ✅ **.include() Pattern eliminiert** - ES6 Spread Operator statt Monkey-Patching
  - ⏳ CHANGELOG: noch offen
  - ⏳ Migration Guide: noch offen
- **Status: ~95% fertig** (nur noch CHANGELOG + Migration Guide fehlen)

## Weitere Architektur-Verbesserungen (für spätere v3.x Versionen)

### 1. ✅ **`.include()` Pattern eliminiert mit ES6 Spread!** - **KOMPLETT IN v3.0!**

**Problem GELÖST:** `.include()` war ein Legacy Mixin-Pattern - ist jetzt durch ES6 Spread ersetzt!

**Alte Struktur (❌ VORHER):**

```javascript
// MarkerCluster.QuickHull.js
const methods = { getConvexHull() { ... } }
MarkerCluster.include(methods)  // ❌ Monkey-Patching
```

**Neue Struktur (✅ JETZT):**

```javascript
// MarkerCluster.QuickHull.js
export const quickHullMethods = {
  getConvexHull() { ... }
}

// MarkerCluster.js
import { quickHullMethods } from './MarkerCluster.QuickHull.js'
export const MarkerCluster = Marker.extend({
  ...quickHullMethods,  // ✅ ES6 Spread statt .include()
  // ... andere Methoden
})
```

**Umgesetzte Refactorings:**

1. ✅ **QuickHull** → `MarkerCluster.QuickHull.js` exportiert `quickHullMethods`
   - `getConvexHull()` mit ES6 Spread in `MarkerCluster.js` eingefügt
   - Datei bleibt separat, thematische Trennung erhalten

2. ✅ **Refresh** → `MarkerClusterGroup.Refresh.js` exportiert `refreshMethods`
   - `refreshClusters()`, `_flagParentsIconsNeedUpdate()`, `_refreshSingleMarkerModeMarkers()`
   - Mit ES6 Spread in `MarkerClusterGroup.js` eingefügt
   - `refreshIconOptions()` bleibt in `Marker.include()` (erweitert Leaflet's Marker - OK!)

3. ✅ **Animation** → `MarkerClusterGroup.Animation.js` exportiert `animationMethods`
   - `_noAnimation`, `_withAnimation`, `_animationZoomOutSingle`, `_animationEnd`, `_forceLayout`
   - Mit ES6 Spread in `MarkerClusterGroup.js` eingefügt
   - Große Animation-Logik bleibt in separater Datei

4. ✅ **Spiderfier** → `MarkerCluster.Spiderfier.js` exportiert mehrere Method-Objects
   - `spiderfierMethods` → in `MarkerCluster.js`
   - `spiderfierAnimatedMethods` → in `MarkerCluster.js`
   - `spiderfierGroupMethods` → in `MarkerClusterGroup.js`
   - `MarkerClusterNonAnimated` bleibt als Named Export

**Vorteile der ES6 Spread-Lösung:**

- ✅ **Keine `.include()` mehr** - kein Monkey-Patching
- ✅ **Thematische Trennung erhalten** - Code bleibt in fokussierten Dateien
- ✅ **ES6-idiomatisch** - nutzt modernen JavaScript-Standard
- ✅ **Dateien bleiben klein** - keine riesigen Hauptdateien
- ✅ **Gleiche Funktionalität** - 100% abwärtskompatibel in der API
- ✅ **Bessere Wartbarkeit** - klar strukturiert, leicht zu finden

**Verbleibende `.include()` (✅ OK):**

- `Marker.include()` in `MarkerOpacity.js` - **MUSS bleiben** (erweitert Leaflet's Marker)
- `Marker.include()` in `MarkerClusterGroup.Refresh.js` - **MUSS bleiben** (erweitert Leaflet's Marker)

→ Diese sind **KEINE Legacy**, sondern notwendige Extensions von Leaflet's API!

**Status:** ✅ **KOMPLETT FERTIG in v3.0!** Alle 179 Tests bestehen.

---

### 2. **`Util.setOptions()` und `Util.stamp()` evaluieren** 🟡 **MEDIUM**

**Problem:** Leaflet Util-Funktionen statt nativer JS-Lösungen

**Betroffene Stellen:**

**`Util.setOptions()` - 3 Vorkommen:**

- `src/MarkerClusterGroup.js:71` - Constructor options merge
- `src/MarkerClusterGroup.Refresh.js:103` - Icon options update

**Aktuell:**

```javascript
import { Util } from "leaflet";
Util.setOptions(this, options);
```

**Leaflet 2.x Implementation:**

```javascript
function setOptions(obj, options) {
  if (!Object.hasOwn(obj, "options")) {
    obj.options = obj.options ? Object.create(obj.options) : {};
  }
  for (const i in options) {
    if (Object.hasOwn(options, i)) {
      obj.options[i] = options[i];
    }
  }
  return obj.options;
}
```

**Mögliche Alternative:**

```javascript
// Einfaches Object.assign würde NICHT funktionieren wegen Prototypen-Kette
// Leaflet's setOptions ist speziell für Options-Vererbung
// BESSER: Behalten! Es ist Leaflet's API-Konvention
```

**`Util.stamp()` - 6 Vorkommen:**

- `src/MarkerClusterGroup.js:549` - Layer-ID für Lookup
- `src/DistanceGrid.js:18,46,106` - Object-ID für Spatial Index

**Leaflet 2.x Implementation:**

```javascript
let lastId = 0;
function stamp(obj) {
  if (!("_leaflet_id" in obj)) {
    obj["_leaflet_id"] = ++lastId;
  }
  return obj._leaflet_id;
}
```

**Mögliche Alternative:**

```javascript
// WeakMap statt stamp?
const objectIds = new WeakMap();
let nextId = 0;
function getId(obj) {
  if (!objectIds.has(obj)) {
    objectIds.set(obj, ++nextId);
  }
  return objectIds.get(obj);
}
```

**Analyse:**

- ✅ `Util.setOptions()` - **BEHALTEN** - ist Leaflet's Standard-Pattern für Options
- 🤔 `Util.stamp()` - **EVALUIEREN** - WeakMap wäre moderner, aber stamp() ist Leaflet-Standard
  - stamp() hat Vorteil: Eindeutige ID über mehrere Instanzen hinweg
  - WeakMap hat Vorteil: Kein Pollution des Objekts mit `_leaflet_id`
  - **Empfehlung:** BEHALTEN für Konsistenz mit Leaflet

**Entscheidung:** ⏸️ **NICHT ÄNDERN** - Leaflet's Util-Funktionen sind Teil der API, konsistent behalten

**Aufwand:** 0 Stunden (keine Änderung empfohlen)

---

### 3. **ES6 Classes statt `.extend()`?** 💭 **EVALUIERT - NICHT EMPFOHLEN**

**Frage:** Warum nutzen wir `FeatureGroup.extend()` statt ES6 `class MarkerClusterGroup extends FeatureGroup`?

**Grund:** Leaflet 2.x selbst nutzt **KEINE ES6 classes**, sondern ein eigenes `.extend()` System:

```javascript
// Leaflet 2.x Source (leaflet-src.js)
// Nutzt Funktionen, KEINE ES6 classes
function setOptions(obj, options) {
  /* ... */
}
function stamp(obj) {
  /* ... */
}

// Klassen-System basiert auf .extend(), nicht ES6 class
```

**Könnten wir auf ES6 classes umbauen?**

**Option: ES6 Classes nutzen**

```javascript
// THEORETISCH möglich:
class MarkerClusterGroup extends FeatureGroup {
  constructor(options) {
    super();
    this.options = {
      /* defaults */
    };
    Object.assign(this.options, options);
  }

  addLayer(layer) {
    /* ... */
  }
}
```

**Probleme:**

1. ❌ **Inkompatibel mit Leaflet's `.include()` System** - würde brechen
2. ❌ **Leaflet's `.extend()` macht mehr als nur Vererbung:**
   - Automatisches Options-Merging
   - Prototype-Chain-Setup für Leaflet's Event-System
   - Support für `initialize()` statt `constructor()`
3. ❌ **Wir müssten Leaflet's interne Mechanismen nachbauen:**
   - `setOptions()` manuell aufrufen
   - Event-System manuell integrieren
   - Options-Vererbung manuell implementieren
4. ❌ **Breaking Change ohne echten Vorteil:**
   - API würde sich ändern (Breaking)
   - Kein Performance-Gewinn
   - Kein Tree-Shaking-Vorteil
   - Nur andere Syntax

**Entscheidung:** ⛔ **NICHT ÄNDERN**

- `.extend()` ist Leaflet's API - konsistent bleiben
- ES6 classes würden mehr Probleme schaffen als lösen
- Leaflet 2.x selbst nutzt auch keine ES6 classes
- Erst wenn Leaflet 3.x auf ES6 classes umstellt, könnten wir folgen

**Aufwand:** N/A (nicht empfohlen)

**Fazit:** `.prototype.` Aufrufe wie `FeatureGroup.prototype.fire.call(this, ...)` sind **KORREKT und NÖTIG** für Leaflet's `.extend()` System - das ist KEIN Legacy-Pattern!

---

## Zusammenfassung: Legacy-Patterns Roadmap

### ✅ In v3.0 KOMPLETT erledigt:

1. ✅ **.include() Pattern eliminiert** - ES6 Spread Operator statt Monkey-Patching
   - QuickHull, Refresh, Animation, Spiderfier - alle refactored
   - Thematische Trennung in separate Dateien behalten
   - Kleine, fokussierte Module statt riesiger Hauptdateien

### ✅ Behalten (Teil von Leaflet's API):

2. **Util.setOptions()** - Leaflet-Standard für Options-Merging
3. **Util.stamp()** - Leaflet-Standard für Object-IDs
4. **.extend() Klassen-System** - Leaflet's Core API, nicht ES6 classes
5. **.prototype.\* Super-Calls** - Notwendig für .extend() System
6. **Marker.include()** in MarkerOpacity.js & Refresh.js - Notwendige Leaflet-Extensions

**Status:** Alle Legacy-Patterns in UNSEREM Code eliminiert! 🎉

---

## Zusammenfassung der v3.0 Migration

### Was wurde erreicht? ✅

**Vollständige ES6-Modernisierung:**

1. ✅ **Globale Registrierungen entfernt** - Kein `L.MarkerClusterGroup` mehr
2. ✅ **Pure ES6 Module** - Nur Named Exports, keine IIFE
3. ✅ **Source-Code clean** - Alle 6 Dateien modernisiert
4. ✅ **Build vereinfacht** - Nur noch 1 ES-Module-Build (IIFE entfernt)
5. ✅ **package.json optimal** - `"type": "module"`, `"sideEffects": false`
6. ✅ **19 Examples auf ES6** - Mit Import Maps, moderne Syntax
7. ✅ **35 Test-Dateien auf ES6** - 179 Tests bestehen
8. ✅ **Dokumentation aktualisiert** - README, JSDoc, keine L.-Referenzen
9. ✅ **Legacy-Code entfernt** - globalThis.L Fallbacks raus, direkter Browser import
10. ✅ **.include() eliminiert** - ES6 Spread statt Monkey-Patching, thematische Trennung erhalten
11. ✅ **TypeScript Declarations** - `types/index.d.ts` mit vollständigen Typdefinitionen

### Was bleibt zu tun? ⏳

#### Package & Build Modernisierung:

1. ✅ **CSS Custom Properties** - Theming-Support mit CSS Variablen - **FERTIG!**
   - ✅ `--leaflet-cluster-*` Variablen für Farben, Größen, Opacity
   - ✅ Nutzer können Styles einfach überschreiben ohne komplexe CSS-Regeln
   - ✅ Dark Mode Support via `@media (prefers-color-scheme: dark)`
   - ✅ Vollständig dokumentiert in `CSS-THEMING.md`
   - ✅ Live-Beispiel: `example/custom-theme-example.html`
   - ✅ Abwärtskompatibel - gleiche visuelle Defaults wie v2.x

2. ✅ **package.json** - Moderne Exports
   - Moderne `exports` mit conditional imports
   - Explizite CSS-Pfade
   - `src/**` aus `files` entfernt (Nutzer brauchen nur `dist/`)

#### Dokumentation:

3. ✅ **JSDoc vervollständigen** - **FERTIG!** Bessere IDE-Unterstützung auch ohne TypeScript
   - ✅ eslint-plugin-jsdoc installiert und konfiguriert
   - ✅ Alle öffentlichen Methoden dokumentiert (28 Warnings behoben)
   - ✅ @param, @returns hinzugefügt wo sie fehlten
   - ✅ Leaflet-Typen definiert (Point, LatLng, Icon)
   - ✅ IDE Autocomplete & IntelliSense verbessert
   - ✅ Basis für spätere TypeScript Declarations (v3.1) geschaffen
   - ✅ **Alle 179 Tests bestehen weiterhin**

4. ✅ **CHANGELOG.md** - **FERTIG!** v3.0.0-alpha.1 Breaking Changes dokumentiert
   - Kompaktes Format basierend auf Commit-Messages
   - Breaking Changes, Added, Changed, Removed, Fixed sections
   - Alpha-Warnung prominent oben

5. ~~Migration Guide~~ - nicht nötig (keine existierenden Nutzer)
   - CHANGELOG enthält die wichtigsten Migrations-Hinweise falls doch benötigt

---

## 🎉 v3.0.0-alpha.1 Release (2025-11-18)

**STATUS: READY TO PUBLISH** ✅

### Was ist fertig:

- ✅ **Code-Migration komplett** - Alle ES6 Refactorings abgeschlossen
- ✅ **Tests** - Alle 179 Tests bestehen
- ✅ **Build** - ES-Module-Build funktioniert
- ✅ **Examples** - Alle 19 auf ES6 umgestellt
- ✅ **package.json** - Version auf `3.0.0-alpha.1`, `publishConfig` für `next` tag gesetzt
- ✅ **CHANGELOG.md** - Alpha-Release dokumentiert
- ✅ **README.md** - Alpha-Warnung prominent oben

### Was fehlt noch (für v3.0.0 final):

#### Dokumentation & Release:

- ~~Migration Guide~~ - nicht nötig (keine existierenden Nutzer)
- ✅ **README.md** - Fork-Hinweis ergänzt

#### Tooling & CI:

- ✅ stylelint durch eslint-plugin-css ersetzen und in CI einbauen
- ✅ lintstaged und simple-git-hooks in package.json ergänzen
- ✅ commit-and-tag-version einführen
- ✅ GitHub Actions CI/CD Pipeline einrichten (Tests, Linting, npm publish)
- ✅ scripts in CONTRIBUTING.md dokumentieren

#### Evaluierungen:

- ✅ ~~Umbenennung evaluieren~~ → verschoben auf v4 (siehe unten)
- ~~Leaflet 1.9.4 Kompatibilität~~ - bewusst nicht getestet, Fork ist nur für Leaflet 2.x

#### Bereits in v3.0 erledigt (ursprünglich für v3.1 geplant):

- ✅ **TypeScript Declarations** - `types/index.d.ts` mit vollständigen Typdefinitionen
  - MarkerClusterGroupOptions, MarkerClusterGroup, MarkerCluster
  - Alle öffentlichen Methoden und Events typisiert
  - In package.json exportiert (`"types"` und `"exports"`)

### Release Commands:

```bash
# 1. Build erstellen
npm run build

# 2. Tests laufen lassen
npm test

# 3. Git Tag erstellen
git tag -a v3.0.0-alpha.1 -m "Release v3.0.0-alpha.1 - ES6 modules, tested with Leaflet 2.x alpha"

# 4. Tag pushen
git push origin v3.0.0-alpha.1

# 5. npm publish (mit 'next' tag, nicht 'latest')
npm publish
# publishConfig in package.json sorgt für --tag next --access public
```

### Nach dem Release:

- Issues/Discussions für Feedback eröffnen
- Community-Testing abwarten
- Bugs fixen in v3.0.0-alpha.2, alpha.3, etc.
- Migration Guide basierend auf Feedback verbessern
- Wenn Leaflet 2.x stable → v3.0.0 final release

---

#### Weitere mögliche Verbesserungen (v3.0 oder v3.1):

- ✅ **Demo-Seite / GitHub Pages** - Interaktive Beispiele online: https://kristjanesperanto.github.io/Leaflet.markercluster/
- ✅ **Badges in README.md** - npm version, CI status, license
- ~~🔍 **CONTRIBUTING.md aktualisieren**~~ - bereits erledigt
- ✅ **Issue/PR Templates** - Für bessere Bug Reports und Feature Requests

---

#### Future Work (v4+):

6. 🔮 **Package umbenennen zu `leaflet-marker-cluster`**
   - Kebab-case ist npm-Konvention
   - Kurzer Import: `import { MarkerClusterGroup } from 'leaflet-marker-cluster'`
   - Unterscheidet sich klar vom Original `leaflet.markercluster`
   - Breaking Change → Major Version (v4)

7. 🔮 **Performance-Optimierungen** - Für sehr große Datensätze (>100k Marker)
   - Web Worker Support für Clustering-Berechnung evaluieren
   - Virtual Scrolling für Spiderfied Markers
   - Lazy Loading von Marker-Daten

8. 🔮 **Accessibility verbessern**
   - ARIA-Labels für Cluster-Marker
   - Keyboard-Navigation für Spiderfied Markers
   - Screen Reader Announcements

9. 🔮 **Test-Framework weiter modernisieren**
   - **Evaluation durchgeführt (Nov 2024):**
     - ❌ Vitest: Browser-Mode noch experimentell, Leaflet benötigt echten Browser
     - ❌ node:test: Kein Browser-Support, DOM-Mocking zu komplex für Leaflet
     - ✅ Mocha + Playwright: Funktioniert perfekt, echte Browser-Tests
   - **Strategie:** Mocha behalten, Setup verbessern
   - **Abgeschlossene Optimierungen:**
     - ✅ **Expect.js → Chai** - **FERTIG in v3.0!** Modernere Assertions (Nov 2024)
       - 438 Assertions konvertiert in 35 Test-Dateien
       - ES6 Module Import: `import * as chai from 'chai'` statt UMD build
       - Alle 179 Tests bestehen weiterhin ✅
     - ✅ **Happen entfernt** - **FERTIG in v3.0!** Tote Dependency (Nov 2024)
       - v0.3.2 von 2013, wurde nirgendwo genutzt
       - Einfach deinstalliert, alle Tests bestehen ✅
   - **Mögliche weitere Optimierungen (v3.1+):**
     - 🔍 **Sinon auf ES6 Module** - v21 ist modern, aber als `<script>` geladen
       - Wird intensiv genutzt: fake timers, spies, stubs
       - Könnte als `import * as sinon from 'sinon'` geladen werden
       - Aufwand: 15-30 Min (ES6 import + window.sinon export)
     - 🔍 **Mocha auf ES6 Module?** - v11 unterstützt ES6
       - Schwierig: mocha.setup() + mocha.run() Browser-API
       - Geringer Mehrwert - funktioniert perfekt als `<script>`
       - Aufwand: 1-2h, nicht empfohlen
     - Playwright-Config optimieren
     - Parallele Test-Execution
     - Test-Reporter verbessern
   - **Aufwand gesamt:** ~2-3 Stunden (optional)
   - **Entscheidung:** Mocha ist modern genug (v11.x, ES6 Support, aktiv maintained)

---

**Status: v3.0.0-alpha.1 READY** - Siehe Release-Section oben! 🚀

---

## Offene Punkte Übersicht (v3.0.0 final)

| Priorität   | Aufgabe                          | Aufwand | Status          |
| ----------- | -------------------------------- | ------- | --------------- |
| ~~🔴 Hoch~~ | ~~Migration Guide erstellen~~    | -       | ~~nicht nötig~~ |
| ✅          | README.md Fork-Hinweis           | 10min   | ✅ erledigt     |
| ✅          | GitHub Actions CI/CD             | 1-2h    | ✅ erledigt     |
| ✅          | lintstaged + simple-git-hooks    | 30min   | ✅ erledigt     |
| ~~🟡~~      | ~~Leaflet 1.9.4 Kompatibilität~~ | -       | nicht geplant   |
| ✅          | stylelint → eslint-plugin-css    | 1h      | ✅ erledigt     |
| ✅          | Package-Umbenennung evaluieren   | 30min   | ✅ → v4         |

**Geschätzter Gesamtaufwand bis v3.0.0 final: ~1 Stunde**
