// aframe
import {MapGenerator} from "./core/generators/map-generator";

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

require("@/aframe/core/components/hostile-entity.js");
require("@/aframe/core/generators/map-generator.js");

import {DEBUG_MODE} from "@/aframe/settings.js";
import {redirectConsoleOutputForAFrame} from "@/aframe/core/utils/redirect-console-output.js";
import {addCustomDevTools} from "@/aframe/core/utils/dev-tools.js";
import {getModelFilesFromFolder} from "@/aframe/core/utils/path-utils.js";
import {registerComponentDesktopMouseDrag} from "@/aframe/core/mechanics/mouse-drag.js";

/**
 * Main function to create the environment
 * @constructor
 */
export function SuspiciousIsland() {
	if (DEBUG_MODE) redirectConsoleOutputForAFrame();
	registerComponentDesktopMouseDrag();

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
			loading-screen="dotsColor: red; backgroundColor: black;">
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
									raycaster="objects: .grabbable">
								</a-entity>
						</a-entity>

						<!-- VR users -->
						<!-- TODO: fix -->
						<a-entity
							id="leftHand"
							hand-controls="hand: left"
							super-hands="colliderEvent: raycaster-intersection"
							raycaster="objects: .grabbable"
						></a-entity>
						<a-entity
							id="rightHand"
							hand-controls="hand: right"
							super-hands="colliderEvent: raycaster-intersection"
							raycaster="objects: .grabbable"
						></a-entity>

				</a-entity>

				<a-entity gltf-model="#environment-temple" position="0 0 -25"></a-entity>
				<a-entity gltf-model="#environment-island" scale="50 50 50"></a-entity>
<!--				<a-entity gltf-model="#navigation-island-navmesh" scale="50 50 50" nav-mesh visible="false"></a-entity>-->

				<a-sky color="#87CEEB"></a-sky>
		</a-scene>
	`;

	// cleanup
	preloadAssets.remove();

	// spawn pizzas
	const nm = view.querySelector("[gltf-model='#environment-island']");
	// const nm = view.querySelector("[gltf-model='#navigation-island-navmesh']");
	nm.addEventListener("model-loaded", () => new MapGenerator(nm).generate());

	// NOTE: leave this at the end
	view.querySelector("a-scene").addEventListener("loaded", _ => addCustomDevTools());
}
