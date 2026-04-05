import {AmbientAudio} from "@/aframe/core/utils/audio-utils";

export const STATE = Object.freeze({
	INITIALIZING: "initializing",
	PLAYING: "playing",
	IN_CUTSCENE: "in-cutscene",
	GAME_OVER: "game-over",
	GAME_WON: "game-won",
	FREE_ROAM: "game-completed",
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
	[STATE.GAME_OVER]: [STATE.PLAYING],
	[STATE.GAME_WON]: [STATE.PLAYING, STATE.FREE_ROAM],
	[STATE.FREE_ROAM]: [],
};

export class GameStateManager {

	#scene;
	#currentLevel;
	#state = STATE.INITIALIZING;

	constructor(scene, startingLevel = LEVELS.HALLWAY) {
		this.#scene = scene;
		this.#currentLevel = startingLevel;

		// TODO: oh god yeah, im so consistent
		this.#scene.addEventListener("change-level", (e) => this.changeLevel(e.detail.level));
		this.#scene.addEventListener("game-over", () => this.setState(STATE.GAME_OVER));
		this.#scene.addEventListener("game-won", () => this.setState(STATE.GAME_WON));
		this.#scene.addEventListener("start-cutscene", () => this.setState(STATE.IN_CUTSCENE));
		this.#scene.addEventListener("end-cutscene", () => this.setState(STATE.PLAYING));
		this.#scene.addEventListener("enter-free-roam", () => this.setState(STATE.FREE_ROAM));
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
		AmbientAudio.stop();
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

			case STATE.FREE_ROAM:
				this.#onGameCompletion();
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

		// aframe gotta realise we're doing allat yk...
		await new Promise(resolve => setTimeout(resolve, 0));
		this.#scene.emit("level-loaded", {level});

		// set player position
		let playerStartingPosition = {x: 0, y: 0, z: 0};
		switch (level) {
			case LEVELS.BEDROOM:
				playerStartingPosition.x = -10;
				playerStartingPosition.z = -7;
				break;
			case LEVELS.KITCHEN:
				playerStartingPosition.x = -1.4;
				playerStartingPosition.z = -4.5;
				break;
			default:
				break;
		}
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

		// restart the level after a short delay to let any effects play out
		AmbientAudio.stop();
		this.loadLevel(this.#currentLevel).then(() => this.setState(STATE.PLAYING));
	}

	#onGameWon() {
		console.debug("Game won");
		this.changeLevel(LEVELS.HALLWAY).then(() => this.setState(STATE.PLAYING));
	}

	#onGameCompletion() {
		console.debug("Game completed");
		this.changeLevel(LEVELS.THE_OUTSIDE).then(() => this.setState(STATE.FREE_ROAM));
	}
}
