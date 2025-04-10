export default class ProfileLayout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
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
