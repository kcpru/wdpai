import { toaster } from "../utlis/toaster";

export default class CreatePost extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const actions = [
      { icon: "image", text: "Add image" },
      { icon: "video", text: "Add video" },
      { icon: "link", text: "Add link" },
      { icon: "emoji", text: "Add emoji" },
      { icon: "poll", text: "Create poll" },
      { icon: "location", text: "Add location" },
    ];

    const actionButtons = actions
      .map(
        ({ icon, text }) => `
        <y-tooltip text="${text}">
          <y-button variant="ghost" icon-only aria-label="${text}">
            <y-icon icon="${icon}" slot="icon"></y-icon>
          </y-button>
        </y-tooltip>
      `,
      )
      .join("");

    this.shadowRoot.innerHTML = `
      <style>
        :host {
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
        }
        #content {
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

      <form>
        <div contenteditable="true" id="content" data-placeholder="What's happening?"></div>
        <div class="footer">
        	<div class="actions">${actionButtons}</div>
        	<y-button id="post" variant="primary" disabled>Post</y-button>
        </div>
      </form>
    `;
  }

  postPromise() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const isSuccess = Math.random() > 0.5;
        if (isSuccess) {
          resolve("Post created successfully");
        } else {
          reject("Error creating post");
        }
      }, 2000);
    });
  }

  connectedCallback() {
    this.shadowRoot.getElementById("post")?.addEventListener("click", () => {
      const content = this.shadowRoot.getElementById("content")?.innerText;
      if (!content) {
        toaster.create({
          title: "Error",
          description: "Please enter some content",
          type: "error",
        });
        return;
      }

      toaster.create({
        title: "Please wait",
        description: "Posting...",
        type: "loading",
      });

      this.postPromise()
        .then(() => {
          toaster.create({
            title: "Success",
            description: "Post created successfully",
            type: "success",
          });
        })
        .catch(() => {
          toaster.create({
            title: "Error",
            description: "There was an error creating the post",
            type: "error",
          });
        });
    });
  }
}
