// --background: 0 0% 100%;
// --foreground: 222.2 84% 4.9%;
// --card: 0 0% 100%;
// --card-foreground: 222.2 84% 4.9%;
// --popover: 0 0% 100%;
// --popover-foreground: 222.2 84% 4.9%;
// --primary: 221.2 83.2% 53.3%;
// --primary-foreground: 210 40% 98%;
// --secondary: 210 40% 96.1%;
// --secondary-foreground: 222.2 47.4% 11.2%;
// --muted: 210 40% 96.1%;
// --muted-foreground: 215.4 16.3% 46.9%;
// --accent: 210 40% 96.1%;
// --accent-foreground: 222.2 47.4% 11.2%;
// --destructive: 0 84.2% 60.2%;
// --destructive-foreground: 210 40% 98%;
// --border: 214.3 31.8% 91.4%;
// --input: 214.3 31.8% 91.4%;
// --ring: 221.2 83.2% 53.3%;
// --radius: 0.75rem;

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
          font-size: 24px;
          margin-bottom: 16px;
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
