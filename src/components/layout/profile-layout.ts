import { ShadowComponent } from "../../utils/shadow-component";

export default class ProfileLayout extends ShadowComponent {
  constructor() {
    super();

    this.html`
			<style>
				:host {
					box-sizing: border-box;
					display: flex;
					justify-items: center;
					align-items: center;
					flex-direction: column;
					gap: var(--spacing-lg);
				}
				
				slot[name="banner"] {
					overflow: hidden;
					display: block;
					width: 100%;
					background-color: hsl(var(--card));
					border-radius: var(--radius-lg);
					border: 1px solid hsl(var(--border));
					position: relative;
				}
				
				slot[name="content"] {
					display: block;
					width: 100%;
					max-width: var(--sm);
				}
			</style>
			
			<slot name="banner"></slot>
			<slot name="content"></slot>
		`;
  }
}
