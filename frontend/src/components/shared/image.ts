import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("image")
export default class Image extends ShadowComponent {
  static observedAttributes = ["src", "alt"];

  src = "";
  alt = "";

  constructor() {
    super();
  }

  connectedCallback() {
    this.parseAttributes();
    this.render();
    this.on("img", "click", () => this.openModal());
    document.addEventListener("keydown", this.handleKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  attributeChangedCallback() {
    this.parseAttributes();
    this.render();
  }

  parseAttributes() {
    this.src = this.attr("src") ?? "";
    this.alt = this.attr("alt") ?? "";
  }

  render() {
    this.html`
      <style>
        :host {
          display: block;
          cursor: pointer;
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        img {
          width: 100%;
          height: auto;
          object-fit: cover;
          border-radius: inherit;
          transition: transform 0.2s ease;
        }

        img:hover {
          transform: scale(1.02);
        }

        .modal {
          position: fixed;
          inset: 0;
          display: none;
          justify-content: center;
          align-items: center;
          background: rgba(0, 0, 0, 0.75);
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }

        .modal.open {
          display: flex;
          opacity: 1;
          pointer-events: all;
        }

        .modal img {
          max-width: 90vw;
          max-height: 90vh;
          border-radius: var(--radius-md);
          animation: zoomIn 0.2s ease;
        }

        @keyframes zoomIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      </style>

      <img src="${this.src}" alt="${this.alt}" loading="lazy" />

      <div id="modal" class="modal">
        <div id="modal-bg" style="position: absolute; inset: 0;"></div>
        <img src="${this.src}" alt="${this.alt}" />
      </div>
    `;

    this.on("#modal-bg", "click", () => this.closeModal());
  }

  openModal() {
    this.qs("#modal").classList.add("open");
  }

  closeModal() {
    this.qs("#modal").classList.remove("open");
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") this.closeModal();
  };
}
