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
		if (!soundComponent || !soundComponent.data) return;

		if (soundComponent.data.volume === volume) return;

		this.#ambienceEl.setAttribute("sound", "volume", volume);
	}

	static getVolume() {
		if (!this.#ambienceEl) return;
		return this.#ambienceEl.components.sound.data.volume;
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

export function speakText(text, options = {}) {
	const utterance = new SpeechSynthesisUtterance(text);

	// optional tweaks
	if (options.voice) utterance.voice = options.voice;
	if (options.rate) utterance.rate = options.rate ?? 1;
	if (options.pitch) utterance.pitch = options.pitch ?? 1;
	if (options.volume) utterance.volume = options.volume ?? 1;

	window.speechSynthesis.speak(utterance);

	return new Promise(resolve => {
		utterance.onend = resolve;
	});
}

export function getVoice(namePart) {
	const voices = window.speechSynthesis.getVoices();
	return voices.find(v => v.name.includes(namePart));
}
