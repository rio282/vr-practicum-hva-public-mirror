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

		this.#scene.addEventListener("change-level", (e) => this.changeLevel(
			e.detail.level,
			e.detail.playerStartingPosition ?? {x: 0, y: 0, z: 0}
		));
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

	async changeLevel(newLevel, playerStartingPosition = {x: 0, y: 0, z: 0}) {
		if (newLevel === this.#currentLevel) return;
		await this.loadLevel(newLevel, playerStartingPosition);
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

	async loadLevel(level, playerStartingPosition = {x: 0, y: 0, z: 0}) {
		console.debug(`Loading level: ${level}`);
		const levelRoot = this.#getOrCreateLevelRoot();

		// remove all known level components
		Object.values(LEVELS).forEach(lvl => levelRoot.removeAttribute(lvl));

		this.#currentLevel = level;
		levelRoot.setAttribute(level, "");

		// aframe gotta realise we're doing allat yk...
		await new Promise(resolve => setTimeout(resolve, 0));
		this.#scene.emit("level-loaded", {level});

		// reset player position
		this.#scene.querySelector("#player").setAttribute("position", `${playerStartingPosition.x} ${playerStartingPosition.y} ${playerStartingPosition.z}`);
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
