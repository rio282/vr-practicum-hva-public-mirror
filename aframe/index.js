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
require("@/aframe/core/components/entities/patrol-entity.js");

// components pt. 2
require("@/aframe/core/utils/mouse-drag.js");
require("@/aframe/core/utils/vr-hand-grab.js");

// import levels
require("@/aframe/core/components/levels/hallway.js");
require("@/aframe/core/components/levels/bedroom.js");
require("@/aframe/core/components/levels/kitchen.js");
require("@/aframe/core/components/levels/forest.js");

// utils
import {DEBUG_MODE, enablePovLightingSystem} from "@/aframe/settings.js";
import {redirectConsoleOutputForAFrame} from "@/aframe/core/utils/redirect-console-output.js";
import {addCustomDevTools} from "@/aframe/core/utils/dev-tools.js";
import {getFilesFromFolder, _m_context, _a_context} from "@/aframe/core/utils/path-utils.js";

// managers
import {GameStateManager} from "@/aframe/core/managers/gamestate-manager.js";

/**
 * Main function to create the environment
 * @constructor
 */
export function Game() {
	window.vrMode = "grab";
	if (DEBUG_MODE) redirectConsoleOutputForAFrame();

	// load
	const preloadAssets = document.createElement("div");
	preloadAssets.id = "assets-temp";

	getFilesFromFolder("", _m_context).forEach(model => {
		const assetItem = document.createElement("a-asset-item");
		assetItem.setAttribute("id", model.id.replace("#", ""));
		assetItem.setAttribute("src", model.src);
		preloadAssets.appendChild(assetItem);
	});

	getFilesFromFolder("", _a_context).forEach(model => {
		const audio = document.createElement("audio");
		audio.setAttribute("id", `audio-${model.id.replace("#", "")}`);
		audio.setAttribute("src", model.src);
		audio.setAttribute("crossorigin", "anonymous");
		preloadAssets.appendChild(audio);
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
									raycaster="objects: .grabbable, .level-trigger">
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

						<!-- VR users (some settings get overriden in vr-hand-grab.js->tick()) -->
						<a-entity
							id="leftHand"
							hand-controls="hand: left"
							super-hands="colliderEvent: raycaster-intersection"
							oculus-touch-controls="hand: left; model: false"
							vr-hand-grab="touchRadius: 0.24; palmY: -0.02; palmZ: -0.12"
							raycaster="objects: .clickable; far: 4.5"
							cursor="rayOrigin: entity; fuse: false"
							line="color: #9ee7ff; opacity: 0.95">
						</a-entity>

						<a-entity
							id="rightHand"
							hand-controls="hand: right"
							super-hands="colliderEvent: raycaster-intersection"
							oculus-touch-controls="hand: right; model: false"
							vr-hand-grab="touchRadius: 0.24; palmY: -0.02; palmZ: -0.12"
							raycaster="objects: .clickable; far: 4.5"
							cursor="rayOrigin: entity; fuse: false"
							line="color: #9ee7ff; opacity: 0.95">
						</a-entity>

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

	// honestly, whatever dawg.
	// const player = scene.querySelector("#player");
	// scene.addEventListener("start-cutscene", () => disableControls(player));
	// scene.addEventListener("end-cutscene", () => enableControls(player));

	// --- fixes weird bug where audio won't start playing because of supposed suspended state.
	function unlockAudioContext() {
		if (!scene.audioListener) return;

		const ctx = scene.audioListener.context;

		const resumeAudio = () => {
			if (ctx.state === "suspended") ctx.resume();
		};

		// resume on normal user input
		window.addEventListener("click", resumeAudio, { once: true });
		window.addEventListener("keydown", resumeAudio, { once: true });
		window.addEventListener("touchstart", resumeAudio, { once: true });

		// Resume for VR sessions
		scene.addEventListener("enter-vr", () => {
			const session = scene.renderer.xr.getSession?.();
			if (!session) return;

			// try to resume immediately
			resumeAudio();

			// resume when XR input sources fire
			const resumeOnInput = () => {
				resumeAudio();
				session.removeEventListener("select", resumeOnInput);
				session.removeEventListener("squeeze", resumeOnInput);
			};

			session.addEventListener("select", resumeOnInput);
			session.addEventListener("squeeze", resumeOnInput);
		});
	}

	document.querySelector("a-scene").addEventListener("loaded", unlockAudioContext);

	// NOTE: leave this at the end
	scene.addEventListener("loaded", _ => {
		if (DEBUG_MODE) addCustomDevTools();
	});
}
