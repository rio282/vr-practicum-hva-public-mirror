import {isPlayerNearby} from "@/aframe/core/utils/player-detection.js";
import swipe from "bootstrap/js/src/util/swipe";
import {LEVELS} from "../../managers/gamestate-manager";

AFRAME.registerComponent("hallway", {
	init() {
		this.player = this.el.sceneEl.querySelector("#player");

		this.container = document.createElement("a-entity");
		this.container.innerHTML = `
			<a-entity
				gltf-model="#environment-hallway"
				scale="0.33 0.5 0.33"
				position="0 1.25 0">
			</a-entity>

			<a-box
				position="1 -3 16"
				width="7"
				height="0.05"
				depth="5"
				geometry="primitive: box"
				material="color: red;"
				data-level="${LEVELS.BEDROOM}"
				class="level-trigger">
			</a-box>

			<a-box
				position="1 -3 -27"
				width="7"
				height="0.05"
				depth="5"
				material="color: blue;"
				data-level="${LEVELS.KITCHEN}"
				class="level-trigger">
			</a-box>
		`;

		this.el.appendChild(this.container);

		// set tick rate
		this.tick = AFRAME.utils.throttleTick(this.tick, 1 / 20 * 1000, this);
	},

	tick: function () {
		this.container
			.querySelectorAll(".level-trigger")
			.forEach(lt => {
				if (isPlayerNearby(lt, this.player, 1.5)) this.onChangeLevel(lt.getAttribute("data-level"));
			});
	},

	onChangeLevel(level) {
		let playerStartingPosition = {x: 0, y: 0, z: 0};
		switch (level) {
			case LEVELS.BEDROOM:
				playerStartingPosition.x = -10;
				playerStartingPosition.z = -7;
				break;
			default:
				break;
		}

		this.el.sceneEl.emit("change-level", {
			level,
			playerStartingPosition
		});
	},

	remove() {
		// cleanup listeners + DOM
		if (this.container) {
			const trigger = this.container.querySelector(".level-trigger");
			if (trigger) trigger.removeEventListener("click", this.onChangeLevel);
			this.container.remove();
		}
	}
});
