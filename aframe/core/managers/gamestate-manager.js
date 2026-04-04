export const STATE = Object.freeze({
	INITIALIZING: "initializing",
	PLAYING: "playing",
	IN_CUTSCENE: "in-cutscene",
	GAME_OVER: "game-over",
	GAME_WON: "game-completed",
});

export const LEVELS = Object.freeze({
	HALLWAY: "hallway",
	BEDROOM: "bedroom",
	KITCHEN: "kitchen",
	THE_OUTSIDE: "forest",
});

const VALID_TRANSITIONS = {
	[STATE.INITIALIZING]: [STATE.PLAYING],
	[STATE.PLAYING]: [STATE.IN_CUTSCENE, STATE.GAME_OVER, STATE.GAME_WON],
	[STATE.IN_CUTSCENE]: [STATE.PLAYING],
	[STATE.GAME_OVER]: [],
	[STATE.GAME_WON]: [],
};

export class GameStateManager {

	#scene;
	#currentLevel;
	#state = STATE.INITIALIZING;

	constructor(scene, startingLevel = LEVELS.HALLWAY) {
		this.#scene = scene;
		this.#currentLevel = startingLevel;

		this.#scene.addEventListener("change-level", (e) => this.changeLevel(e.detail.level));
		this.#scene.addEventListener("game-over", () => this.setState(STATE.GAME_OVER));
		this.#scene.addEventListener("game-won", () => this.setState(STATE.GAME_WON));
		this.#scene.addEventListener("start-cutscene", () => this.setState(STATE.IN_CUTSCENE));
		this.#scene.addEventListener("end-cutscene", () => this.setState(STATE.PLAYING));
	}

	async start() {
		this.setState(STATE.INITIALIZING);
		await this.loadLevel(this.#currentLevel);
		this.setState(STATE.PLAYING);
	}

	getState() {
		return this.#state;
	}

	getCurrentLevel() {
		return this.#currentLevel;
	}

	async changeLevel(newLevel) {
		if (newLevel === this.#currentLevel) return;
		await this.loadLevel(newLevel);
	}

	setState(newState) {
		if (this.#state === newState) return;

		const allowed = VALID_TRANSITIONS[this.#state] || [];
		if (!allowed.includes(newState)) {
			console.warn(`Invalid transition: ${this.#state} -> ${newState}`);
			return;
		}

		const prevState = this.#state;
		this.#state = newState;

		console.debug(`State change: ${prevState} -> ${newState}`);
		this.#handleStateChange(prevState, newState);

		// broadcast globally (aframe pattern)
		this.#scene.emit("state-changed", {
			from: prevState,
			to: newState
		});
	}

	#handleStateChange(prev, next) {
		switch (next) {
			case STATE.INITIALIZING:
				this.#onInitializing();
				break;

			case STATE.PLAYING:
				this.#onStartPlaying();
				break;

			case STATE.IN_CUTSCENE:
				this.#onCutsceneStart();
				break;

			case STATE.GAME_OVER:
				this.#onGameOver();
				break;

			case STATE.GAME_WON:
				this.#onGameWon();
				break;
		}
	}

	async loadLevel(level) {
		console.debug(`Loading level: ${level}`);
		const levelRoot = this.#getOrCreateLevelRoot();

		// remove all known level components
		Object.values(LEVELS).forEach(lvl => levelRoot.removeAttribute(lvl));

		this.#currentLevel = level;
		levelRoot.setAttribute(level, "");

		await new Promise(resolve => setTimeout(resolve, 0));
		this.#scene.emit("level-loaded", { level });
	}

	#getOrCreateLevelRoot() {
		let root = this.#scene.querySelector("#level-root");

		if (!root) {
			root = document.createElement("a-entity");
			root.setAttribute("id", "level-root");
			this.#scene.appendChild(root);
		}

		return root;
	}

	#unloadCurrentLevel() {
		const existing = this.#scene.querySelectorAll("[data-level]");
		existing.forEach(el => el.remove());
	}

	async #spawnLevelEntities(level) {
		const container = document.createElement("a-entity");
		container.setAttribute("data-level", level);

		switch (level) {
			case LEVELS.HALLWAY:
				container.innerHTML = `
					<a-box position="0 1 -3" color="#4CC3D9"></a-box>
				`;
				break;

			case LEVELS.BEDROOM:
				container.innerHTML = `
					<a-sphere position="0 1.25 -3" radius="1.25" color="#EF2D5E"></a-sphere>
				`;
				break;

			case LEVELS.KITCHEN:
				container.innerHTML = `
					<a-cylinder position="0 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
				`;
				break;

			case LEVELS.THE_OUTSIDE:
				container.innerHTML = `
					<a-plane rotation="-90 0 0" width="20" height="20" color="#7BC8A4"></a-plane>
				`;
				break;
		}

		this.#scene.appendChild(container);

		// ensure aframe parses it
		await new Promise(resolve => setTimeout(resolve, 0));
	}

	#onInitializing() {
		console.debug("Initializing game...");
	}

	#onStartPlaying() {
		console.debug("Gameplay active");
		this.#scene.emit("enable-controls");
	}

	#onCutsceneStart() {
		console.debug("Cutscene started");
		this.#scene.emit("disable-controls");
	}

	#onGameOver() {
		console.debug("Game over");

		this.#scene.emit("disable-controls");
		this.#scene.emit("show-game-over");
	}

	#onGameWon() {
		console.debug("Game completed");

		this.#scene.emit("disable-controls");
		this.#scene.emit("show-victory");
	}
}
