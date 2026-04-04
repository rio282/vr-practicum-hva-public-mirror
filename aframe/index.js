// aframe
require("aframe");

/**
 *  "super-hands" stupid hack fix for:
 *  	"Error: The component `grabbable` has been already registered.
 *  	Check that you are not loading two versions of the same component or
 *  	two different components of the same name."
 *  Source: https://github.com/c-frame/aframe-super-hands-component?tab=readme-ov-file#browser
 */
delete AFRAME.components["grabbable"];

require("aframe-extras");
require("@c-frame/aframe-physics-system");
require("super-hands");

// components
require("@/aframe/core/components/light-jitter.js");

// import levels
require("@/aframe/core/components/levels/hallway.js");
require("@/aframe/core/components/levels/bedroom.js");
require("@/aframe/core/components/levels/kitchen.js");


// utils
import {DEBUG_MODE, enablePovLightingSystem} from "@/aframe/settings.js";
import {redirectConsoleOutputForAFrame} from "@/aframe/core/utils/redirect-console-output.js";
import {addCustomDevTools} from "@/aframe/core/utils/dev-tools.js";
import {getModelFilesFromFolder} from "@/aframe/core/utils/path-utils.js";

// managers
import {GameStateManager} from "@/aframe/core/managers/gamestate-manager.js";

/**
 * Main function to create the environment
 * @constructor
 */
export function Game() {
	if (DEBUG_MODE) redirectConsoleOutputForAFrame();

	// load
	const preloadAssets = document.createElement("div");
	preloadAssets.id = "assets-temp";

	getModelFilesFromFolder().forEach(model => {
		const assetItem = document.createElement("a-asset-item");
		assetItem.setAttribute("id", model.id.replace("#", ""));
		assetItem.setAttribute("src", model.src);
		preloadAssets.appendChild(assetItem);
	});

	// update the view
	const view = document.getElementById("view");
	view.innerHTML = `
		<a-scene ${DEBUG_MODE ? "stats" : ""}
			physics="gravity: -9.8; debug: ${DEBUG_MODE.toString()};"
			fog="${enablePovLightingSystem ? 'type: exponential; color: #050505; density: 0.09' : ''}"
			loading-screen="dotsColor: darkblue; backgroundColor: #8B0000;">
				<a-assets>
					<!-- textures -->
					<img id="nav-mesh-texture" src="aframe/assets/textures/nav-mesh-texture.png" />

					<!-- models -->
					${preloadAssets.innerHTML}
				</a-assets>

				<a-entity
					id="player"
					movement-controls="constrainToNavMesh: true;"
					nav-agent="speed: 5;"
					position="0 0 0">

						<a-entity
							camera
							id="camera"
							look-controls
							position="0 1.6 0">
								<!-- Desktop users -->
								<a-entity
									cursor="rayOrigin: mouse"
									raycaster="objects: .level-trigger">
								</a-entity>

								<!-- Light Source -->
								${enablePovLightingSystem ? `
								<a-entity
									id="playerLight"
									light="type: spot; color: #ffffff; intensity: 2.0; angle: 50; distance: 60; decay: 1.5; penumbra: 0.1;"
									position="0 0 -0.2"
									light-jitter>
								</a-entity>
							` : ""}
						</a-entity>

						<!-- VR users -->
						<!-- TODO: fix -->
<!--						<a-entity-->
<!--							id="leftHand"-->
<!--							hand-controls="hand: left"-->
<!--							super-hands="colliderEvent: raycaster-intersection"-->
<!--							raycaster="objects: .grabbable"-->
<!--						></a-entity>-->
<!--						<a-entity-->
<!--							id="rightHand"-->
<!--							hand-controls="hand: right"-->
<!--							super-hands="colliderEvent: raycaster-intersection"-->
<!--							raycaster="objects: .grabbable"-->
<!--						></a-entity>-->

				</a-entity>

				<a-entity id="level-root"></a-entity>

				${enablePovLightingSystem ? `
				<a-sky color="#0a0a0f"></a-sky>
				<a-light type="ambient" color="#222233" intensity="0.8"></a-light>
				` : ""}
		</a-scene>
	`;

	// cleanup
	preloadAssets.remove();

	// start
	const scene = view.querySelector("a-scene");
	const manager = new GameStateManager(scene);
	manager.start();

	// NOTE: leave this at the end
	scene.addEventListener("loaded", _ => addCustomDevTools());
}
