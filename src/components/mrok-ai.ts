export default class MrokAi extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const actions = [
      { icon: "image", text: "Add image" },
      { icon: "video", text: "Add video" },
      { icon: "link", text: "Add link" },
      { icon: "more", text: "Add link" },
    ];

    const actionButtons = actions
      .map(
        ({ icon, text }) => `
        <y-button variant="ghost" icon-only aria-label="${text}" disabled>
          <y-icon icon="${icon}" slot="icon"></y-icon>
        </y-button>
      `,
      )
      .join("");

    this.shadowRoot.innerHTML = `
			<style>
				:host {
					box-sizing: border-box;
					width: 100%;
				}
				
				#banner {
				  position: relative;
          box-sizing: border-box;
          background: radial-gradient(hsl(var(--card-foreground) / 0.05) 2px, transparent 2px), radial-gradient(hsl(var(--card-foreground) / 0.05) 2px, transparent 2px), linear-gradient(45deg, #EB3DFF30 0%, transparent 30%, transparent 70%, #3530d030 100%);;
          background-size: 32px 32px, 32px 32px, 100% 100%, 100% 100%;
          background-position: 0 0, 16px 16px, 0 0, 0 0;
					animation: noise 10s infinite linear;
					z-index: 0;
					animation: background-move 1s infinite linear;
				}
				
				@keyframes background-move {
				  0% {
            background-position: 0 0, 16px 16px, 0 0, 0 0;
          }
          100% {
            background-position: 16px 16px, 32px 32px, 0 0, 0 0;
          }
        }
				
				.banner {
					display: flex;
					flex-direction: column;
					justify-items: center;
					align-items: center;
					font-weight: var(--font-semibold);
          padding: 5rem 0;
				}
				
				.title {
          display: flex;
          align-items: center;
          justify-items: center;
          gap: var(--spacing-md);
				}
				
				.title y-icon {
          background: -webkit-linear-gradient(45deg, #ce4646, #d77449);
          border-radius: var(--radius-xl);
          width: 5rem;
          height: 5rem;
          padding: var(--spacing-xs);
          color: hsl(var(--background));
				}
				
				.title span {
					font-size: 6rem;
					font-weight: var(--font-bold);
          background: -webkit-linear-gradient(45deg, #c9573f, #3530d0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
				}
				
				.title span {
				  text-shadow: 1rem 1rem 5rem #3530d080, -1rem -1rem 5rem #c9573f80;
				}
				
				.subtitle {
				  margin: 0;
				  font-size: var(--text-xl);
				  opacity: 0.8; 
				}
				
				#content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
				}
				
				.info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-xs);
          color: hsl(var(--muted-foreground));
				}
				
        .prompt {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          padding: var(--spacing-md);
          gap: var(--spacing-md);
          background: hsl(var(--card));
          color: hsl(var(--card-foreground));
          border-radius: var(--radius-lg);
          border: 1px solid hsl(var(--border));
          width: 100%;
          max-width: var(--sm);
        }
        form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          opacity: 0.5;
        }
        .textarea {
          box-sizing: border-box;
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          width: 100%;
          min-height: 5rem;
          max-height: 15rem;
        	font-size: var(--text-xl);
          border: 1px solid hsl(var(--border));
          background-color: hsl(var(--secondary));
          transition: height 1s ease;
          overflow-y: auto;
        }
        [contenteditable=true]:empty:before{
          content: attr(data-placeholder);
          pointer-events: none;
          display: block; 
          color: hsl(var(--muted-foreground));
        }
        #content:focus-visible {
          box-shadow: var(--shadow-outline);
          outline: none;
        }
        .footer {
          display: flex;
          justify-content: space-between;
        }
        .actions {
        	display: flex;
				}
			  
			</style>
			
			<y-profile-layout>
				<div slot="banner" id="banner">
					<section class="banner">
            <div class="title">
              <y-icon icon="light-bulb"></y-icon>
              <span>Mrok AI</span>
            </div>
            
            <p class="subtitle">
              The light of the <u>universe</u> is in your hands.
            </p>
					</section>
				</div>
				
				<div slot="content" id="content">
				  <div class="info">
				    <y-icon icon="info"></y-icon>
            <p>Currently not available in your country.</p>
				  </div>
				
				  <div class="prompt" inert>
            <form>
              <div contenteditable="true" class="textarea" data-placeholder="Ask anything"></div>
              
              <div class="footer">
                <div class="actions">${actionButtons}</div>
                <y-button id="post" variant="primary" disabled>Send</y-button>
              </div>
            </form>
				  </div>
				</div>
			</y-profile-layout>
		`;
  }
}
