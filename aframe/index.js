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

// components
require("@/aframe/core/components/hostile-entity.js");
require("@/aframe/core/components/sacrificial-place.js");

// utils
import {DEBUG_MODE} from "@/aframe/settings.js";
import {redirectConsoleOutputForAFrame} from "@/aframe/core/utils/redirect-console-output.js";
import {addCustomDevTools} from "@/aframe/core/utils/dev-tools.js";
import {getModelFilesFromFolder} from "@/aframe/core/utils/path-utils.js";

// managers
import {GameStateManager} from "@/aframe/core/managers/gamestate-manager.js";

/**
 * Main function to create the environment
 * @constructor
 */
export function SuspiciousIsland() {
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
			fog="type: exponential; color: #050505; density: 0.09"
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

								<!-- Light Source -->
								<a-entity
									id="playerLight"
									light="type: spot; color: #ffffff; intensity: 2.0; angle: 50; distance: 60; decay: 1.5; penumbra: 0.1;"
									position="0 0 -0.2"
									light-jitter>
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

				<a-entity gltf-model="#environment-temple" position="40 -2 -110"></a-entity>
				<a-box sacrificial-place width="10" height="1" depth="9" position="45 -6 -150" visible="false"></a-box>

				<a-entity
					gltf-model="#environment-forest"
					position="0 5 0"
					scale="40 40 40">
				</a-entity>

				<a-sky color="#0a0a0f"></a-sky>
				<a-light type="ambient" color="#222233" intensity="0.8"></a-light>
		</a-scene>
	`;

	// cleanup
	preloadAssets.remove();

	// start
	const scene = view.querySelector("a-scene");
	const manager = new GameStateManager(scene);
	// manager.start();

	// NOTE: leave this at the end
	scene.addEventListener("loaded", _ => addCustomDevTools());
}


AFRAME.registerComponent("light-jitter", {
	schema: {
		rotAmount: { default: 0.001 },
		flickerSpeed: { default: 500000 },
		intensityVar: { default: 0.25 },
		angleVar: { default: 0.05 },
		distanceVar: { default: 0.25 }
	},

	init: function () {
		this.baseRotation = this.el.object3D.rotation.clone();

		const light = this.el.getAttribute("light");
		this.baseIntensity = light.intensity || 3;
		this.baseAngle = light.angle || 20;
		this.baseDistance = light.distance || 20;
	},

	tick: function (time) {
		const obj = this.el.object3D;

		obj.rotation.x = this.baseRotation.x + Math.sin(time / 300) * this.data.rotAmount;
		obj.rotation.y = this.baseRotation.y + Math.cos(time / 400) * this.data.rotAmount;

		const flicker = Math.sin(time / this.data.flickerSpeed);

		const intensity =
			this.baseIntensity +
			flicker * this.data.intensityVar +
			(Math.random() - 0.5) * 0.2;

		const angle =
			this.baseAngle +
			Math.sin(time / 500) * this.data.angleVar;

		const distance =
			this.baseDistance +
			Math.cos(time / 600) * this.data.distanceVar;

		this.el.setAttribute("light", {
			intensity: intensity,
			angle: angle,
			distance: distance
		});
	}
});
