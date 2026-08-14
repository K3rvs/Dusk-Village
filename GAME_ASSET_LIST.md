# **DUSK VILLAGE — COMPLETE GAME ASSET & SPRITE LIST**

**Document Version:** 2.0  
**Project Title:** Dusk Village  
**Art Style:** 16-bit Pixel Art · 2D Top-Down (Stardew Valley & Pokémon Emerald Inspired)  
**Base Tile Size:** 16×16 px (Characters: 16×24 px, Role Portraits: 64×64 px)  

---

## **1. PLAYER AVATARS (6 SELECTABLE CHARACTERS)**

> **CRITICAL RULE:** Instigators do **NOT** have exclusive character sprites. Survivors and Instigators choose from the same pool of 6 official player avatars. Instigators remain visually indistinguishable from Survivors to maintain social deduction stealth.

### **1.1 The 6 Selectable Player Characters**

| Avatar ID | Name / Profession | Sprite Sheet Asset | Appearance & Costume | Accessories & Features | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `spr_avatar_01` | **Chef** | `Chef.png` | White Chef Jacket (`#FFFFFF`), Black Pants | Chef Toque Hat & Apron | ☑ |
| `spr_avatar_02` | **Construction Worker** | `Construction Worker.png` | Hi-Vis Orange Vest (`#E67E22`), Blue Jeans | Yellow Hardhat & Tool Belt | ☑ |
| `spr_avatar_03` | **Mechanic** | `Mechanic.png` | Navy Blue Work Overalls (`#1B365D`) | Wrench & Work Gloves | ☑ |
| `spr_avatar_04` | **Nurse** | `Nurse.png` | Teal Medical Scrubs (`#1ABC9C`), White Shoes | Stethoscope & ID Badge | ☑ |
| `spr_avatar_05` | **Office Worker** | `Office Worker.png` | Slate Suit (`#4A5568`), White Shirt, Red Tie | Briefcase & Glasses | ☑ |
| `spr_avatar_06` | **Police** | `Police.png` | Deep Navy Uniform (`#0F3460`), Police Cap | Police Badge & Duty Belt | ☑ |

### **1.2 Character Sprite Sheet Specifications (per Avatar)**
Each avatar includes a full multi-frame character sprite sheet (`Chef.png`, `Construction Worker.png`, `Mechanic.png`, `Nurse.png`, `Office Worker.png`, `Police.png`):

- **Walk Cycle (16 frames):** North (4f), South (4f), East (4f), West (4f)
- **Idle Breathing (8 frames):** North (2f), South (2f), East (2f), West (2f)
- **Interact / Pickup (3 frames):** Facing South, picking up item / interacting
- **Elimination Dissolve (8 frames):** Pixel cluster dissolve animation
- **Ground Shadow (`spr_player_shadow`):** 16×4 px elliptical shadow sprite

**Total Character Frame Count:** 6 Avatars × 36 frames = **216 character frames**.

### **1.3 Player & Role Portraits**

| Asset ID | Dimensions | Variants / Frames | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| `port_avatar_[01-06]_select` | 32×32 px | 6 portraits | Character select menu & HUD face icon | ☐ |
| `port_avatar_anon` | 32×32 px | 1 frame | Silhouette with question mark before ID reveal | ☐ |
| `port_avatar_[01-06]_elim` | 32×32 px | 6 portraits | Desaturated portrait with red X overlay (Evicted/Banned) | ☐ |
| `port_role_survivor` | 64×64 px | 1 frame | **Survivor Role Reveal:** Villager holding lantern, notebook, magnifying glass | ☐ |
| `port_role_instigator` | 64×64 px | 1 frame | **Instigator Role Reveal:** Shadowy villager holding forged document & padlock | ☐ |

---

## **2. BUILDINGS & ARCHITECTURE**
*(Modeled directly after `village_layout_map.png`)*

