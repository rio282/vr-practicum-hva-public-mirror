import {MapGenerator} from "@/aframe/core/generators/map-generator.js";

export const STATE = Object.freeze({
	INITIALIZING: "initializing",
	PLAYING: "playing",
	IN_CUTSCENE: "in-cutscene",
	GAME_OVER: "game-over",
	GAME_WON: "game-completed",
});

export class GameStateManager {

	#scene;
	#state = STATE.INITIALIZING;

	constructor(scene) {
		this.#scene = scene;
		scene.addEventListener(STATE.GAME_OVER, () => this.#onGameOver());
	}

	start() {
		const navmesh = this.#scene.querySelector("[gltf-model='#navigation-island-navmesh']");
		navmesh.addEventListener("model-loaded", () => new MapGenerator(navmesh).generate());
	}

	#onGameOver() {
		this.#scene.querySelectorAll("a-entity[hostile-entity]").forEach((el) => el.remove());
		// TODO: enhance
	}

	getState() {
		return this.#state;
	}
}
