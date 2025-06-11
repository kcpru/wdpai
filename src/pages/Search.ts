import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";

/* ─────────── fake backend ─────────── */

type Post = { id: string; title: string; body: string };

const WORDS = [
  "apple",
  "banana",
  "carrot",
  "docker",
  "elephant",
  "framework",
  "golang",
  "haskell",
  "island",
  "javascript",
  "kotlin",
  "lua",
  "music",
  "network",
  "openai",
  "python",
  "query",
  "react",
  "security",
];

function fetchSuggestions(q: string, signal: AbortSignal): Promise<string[]> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      const term = q.toLowerCase();
      const res = WORDS.filter((w) => w.startsWith(term) && term).slice(0, 5);
      resolve(res);
    }, 150);
    signal.addEventListener("abort", () => clearTimeout(timer));
  });
}

function fetchPosts(q: string): Promise<Post[]> {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(
        Array.from({ length: 8 }, (_, i) => ({
          id: `${q}-${i}`,
          title: `${q} result #${i + 1}`,
          body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque porttitor.",
        }))
      );
    }, 350)
  );
}

/* ─────────── component ─────────── */

@WC("search-page")
export default class SearchPage extends ShadowComponent {
  private abortSugg?: AbortController;

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  /* ---------- render ---------- */
  private render() {
    this.html`
      <style>
        :host {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          padding: 1rem;
          box-sizing: border-box;
        }
        .box {
          width: 100%;
          max-width: 480px;
          text-align: center;
        }
        input[type="search"] {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border: 2px solid #ccc;
          border-radius: 1.5rem;
          outline: none;
          transition: border-color 0.2s ease;
        }
        input[type="search"]:focus {
          border-color: #0077ff;
        }
        ul.suggestions {
          list-style: none;
          margin: 0.25rem 0 0;
          padding: 0;
          border: 1px solid #ddd;
          border-radius: 0.5rem;
          background: #fff;
          max-height: 200px;
          overflow-y: auto;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        ul.suggestions[hidden] {
          display: none;
        }
        ul.suggestions li {
          padding: 0.5rem 1rem;
          cursor: pointer;
        }
        ul.suggestions li:hover,
        ul.suggestions li:focus {
          background: #f5faff;
        }
        .results {
          margin-top: 2rem;
          text-align: left;
        }
        .post {
          border: 1px solid #eee;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        .post h3 {
          margin: 0 0 0.5rem;
        }
      </style>

      <div class="box">
        <input type="search" id="input" placeholder="Type to search…" autocomplete="off" />
        <ul class="suggestions" id="sugg" hidden></ul>
        <div class="results" id="res"></div>
      </div>
    `;
  }

  /* ---------- events ---------- */
  private bindEvents() {
    this.on("#input", "input", () => this.handleInput());
    this.on("#input", "keydown", (e) => {
      if (e.key === "Enter")
        this.search(this.qs<HTMLInputElement>("#input").value);
    });
  }

  private async handleInput() {
    const q = this.qs<HTMLInputElement>("#input").value.trim();
    if (!q) return this.hideSuggestions();

    // cancel previous
    this.abortSugg?.abort();
    this.abortSugg = new AbortController();

    const sugg = await fetchSuggestions(q, this.abortSugg.signal);
    if (this.abortSugg.signal.aborted) return;
    this.showSuggestions(sugg);
  }

  /* ---------- suggestions ---------- */
  private showSuggestions(list: string[]) {
    const UL = this.qs<HTMLUListElement>("#sugg");
    if (!list.length) return this.hideSuggestions();

    UL.innerHTML = "";
    list.forEach((word) => {
      const li = document.createElement("li");
      li.textContent = word;
      li.tabIndex = 0;
      li.addEventListener("click", () => this.search(word));
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.search(word);
      });
      UL.appendChild(li);
    });
    UL.hidden = false;
  }

  private hideSuggestions() {
    const UL = this.qs<HTMLUListElement>("#sugg");
    UL.hidden = true;
    UL.innerHTML = "";
  }

  /* ---------- search ---------- */
  private async search(q: string) {
    const term = q.trim();
    if (!term) return;

    const input = this.qs<HTMLInputElement>("#input");
    input.value = term;
    this.hideSuggestions();

    const resBox = this.qs<HTMLDivElement>("#res");
    resBox.textContent = "Loading…";

    const posts = await fetchPosts(term);

    resBox.innerHTML = "";
    posts.forEach((p) => {
      const card = document.createElement("div");
      card.className = "post";

      const h = document.createElement("h3");
      h.textContent = p.title;
      card.appendChild(h);

      const body = document.createElement("p");
      body.textContent = p.body;
      card.appendChild(body);

      resBox.appendChild(card);
    });
  }
}