| Asset ID | Size (Tiles) | Dimensions | Visual Features & States | Status |
| :--- | :--- | :--- | :--- | :--- |
| `spr_bldg_villagehall` | 6×5 tiles | 96×80 px | Grand 2-story civic structure, Barn Red roof, central clock tower with clock face, bell tower apex, stone steps, dual red & blue crest banners (`prop_banner_crest`). Day/Night variants. | ☐ |
| `spr_bldg_library` | 5×4 tiles | 80×64 px | University-Style Library (`#4A5568`), stately academic brick and stone facade, columns, arches, tall arched windows, double doors, book badge marker (`ico_badge_book`). Capacity window (Green/Amber/Red). | ☐ |
| `spr_bldg_school` | 4×4 tiles | 64×64 px | School structure, timber walls with blue roof trim, chalkboard badge marker (`ico_badge_chalkboard`), attached wooden playground set. Day/Night variants. | ☐ |
| `spr_bldg_clinic` | 4×3 tiles | 64×48 px | Clinic healthcare building, white plaster facade, red cross sign (`ico_badge_redcross`), chalkboard intake badge, front flower bed. Day/Night variants. | ☐ |
| `spr_bldg_house_H[01-10]`| 3×3 tiles | 48×48 px | 10 numbered cottages H1–H10 encircling the square perimeter with roof color variants (Barn Red, Slate Blue, Forest Green, Warm Timber), small mailboxes (`spr_mailbox_H[01-10]`), lit window glow. | ☐ |
| `spr_statue_angel` | 2×3 tiles | 32×48 px | Multi-tiered stone pedestal holding a winged angel statue with lantern. States: Dormant glow, Judgment pulse, Solve burst. | ☐ |
| `spr_wall_octagonal` | 1×1 tile | 16×16 px | 13 autotiles for double-ring octagonal stone wall (`#4A5568`) & North/South iron gates (`spr_gate_iron`). | ☐ |

---

## **3. TERRAIN, PATHWAYS & ENVIRONMENT TILES**

### **3.1 Ground Tilesets (16×16 px autotiles)**
- `tile_ground_dirt` (15 tiles): Harvest Gold (`#C67D33`) dirt pathways, branch paths, sandy soil + footprint & puddle variants.
- `tile_ground_cobble` (16 tiles): Cobblestone Gray (`#8A9BA8`) central Village Square plaza paving + worn & pattern variants.
- `tile_ground_grass` (17 tiles): Village green & autumn grass + red, yellow, blue, white flowers, weeds, clover patches.
- `tile_ground_stone` (15 tiles): Slate stone walkways + cracked & mossy stone variants.

### **3.2 Trees & Foliage**

| Asset ID | Dimensions | Layers | Visual Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| `spr_tree_autumn_oak` | 32×48 px | 3 layers | Golden Oak (`#E67E22`) & Maple Crimson (`#A83232`) canopy trees. Layers: Trunk, Canopy, Shadow. | ☐ |
| `spr_tree_pine_border` | 32×64 px | 3 layers | Evergreen Pine (`#274E13`) trees forming the outer forest border. | ☐ |
| `spr_foliage_bushes` | 16×16 / 32×32 | 1 layer | Small round bushes, flowering bushes, dense hedges. | ☐ |
| `spr_tall_grass` | 16×24 px | 2 frames | Overlap layer tall grass that sways and overlaps player feet. | ☐ |
| `spr_fallen_leaves` | 16×16 px | 3 frames | Ambient drifting autumn leaf particles (Orange & Red). | ☐ |

---

## **4. OUTDOOR & VILLAGE SQUARE PROPS**

| Asset ID | Dimensions | Location / Placement | Visual Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| `prop_playground_swings` | 32×32 px | **The School** | Wooden swing set with 2 seats. | ☐ |
| `prop_playground_slide` | 32×24 px | **The School** | Red wooden playground slide. | ☐ |
| `prop_bench_timber` | 32×16 px | **Village Square** | 4 dark timber benches placed around the central plaza. | ☐ |
| `prop_lamp_post_warm` | 16×32 px | **Village Square & Paths**| 4 corner post lamps in square + path lights (3-frame flicker amber glow `#F6AD55`). | ☐ |
| `prop_fence_picket` | 16×16 px | **Player Cottages** | 13 autotiles for wooden picket property fences. | ☐ |
| `prop_fence_stone` | 16×16 px | **Village Square** | Low gray stone garden border wall. | ☐ |
| `prop_water_well` | 32×32 px | **Village Square** | Stone water well with wooden crank and bucket. | ☐ |
| `prop_notice_board` | 32×32 px | **Village Hall** | Wooden bulletin board pinned with paper notices. | ☐ |
| `prop_flower_cart` | 32×24 px | **Village Square** | Wooden cart stacked with colorful flower bundles. | ☐ |
| `prop_barrels_crates` | 16×16 & 16×32 | **Village Buildings** | Barrel stacks, wooden crates, and tied burlap grain sacks. | ☐ |
| `prop_signpost` | 16×32 px | **Path Intersections** | Directional wooden sign (pointing to Hall, Library, School, Clinic). | ☐ |
| `prop_hay_bale` | 16×16 px | **Perimeter Cottages**| Square and round autumn hay bales. | ☐ |

---

