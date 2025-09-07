import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("avatar")
export default class Avatar extends ShadowComponent {
  constructor() {
    super();

    this.html`
			<style>
				:host {
				  --avatar-size: 2rem;
				  background-color: hsl(var(--foreground));
					border-radius: var(--radius-full);
					box-sizing: border-box;
					display: block;
					width: var(--avatar-size);
					height: var(--avatar-size);
				}
        #avatar {
          width: 100%;
          height: 100%;
          border-radius: inherit;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
			</style>

			<div id="avatar"></div>
		`;
  }

  static get observedAttributes() {
    return ["src", "alt"];
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === "src") this.renderAvatar(newValue);
  }

  renderAvatar(src: string) {
    const avatarElement = this.qs<HTMLDivElement>("#avatar");
    avatarElement.style.backgroundImage = `url(${src})`;
  }
}
