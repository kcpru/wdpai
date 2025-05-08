import { ShadowComponent } from "../../utils/shadow-component";

export default class Post extends ShadowComponent {
  constructor() {
    super();

    this.html`
			<style>
				:host {
					box-sizing: border-box;
					display: block;
					padding: var(--spacing-md);
					background-color: hsl(var(--card));
					color: hsl(var(--card-foreground));
					border-radius: var(--radius-lg);
					border: 1px solid hsl(var(--border));
          width: 100%;
          max-width: var(--sm);
				}
			
				.header {
					display: flex;
					align-items: center;
					gap: var(--spacing-sm);
				}
				
				#avatar {
					width: 2rem;
					height: 2rem;
					border-radius: 50%;
					background-color: hsl(var(--avatar));
				}
				#username {
					font-size: var(--text-lg);
					font-weight: var(--font-semibold);
					color: hsl(var(--foreground));
				}
				#timestamp {
					font-size: var(--text-sm);
					color: hsl(var(--secondary));
				}
				#content {
					margin-top: var(--spacing-md);
					font-size: var(--text-lg);
					color: hsl(var(--foreground));
				}
				#actions {
					display: flex;
					margin-top: var(--spacing-md);
				}
				</style>
				<div class="header">
					<y-avatar src="https://fastly.picsum.photos/id/866/200/300.jpg"></y-avatar>
					<div id="username">Username</div>
					<div id="timestamp">Timestamp</div>
				</div>
				
				<div id="content">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
					Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
					Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
				</div>
				
				<div id="actions">
          <y-tooltip text="Like" position="bottom">
            <y-button variant="ghost" aria-label="Like">
              <y-icon icon="heart" slot="icon"></y-icon>
              17.3k
            </y-button>
					</y-tooltip>  
					
					<y-tooltip text="See comments" position="bottom">
            <y-button variant="ghost" aria-label="Comments">
              <y-icon icon="comments" slot="icon"></y-icon>
              386
            </y-button>
					</y-tooltip>
					
					<y-tooltip text="Share" position="bottom">
            <y-button variant="ghost" icon-only aria-label="Share">
              <y-icon icon="share" slot="icon"></y-icon>
            </y-button>
					</y-tooltip>
					
					<y-tooltip text="Save" position="bottom">
            <y-button variant="ghost" icon-only aria-label="Save">
              <y-icon icon="bookmark" slot="icon"></y-icon>
            </y-button>
					</y-tooltip>
				</div>
			`;
  }
}