## **5. INTERIOR PROPS & INVESTIGATIVE OBJECTS**

### **5.1 Village Hall Interior**
- `prop_council_table`: 64×24 px wooden table with 6 chairs.
- `prop_ledger_lectern`: 32×32 px wooden lectern holding the active Mystery Ledger.
- `prop_filing_cabinet`: 16×32 px metal cabinet (Closed, Open drawer).
- `prop_leave_form`: 16×16 px leave of absence document (*The Breaking Point*).
- `prop_scandal_photo`: 16×16 px framed photo face-down (*The Illusory Truth*).

### **5.2 The Library Interior**
- `prop_podium_verification`: 48×32 px central 2-player verification podium with light beam.
- `prop_terminal_database`: 32×32 px factual database terminal screen.
- `prop_filing_shelves`: 48×48 px tall shelving unit stacked with labeled boxes.
- `prop_registry_book`: 16×16 px thick leather-bound book containing Source data.
- `prop_ip_trace_doc`: 16×16 px network diagram printout (*The Silent Hallways*).
- `prop_fraud_registry`: 16×16 px red-tabbed fraud folder (*The Counterfeit Cure*).
- `prop_scam_registry`: 16×16 px orange-tabbed scam folder (*The Empty Vault*).

### **5.3 The School Interior**
- `prop_student_desks`: 16×16 px wooden desk (Empty, With Notes).
- `prop_chalkboard_interior`: 32×24 px easel chalkboard with pixel clue scrawl.
- `prop_school_lockers`: 48×32 px locker row (1 open locker revealing paper scrap).
- `prop_counselor_desk`: 32×24 px counselor's desk with report paper.
- `prop_student_ledger`: 16×16 px open ledger (*The Counterfeit Cure*).

### **5.4 The Clinic Interior**
- `prop_patient_intake_desk`: 32×24 px reception desk with form stack.
- `prop_medicine_cabinet`: 32×32 px glass-front cabinet with 6 medicine bottles.
- `prop_examination_table`: 32×16 px table with white sheet & clipboard.
- `prop_herbal_cure_flyer`: 16×16 px promotional flyer (*The Counterfeit Cure*).
- `prop_prescription_pad`: 16×16 px notepad with scrawled lines.

### **5.5 Player Cottages Interior**
- `prop_cottage_bed`: 32×24 px wooden bed with avatar-colored blanket.
- `prop_cottage_desk`: 32×24 px writing desk (Night ability activation point).
- `prop_unsent_letters`: 16×16 px envelopes (*The Silent Hallways*).
- `prop_software_receipt`: 16×16 px receipt (*The Illusory Truth*).

---

## **6. MEMORY FRAGMENT ICONS (5 MIL MYSTERIES)**

| Mystery Title | Fragment Type | Asset ID | Icon Visual Description | Location | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Counterfeit Cure** | Claim | `ico_frag_cure_claim` | Green flyer with leaf icon & "CURE!" text | Clinic | ☐ |
| | Context | `ico_frag_cure_context` | Open ledger with red health graph | School | ☐ |
| | Source | `ico_frag_cure_source` | Red folder stamped "FRAUD" | Library | ☐ |
| **Silent Hallways** | Claim | `ico_frag_hallways_claim` | Printed chat bubbles with angry emoji | School | ☐ |
| | Context | `ico_frag_hallways_context`| Sealed envelope with tear-stain | Houses | ☐ |
| | Source | `ico_frag_hallways_source` | Screen showing IP address trace | Library | ☐ |
| **Breaking Point** | Claim | `ico_frag_breakpoint_claim` | Official form stamped "LEAVE" | Village Hall | ☐ |
| | Context | `ico_frag_breakpoint_context`| Counselor clipboard with sad icon | School | ☐ |
| | Source | `ico_frag_breakpoint_source` | Continuous-feed chat printout | Library | ☐ |
| **Illusory Truth** | Claim | `ico_frag_illusion_claim` | Photo frame with cracked glass | Village Hall | ☐ |
| | Context | `ico_frag_illusion_context` | Software purchase receipt | Houses | ☐ |
| | Source | `ico_frag_illusion_source` | Photo with "METADATA" data overlay | Library | ☐ |
| **Empty Vault** | Claim | `ico_frag_vault_claim` | Red letter with "URGENT" & hook icon | Houses | ☐ |
| | Context | `ico_frag_vault_context` | Bank ledger with red money arrows | Village Hall | ☐ |
| | Source | `ico_frag_vault_source` | Orange folder "SCAM REGISTRY" | Library | ☐ |
| **Generic World Scroll** | World Item | `spr_frag_world_pulse` | 16×16 px glowing scroll (2f pulse) | World Map | ☐ |

