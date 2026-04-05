import {getRandomNumber} from "@/js/utils/number";
import {isPlayerInBounds} from "@/aframe/core/utils/player-detection";
import {AmbientAudio} from "@/aframe/core/utils/audio-utils";
import {DEBUG_MODE} from "@/aframe/settings";

AFRAME.registerComponent("bedroom", {
	defaultAudioVolume: 0.175,
	audioRelaxFactor: 0.2,  // lower is better
	lightRelaxFactor: 1.1,  // higher is better

	init() {
		// environment setup
		this.player = this.el.sceneEl.querySelector("#player");
		this.playerLight = this.player.querySelector("#playerLight");
		this.defaultLight = {...this.playerLight?.getAttribute("light")};

		this.container = document.createElement("a-entity");
		this.container.innerHTML = `
			<a-entity
				gltf-model="#environment-bedroom"
				scale="7 7 7"
				position="0 6 0"
			></a-entity>

			<a-box
				data-zone-order="0"
				position="-12.1 0.85 -2.8"
				width="7.33"
				height="0.05"
				depth="16"
				geometry="primitive: box"
				material="color: red;"
				visible="${DEBUG_MODE}"
				class="safe-zone">
			</a-box>

			<a-box
				data-zone-order="1"
				position="11.89 0.85 17.67"
				width="1.75"
				height="0.05"
				depth="5.67"
				geometry="primitive: box"
				material="color: red;"
				visible="${DEBUG_MODE}"
				class="safe-zone">
			</a-box>
		`;

		this.el.appendChild(this.container);

		AmbientAudio.start(`#audio-parent_arguing_${getRandomNumber(1, 3)}`, this.defaultAudioVolume);

		// vars
		this.currentSafeZone = null;

		// set tick rate
		this.tick = AFRAME.utils.throttleTick(this.tick, 1 / 20 * 1000, this);
	},

	tick: function () {
		let wasInSafeZone = this.isInSafeZone;
		let isInSafeZone = false;

		this.container.querySelectorAll(".safe-zone").forEach(sz => {
			if (isPlayerInBounds(sz, this.player)) {
				this.currentSafeZone = sz;
				isInSafeZone = true;
			}
		});

		// only trigger on change
		if (wasInSafeZone !== isInSafeZone) {
			this.isInSafeZone = isInSafeZone;

			if (isInSafeZone) this.onEnterSafeZone();
			else this.onExitSafeZone();
		}
	},

	onEnterSafeZone() {
		AmbientAudio.setVolume(this.defaultAudioVolume * this.audioRelaxFactor);

		if (!this.playerLight) return;

		let light = this.playerLight.getAttribute("light");
		light.intensity = this.defaultLight.intensity * (this.lightRelaxFactor * 2.22);
		light.angle = this.defaultLight.angle * this.lightRelaxFactor;
		light.distance = this.defaultLight.distance * (this.lightRelaxFactor * 2);

		this.el.sceneEl.emit("update-player-light-base-values", light);
	},

	onExitSafeZone() {
		AmbientAudio.setVolume(this.defaultAudioVolume);
		this.el.sceneEl.emit("update-player-light-base-values", this.defaultLight);
	},

	remove() {
		if (this.container) this.container.remove();
	}
});
