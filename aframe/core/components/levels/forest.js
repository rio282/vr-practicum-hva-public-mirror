import {AmbientAudio} from "@/aframe/core/utils/audio-utils";

AFRAME.registerComponent("forest", {
	init() {
		this.player = this.el.sceneEl.querySelector("#player");
		this.player.querySelector("#playerLight")?.remove();

		this.container = document.createElement("a-entity");
		this.container.innerHTML = `
            <a-entity
                gltf-model="#environment-forest"
                scale="50 50 50"
                position="0 1 0"
            ></a-entity>
        `;

		this.el.appendChild(this.container);

		// start forest audio
		AmbientAudio.start("#audio-nature", 0.2);

		// tweak lights
		this.el.sceneEl.removeAttribute("fog");
		this.el.sceneEl.querySelector("a-sky").setAttribute("color", "#FFFFFF");

		// TODO: fix?
		const ambient = this.el.sceneEl.querySelector('a-light[type="ambient"]');
		ambient.setAttribute("color", "#65C2F5");
		ambient.setAttribute("intensity", 1.25);

		this.addFreedomText();
	},

	addFreedomText() {
		const camera = this.el.sceneEl.querySelector("[camera]");

		this.freedomText = document.createElement("a-entity");
		this.freedomText.setAttribute("text", {
			value: "I've finally been set free...",
			align: "center",
			width: 2.5,
			color: "#222222"
		});

		this.freedomText.setAttribute("position", "0 -0.5 -1");
		this.freedomText.setAttribute("visible", false);
		this.freedomText.setAttribute("text", "opacity", 0);

		setTimeout(() => {
			this.freedomText.setAttribute("visible", true);
			this.freedomText.setAttribute("animation", {
				property: "text.opacity",
				from: 0,
				to: 1,
				dur: 2000,
				easing: "easeOutQuad"
			});
		}, 1500);

		camera.appendChild(this.freedomText);
	},

	remove() {
		if (this.container) this.container.remove();
	}
});
