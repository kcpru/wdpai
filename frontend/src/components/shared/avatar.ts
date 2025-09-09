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
    let url = src || "";
    if (url && !/^https?:\/\//i.test(url) && !/^data:/i.test(url)) {
      // Treat as API-relative path (e.g., /uploads/avatars/..)
      const base = (import.meta as any).env?.VITE_API || "";
      url = base.replace(/\/$/, "") + (url.startsWith("/") ? url : "/" + url);
    }
    avatarElement.style.backgroundImage = url ? `url(${url})` : "none";
  }
}
