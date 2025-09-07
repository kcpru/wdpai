import { ShadowComponent } from "../../utils/shadow-component";
import { toaster } from "../../utils/toaster";
import { WC } from "../../utils/wc";
import { processPostImage } from "../../utils/image-process";

@WC("create-post")
export default class CreatePost extends ShadowComponent {
  constructor() {
    super();
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
          <y-button variant="ghost" icon-only aria-label="${text}" data-action="${icon}">
            <y-icon icon="${icon}" slot="icon"></y-icon>
          </y-button>
        </y-tooltip>
      `
      )
      .join("");

    this.html`
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
          width: var(--sm); /* fixed content width */
        }
        .prompt {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-md);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          background: hsl(var(--secondary));
          border: 1px dashed hsl(var(--border));
        }
        .prompt p { color: hsl(var(--muted-foreground)); margin: 0; }
        .prompt .actions { display: flex; gap: var(--spacing-sm); }
        form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        .editor-box {
          position: relative;
        }
        .editor-box.dragging #content {
          outline: 2px dashed hsl(var(--border));
          outline-offset: -2px;
          background-color: color-mix(in oklab, hsl(var(--secondary)) 90%, hsl(var(--secondary-foreground)) 10%);
        }
        #editor[aria-disabled="true"] {
          opacity: .6;
          filter: grayscale(.1);
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
          overflow-wrap: anywhere;
          word-break: break-word;
          position: relative; /* anchor ::after hint */
        }
        #content::after {
          content: attr(data-dndhint);
          position: absolute;
          inset: auto 0 .5rem 0;
          text-align: center;
          color: hsl(var(--muted-foreground));
          font-size: var(--text-xs);
          pointer-events: none;
          opacity: 0;
          transition: opacity .15s ease;
        }
        .editor-box.dragging #content::after { opacity: 1; }
        .counter {
          position: absolute;
          right: .625rem; /* ~10px */
          bottom: .5rem;  /* ~8px */
          font-size: var(--text-xs);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          user-select: none;
        }
        .previews {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: .375rem;
          margin-top: .5rem;
        }
        .tile {
          position: relative;
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius-md);
          overflow: hidden;
          background: hsl(var(--secondary));
          aspect-ratio: 1 / 1; /* square tiles */
        }
        .tile img { display: block; width: 100%; height: 100%; object-fit: cover; }
        .remove {
          position: absolute;
          top: .25rem; right: .25rem;
          width: 24px; height: 24px;
          border-radius: 999px;
          background: rgba(0,0,0,.5);
          color: white;
          display: grid; place-items: center;
          cursor: pointer;
          border: none;
        }
        .remove:focus-visible { outline: none; box-shadow: var(--shadow-outline); }
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

  <form id="editor" aria-disabled="false">
        <div class="editor-box">
          <div contenteditable="true" id="content" data-placeholder="What's happening?" data-dndhint="Drop images to attach"></div>
          <span id="counter" class="counter">0/1000</span>
        </div>
        <div class="previews" id="previews" aria-live="polite" aria-atomic="true"></div>
        <input type="file" id="file-input" accept="image/*" multiple hidden />
        <div class="footer">
          <div class="actions">${actionButtons}</div>
          <y-button id="post" type="button" variant="primary" disabled>Post</y-button>
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

  async connectedCallback() {
    // Assumes authenticated user; gating is handled by <y-create-post-gate>
    let authedState = true;

    const contentEl = this.qs<HTMLDivElement>("#content");
    const postBtn = this.qs<HTMLElement>("#post");
    const counter = this.qs<HTMLSpanElement>("#counter");
    const fileInput = this.qs<HTMLInputElement>("#file-input");
    const previews = this.qs<HTMLDivElement>("#previews");
    const MAX = 1000;
    const MAX_IMAGES = 4;
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    let posting = false;
    let images: Array<{ url: string; dataUrl?: string; file: File }> = [];
    let pendingReads: Promise<void>[] = [];

    const text = () => (contentEl.innerText || "").replace(/\s+/g, " ").trim();

    const updateState = () => {
      const t = text();
      const len = t.length;
      if (counter) counter.textContent = `${len}/${MAX}`;
      if (len > MAX) {
        contentEl.innerText = t.slice(0, MAX);
        placeCaretAtEnd(contentEl);
      }
      if (postBtn)
        postBtn.toggleAttribute(
          "disabled",
          posting || !authedState || (len === 0 && images.length === 0)
        );
    };

    const placeCaretAtEnd = (el: HTMLElement) => {
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    };

    // Enable/disable button on input
    contentEl.addEventListener("input", updateState);
    contentEl.addEventListener("keyup", updateState);
    contentEl.addEventListener("paste", (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain") || "";
      document.execCommand("insertText", false, text);
      updateState();
    });
    // Ctrl+Enter to post
    contentEl.addEventListener("keydown", (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "Enter" &&
        !postBtn?.hasAttribute("disabled")
      ) {
        e.preventDefault();
        postBtn?.dispatchEvent(
          new CustomEvent("click-event", { bubbles: true })
        );
      }
    });

    // Drag & Drop handlers
    const box = this.qs<HTMLElement>(".editor-box");
    const setDragging = (v: boolean) => box.classList.toggle("dragging", v);
    const prevent = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    ["dragenter", "dragover"].forEach((t) =>
      box.addEventListener(t, (e) => {
        prevent(e);
        setDragging(true);
      })
    );
    ["dragleave", "drop"].forEach((t) =>
      box.addEventListener(t, (e) => {
        prevent(e);
        if (t !== "drop") setDragging(false);
      })
    );
    box.addEventListener("drop", (e: DragEvent) => {
      setDragging(false);
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length) addFiles(files);
    });

    // Action buttons: trigger file input on image icon
    this.qsa<HTMLElement>(".actions y-button").forEach((btn) => {
      btn.addEventListener("click-event" as any, () => {
        if (btn.getAttribute("data-action") === "image") fileInput.click();
      });
    });

    fileInput.addEventListener("change", () => {
      const files = Array.from(fileInput.files || []);
      if (files.length) addFiles(files);
      fileInput.value = "";
    });

    async function toCompressedDataURL(file: File) {
      try {
        return await processPostImage(file);
      } catch {
        // fallback to original data URL
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error("read_error"));
          reader.onload = () => resolve(String(reader.result || ""));
          reader.readAsDataURL(file);
        });
      }
    }

    const updatePreviews = () => {
      previews.innerHTML = "";
      images.forEach((img, idx) => {
        const tile = document.createElement("div");
        tile.className = "tile";
        const image = document.createElement("img");
        image.src = img.url;
        image.alt = "preview";
        const remove = document.createElement("button");
        remove.className = "remove";
        remove.type = "button";
        remove.setAttribute("aria-label", "Remove image");
        remove.textContent = "×";
        remove.addEventListener("click", () => removeImage(idx));
        tile.appendChild(image);
        tile.appendChild(remove);
        previews.appendChild(tile);
      });
    };

    const removeImage = (idx: number) => {
      const img = images[idx];
      if (!img) return;
      URL.revokeObjectURL(img.url);
      images.splice(idx, 1);
      updatePreviews();
      updateState();
    };

    const addFiles = (files: File[]) => {
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > MAX_SIZE) {
          toaster.create({
            title: "Image too large",
            description: "Each image must be under 5MB",
            type: "error",
          });
          continue;
        }
        if (images.length >= MAX_IMAGES) {
          toaster.create({
            title: "Too many images",
            description: `You can attach up to ${MAX_IMAGES} images`,
            type: "error",
          });
          break;
        }
        const url = URL.createObjectURL(file);
        const rec = { url, file, dataUrl: undefined as string | undefined };
        images.push(rec);
        pendingReads.push(
          toCompressedDataURL(file)
            .then((d) => {
              rec.dataUrl = d;
            })
            .catch(() => {})
        );
      }
      updatePreviews();
      updateState();
    };

    // Initial state
    updateState();

    postBtn?.addEventListener("click-event" as any, async () => {
      const content = text();
      if (!content && images.length === 0) {
        toaster.create({
          title: "Empty post",
          description: "Please enter some content or add images",
          type: "error",
        });
        return;
      }

      const create = async () => {
        try {
          posting = true;
          updateState();
          contentEl.setAttribute("contenteditable", "false");
          // Ensure all images have data URLs ready
          if (pendingReads.length) {
            await Promise.allSettled(pendingReads);
            pendingReads = [];
          }
          const resp = await fetch(import.meta.env.VITE_API + "/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              content,
              images: images.map((i) => i.dataUrl || ""),
            }),
          });
          if (!resp.ok) throw new Error("failed");
          const data = await resp.json();
          // clear input
          contentEl.innerText = "";
          images.forEach((i) => URL.revokeObjectURL(i.url));
          images = [];
          updatePreviews();
          // emit event for parent lists
          this.dispatchEvent(
            new CustomEvent("post-created", {
              detail: data.post,
              bubbles: true,
              composed: true,
            })
          );
        } finally {
          posting = false;
          contentEl.setAttribute("contenteditable", "true");
          updateState();
        }
      };

      toaster.promise(create(), {
        loading: { title: "Posting…", description: "Please wait" },
        success: { title: "Posted", description: "Your post is live" },
        error: { title: "Error", description: "Could not create post" },
        duration: 4000,
      });
    });
  }
}
