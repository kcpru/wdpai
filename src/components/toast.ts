export default class Toast extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 9999;
          display: flex;
          flex-direction: column-reverse;
          gap: var(--spacing-lg);
        }
        .toast {
          background-color: hsl(var(--secondary));
          color: white;
          padding: var(--spacing-lg);
          border-radius: var(--radius-md);
          transition: all 0.9s ease-in-out;
          opacity: 0;
          transform: translateY(10px);
        }
        .toast.show {
          opacity: 1;
          transform: translateY(0);
        }}
      </style>
      <div class="toast">
        <h4 id="title"></h4>
        <p id="description"></p>
      </div>
    `;
  }

  connectedCallback() {
    this.render();
    this.showToast();
  }

  render() {
    const title = this.getAttribute("title");
    const description = this.getAttribute("description");
    const type = this.getAttribute("type");

    (this.shadowRoot.querySelector("#title") as HTMLElement).innerText = title;
    (this.shadowRoot.querySelector("#description") as HTMLElement).innerText =
      description;

    const toastElement = this.shadowRoot.querySelector(".toast") as HTMLElement;

    if (type === "success") {
      toastElement.style.backgroundColor = "green";
    } else if (type === "error") {
      toastElement.style.backgroundColor = "red";
    } else if (type === "warning") {
      toastElement.style.backgroundColor = "yellow";
    }
  }

  showToast() {
    const toastElement = this.shadowRoot.querySelector(".toast") as HTMLElement;
    setTimeout(() => {
      toastElement.classList.add("show");
    }, 50);
    setTimeout(() => {
      this.removeToast();
    }, 5000);
  }

  removeToast() {
    const toastElement = this.shadowRoot.querySelector(".toast") as HTMLElement;
    toastElement.classList.add("hide");
    console.log("removing toast");
    setTimeout(() => {
      console.log("toast removed");
      // this.remove();
    }, 1000);
  }
}
