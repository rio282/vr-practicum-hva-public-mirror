import {getRandomNumber} from "@/js/utils/number";
import {AmbientAudio} from "@/aframe/core/utils/audio-utils";
import {DEBUG_MODE} from "@/aframe/settings";

AFRAME.registerComponent("bedroom", {
	init() {
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

		AmbientAudio.start(`#audio-parent_arguing_${getRandomNumber(1, 3)}`, 0.05);
	},

	remove() {
		if (this.container) this.container.remove();
	}
});
