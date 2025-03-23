class CreatePost extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          padding: var(--spacing-md);
          box-shadow: var(--shadow-md);
          gap: var(--spacing-md);
          background: hsl(var(--card));
          color: hsl(var(--card-foreground));
          border-radius: var(--radius-xl);
        }
        form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        h1 {
          font-size: var(--text-xl);
          font-weight: var(--font-semibold);
          padding: 0;
          margin: 0;
        }
        #content {
          padding: var(--spacing-md);
          border: 1px solid #ced4da;
          border-radius: 5px;
          width: calc(100% - 2 * var(--spacing-md));
        }
        #content:focus-visible {
          box-shadow: var(--shadow-outline);
          outline: none;
        }
      </style>

      <h1>Create a new post</h1>
      <form>
        <div contenteditable="true" id="content" name="content" required></div>
        <button-component variant="primary">Post</button-component>
      </form>
    `;
  }
}

customElements.define("create-post", CreatePost);
