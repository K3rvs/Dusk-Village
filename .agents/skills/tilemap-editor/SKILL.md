---
name: tilemap-editor
description: Interactive Tilemap & Sprite Layout Editor for Dusk Village. Allows manually dictating tile placements, paths, buildings, trees, and props on the 60x45 village grid.
---

# Tilemap Editor Skill

This skill provides full manual control over the 2D Top-Down map layout of Dusk Village.

## Tools & Features
1. **Visual Map Editor (`public/map_editor.html`)**: Open `http://localhost:8080/map_editor.html` to visually paint ground tiles, place building footprints, plant trees, and adjust dirt paths on a 60x45 grid.
2. **JSON Tilemap Exporter**: Export the painted map directly into `assets/tilemaps/village_exterior.json` or run `node scripts/generate_tilemaps.js` with custom tile coordinate arrays.
3. **Godot-style Tile Painting**: Palette-based tile selector for Grass (1), Dirt Path (2), Cobblestone Plaza (3), Stone Border (19), Trees, and Buildings.
