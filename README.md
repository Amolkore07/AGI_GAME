# AGI Robot Warfare

An intense open-world 3D survival game running in the browser using Three.js. Humanity fights back against rogue AGI robots in a post-apocalyptic cityscape.

## Features

- **Open World Survival**: Roam a large city environment with buildings, streets, dynamic time of day, and an ocean.
- **Combat Mechanics**: Arsenal of 5 weapons (Plasma Pistol, Rail Gun, Flame Thrower, Rocket Launcher, EMP Cannon).
- **Vehicles**: Drive realistic cars and fly planes to navigate the world quickly.
- **Dynamic Day/Night System**: Press `O` to toggle between dark post-apocalyptic nights and clear blue skies.
- **Companion AI**: Deploy TARS to assist you in combat against robotic hordes.
- **Robots & Creatures**: Face varied robotic enemies and mutant creatures.

## Controls

*   **W A S D**: Move
*   **Mouse**: Look Around
*   **Left Click**: Fire Weapon
*   **R**: Reload
*   **1-5**: Switch Weapons
*   **SHIFT**: Sprint
*   **SPACE**: Jump
*   **E**: Interact (Open Doors)
*   **G**: Enter/Exit Vehicle or Plane
*   **T**: Summon TARS
*   **O**: Toggle Day/Night Mode
*   **ESC**: Pause
*   **F**: Flashlight

**Plane Controls**:
*   **W**: Thrust (accelerate)
*   **Space**: Brake (decelerate)
*   **A / D**: Roll left / right
*   **Up / Down arrows**: Pitch up / down

## How to Run

1.  This is a static web application. 
2.  Use a local development server to avoid CORS issues when loading textures.
3.  You can use VS Code Live Server, or run via Node.js (`npx serve .`) or directly open `index.html` (though some assets might not load depending on your browser's security policies).

## Architecture
- `index.html`: Entry point and UI overlay.
- `js/game.js`: Core game loop, input handling, and player physics.
- `js/world.js`: Procedural generation of the city, buildings, items, and lighting (day/night).
- `js/vehicles.js`: Physics and interaction for drivable cars and planes.
- `js/weapons.js`: Weapon fire logic and projectiles.
- `js/robots.js` & `js/creatures.js`: Enemy AI and pathfinding.
- `js/tars.js`: Companion AI logic.
