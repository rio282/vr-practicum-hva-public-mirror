export class AmbientAudio {

	static #ambienceEl;

	static start(soundId, volume = 0.15, loop = true) {
		if (this.#ambienceEl) return;

		this.#ambienceEl = document.createElement("a-entity");

		this.#ambienceEl.setAttribute("sound", {
			src: soundId,
			autoplay: true,
			loop: loop,
			positional: false,
			volume
		});

		document.querySelector("a-scene").appendChild(this.#ambienceEl);
	}

	static setVolume(volume) {
		if (!this.#ambienceEl) return;
		const soundComponent = this.#ambienceEl.components.sound;
		if (soundComponent) {
			soundComponent.data.volume = volume;
			soundComponent.update();
		}
	}

	static stop() {
		if (!this.#ambienceEl) return;
		this.#ambienceEl.components.sound.stopSound();
		this.#ambienceEl.parentNode.removeChild(this.#ambienceEl);
		this.#ambienceEl = null;
	}
}

export function playSoundOnEntity(el, itemId, options = {}) {
	// no element given, or invalid
	if (!el) return;

	// check if the sound id exists
	const audioId = `audio-${itemId.replace("#", "")}`;
	if (!Array.from(document.querySelectorAll("audio")).map(_el => _el.id).includes(audioId)) return;

	const {
		volume = 1,
		loop = false,
		autoplay = false,
		positional = true
	} = options;

	// if sound component already exists -> just update & play
	if (el.components.sound) {
		el.setAttribute("sound", {
			src: `#${audioId}`,
			volume,
			loop,
			positional
		});
		el.components.sound.playSound();
		return;
	}

	// otherwise create it ig...
	el.setAttribute("sound", {
		src: `#${audioId}`,
		autoplay,
		loop,
		volume,
		positional
	});

	// ensure it plays immediately
	el.addEventListener("sound-loaded", () => el.components.sound.playSound(), {once: true});
}