---

## **7. UI CHROME, BUTTONS & ICONOGRAPHY**

| Asset ID | Dimensions | Description & Variants | Status |
| :--- | :--- | :--- | :--- |
| `ui_panel_9slice` | 16×16 9-slice | Default (Dusk Blue), Alert (Red), Success (Green), Secure (Violet) | ☐ |
| `ui_btn_primary` | 120×32 px | Primary action buttons ("Submit", "Understood") | ☐ |
| `ui_btn_danger_ban` | 80×24 px | Danger voting button ("BAN") | ☐ |
| `ui_btn_ghost_forgive` | 80×24 px | Ghost voting button ("FORGIVE") | ☐ |
| `ui_progress_vote` | Variable×8 px | Dual-fill voting bar (Green vs Blue ratio) | ☐ |
| `ico_magnifier_16` | 16×16 px | Search & inspection icon | ☐ |
| `ico_badge_book` | 16×16 px | Library building marker badge | ☐ |
| `ico_badge_redcross` | 16×16 px | Clinic building marker badge | ☐ |
| `ico_badge_chalkboard` | 16×16 px | School building marker badge | ☐ |
| `ico_status_check` | 8×8 px | Verified Green checkmark ✓ | ☐ |
| `ico_status_cross` | 8×8 px | Forged Alert Red cross ✗ | ☐ |
| `ico_status_dash` | 8×8 px | Parchment dash — | ☐ |
| `ico_status_lock` | 8×8 px | Dusk Blue lock 🔒 | ☐ |
| `ico_phase_icons` | 16×16 px | Sun (Day), Crescent Moon (Night), Gavel (Judgment) | ☐ |

---

## **8. VFX & AUDIO SOUND EFFECTS**

### **8.1 VFX Sprite Sheets**
- `vfx_ban_sever` (64×64 px, 8f): Electric crackle radiating on ban eviction.
- `vfx_dissolve_player` (16×24 px, 8f): Pixel cluster dissolve on elimination.
- `vfx_verify_sparkle` (24×24 px, 4f): Green spiral sparkles during Library verification.
- `vfx_statue_burst` (64×64 px, 8f): Green-gold light explosion on mystery solve.
- `vfx_solve_fail_shake` (300ms): Screen jitter on incorrect submission.
- `vfx_dawn_sweep` (3000ms): Sunrise gradient band sweeping left-to-right at Dawn.

### **8.2 Audio Sound Effects (SFX)**
- `sfx_button_click`: 50ms 8-bit click.
- `sfx_panel_open`: 150ms paper unfurl & whoosh.
- `sfx_fragment_pickup`: 300ms 3-note ascending chime.
- `sfx_fragment_verified`: 500ms triumphant staccato chord.
- `sfx_solve_fail`: 400ms low 2-tone descending buzzer.
- `sfx_bell_day`: 2000ms deep church bell toll.
- `sfx_bell_night`: 1500ms muffled echoing night bell.
- `sfx_ban_sever`: 1000ms electric crackle & sever tone.
- `mus_victory_fanfare`: 4000ms major key victory sting.
- `mus_defeat_sting`: 3000ms somber minor key defeat sting.

---

## **9. COMPLETE ASSET COUNT SUMMARY**

| Category | Base Assets | Total Variants / Frames |
| :--- | :--- | :--- |
| **Selectable Player Avatars** | **6 Avatars** (`Chef`, `Construction Worker`, `Mechanic`, `Nurse`, `Office Worker`, `Police`) | **216 frames** |
| **Portraits & Role Revealers** | **14 Portraits** (6 Select, 1 Anon, 6 Elim, 2 Role) | **14 assets** |
| **Building Exteriors** | **6 Structures + 10 Cottages + Octagonal Wall** | **~45 variants** |
| **Terrain & Trees** | **6 Autotile Sets + Oak/Pine/Foliage** | **114 tiles** |
| **Village Square & Outdoor Props** | **12 Outdoor Prop Sets** (Swings, Slide, Benches, Lamps) | **~25 items** |
| **Interior Props** | **23 Interior Props** (Across 5 building types) | **~30 items** |
| **Memory Fragment Icons** | **15 Puzzle Icons + 1 World Scroll Sprite** | **16 assets** |
| **UI Components & Badges** | **28 HUD Components + 16 Icon Badges** | **~60 variants** |
| **VFX & Audio SFX** | **6 VFX Sheets + 10 Sound Effects/Stings** | **16 assets** |
