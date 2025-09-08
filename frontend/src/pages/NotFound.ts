import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";
import { render } from "../router/index";

@WC(`not-found`)
export default class NotFound extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        :host { display:block; }
        .wrap { width:100%; display:flex; align-items:center; justify-content:center; }
        .card { max-width: 100%; background: hsl(var(--card)); color: hsl(var(--card-foreground)); border: 1px solid hsl(var(--border)); border-radius: var(--radius-xl); padding: var(--spacing-xl); text-align: center; box-shadow: var(--shadow-md); }
        .mark { font-size: clamp(4rem, 12vw, 8rem); line-height: 1; font-weight: var(--font-black, 900); letter-spacing: -0.04em; display:inline-block; }
        .y { color: hsl(var(--primary)); filter: drop-shadow(0 6px 24px hsl(var(--primary) / .25)); }
        .oops { margin: .5rem 0 0; font-size: var(--text-lg); color: hsl(var(--muted-foreground)); }
        .lede { margin: .25rem 0 0; color: hsl(var(--muted-foreground)); }
        .actions { margin-top: var(--spacing-lg); display:flex; gap: var(--spacing-sm); justify-content:center; }
      </style>
      <div class="wrap">
        <div class="card" role="alert" aria-live="polite">
          <div class="mark y">Y</div>
          <div class="oops">404 — Why tho?</div>
          <p class="lede">This corner of Y doesn’t exist. Maybe it migrated from the bird site.</p>
          <div class="actions">
            <y-button id="go-home" variant="outline" aria-label="Go home">
              Take me home
              <y-icon icon="home" slot="icon"></y-icon>
            </y-button>
            <y-button id="report" variant="ghost" aria-label="Report issue">
              Report a hiccup
              <y-icon icon="info" slot="icon"></y-icon>
            </y-button>
          </div>
        </div>
      </div>
    `;

    this.on("#go-home", "click-event" as any, () => {
      history.pushState({}, "", "/");
      render(location.pathname);
    });
    this.on("#report", "click-event" as any, () => {
      // lightweight fallback: just go home for now
      history.pushState({}, "", "/");
      render(location.pathname);
    });
  }
}
