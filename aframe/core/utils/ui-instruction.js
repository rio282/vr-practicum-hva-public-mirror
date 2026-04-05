AFRAME.registerComponent("ui-instruction", {
	init() {
		this.textEl = document.createElement("a-entity");

		this.textEl.setAttribute("text", {
			value: "",
			align: "center",
			width: 2.5,
			color: "#FFFFFF"
		});

		this.textEl.setAttribute("position", "0 -0.25 -1");
		this.textEl.setAttribute("visible", false);

		this.el.appendChild(this.textEl);

		// listen globally
		this.el.sceneEl.addEventListener("set-instruction", (e) => {
			const {value, visible = true} = e.detail;

			this.textEl.setAttribute("text", "value", value);
			this.textEl.setAttribute("visible", visible);
		});

		this.el.sceneEl.addEventListener("clear-instruction", () => {
			this.textEl.setAttribute("visible", false);
		});
	}
});
