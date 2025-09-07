import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";
import { toaster } from "../utils/toaster";
import { render } from "../router/index";

@WC("register-page")
export default class RegisterPage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        :host { display: block; max-width: 400px; margin: 2rem auto; padding: 0 1rem; }
        form { display: flex; flex-direction: column; gap: .75rem; }
        input { padding: .5rem; font-size: 1rem; }
        y-nav-link { margin-right: 1rem; }
        .lede { color: hsl(var(--muted-foreground)); }
  .upload-row { display: flex; align-items: center; gap: var(--spacing-sm); }
  .file-name { font-size: var(--text-xs); color: hsl(var(--muted-foreground)); }
      </style>

      <y-card>
        <div slot="header">
          <y-heading level="1">Create your account</y-heading>
          <p class="lede">A few details and you’re in — build, explore, and make things happen.</p>
        </div>

  <form slot="body" id="register-form" novalidate>

          <y-field id="username" type="text" required regex="^[\\w.-]{3,32}$">
            <span slot="label">Username</span>
            <span slot="helper-text">3–32 characters: letters, digits, dot, dash, or underscore.</span>
            <span slot="error-text">Choose a username 3–32 chars (letters, digits, dot, dash, underscore).</span>
          </y-field>

          <y-field id="password" type="password" required regex="^(?=.*[A-Za-z])(?=.*\\d).{8,}$">
            <span slot="label">Password</span>
            <span slot="helper-text">At least 8 characters and include at least one letter and one number.</span>
            <span slot="error-text">Use at least 8 characters with a letter and a number.</span>
          </y-field>

          <y-field id="confirm" type="password" required>
            <span slot="label">Confirm password</span>
            <span slot="error-text">Passwords must match exactly.</span>
          </y-field>

          <y-field id="avatar" type="url">
            <span slot="label">Avatar URL (optional)</span>
            <span slot="helper-text">Paste a direct image URL or upload a file below.</span>
          </y-field>
          <div class="upload-row">
            <input type="file" id="avatar-file" accept="image/*" hidden />
            <y-button id="pick-file" variant="outline" aria-label="Browse file">
              Browse file
              <y-icon icon="image" slot="icon"></y-icon>
            </y-button>
            <span id="file-name" class="file-name" aria-live="polite"></span>
          </div>

          <y-button aria-label="Create account" id="submit" type="submit">
            Create account
            <y-icon icon="person-add" slot="icon"></y-icon>
          </y-button>
          <div class="error" id="form-error" hidden></div>
        </form>
      </y-card>
    `;

    this.on("form#register-form", "submit", (e) =>
      this.handleSubmit(e as SubmitEvent)
    );

    const touch = () => {
      this.syncConfirmRegex();
      (this.qs("#username") as any)?.validate?.();
      (this.qs("#password") as any)?.validate?.();
      (this.qs("#confirm") as any)?.validate?.();
    };

    this.on("#password", "input", touch);
    this.on("#confirm", "input", touch);
    // username/password fields only for backend API
    this.on("#username", "input", touch);

    this.syncConfirmRegex();

    // Wire styled file picker
    const pickBtn = this.qs<HTMLElement>("#pick-file");
    const fileInput = this.qs<HTMLInputElement>("#avatar-file");
    const fileName = this.qs<HTMLSpanElement>("#file-name");
    pickBtn.addEventListener("click-event" as any, () => fileInput.click());
    fileInput.addEventListener("change", () => {
      const f = fileInput.files?.[0];
      fileName.textContent = f ? f.name : "";
    });
  }

  private escapeRegex(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private syncConfirmRegex() {
    const pass = this.inputValue("#password");
    const confirm = this.qs<HTMLElement>("#confirm");
    confirm.setAttribute("regex", `^${this.escapeRegex(pass)}$`);
    (confirm as any)?.validate?.();
  }

  private inputValue(fieldSelector: string) {
    const host = this.qs<HTMLElement>(fieldSelector);
    const input = host.shadowRoot?.querySelector(
      "input"
    ) as HTMLInputElement | null;
    return input?.value ?? "";
  }

  private async handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const username = this.inputValue("#username").trim();
    const password = this.inputValue("#password");
    const confirm = this.inputValue("#confirm");
    const avatar = this.inputValue("#avatar").trim();
    const fileEl = this.qs<HTMLInputElement>("#avatar-file");
    let avatarDataUrl = avatar;
    if (fileEl?.files && fileEl.files[0]) {
      const { processAvatarImage } = await import("../utils/image-process");
      try {
        avatarDataUrl = await processAvatarImage(fileEl.files[0]);
      } catch {}
    }

    this.syncConfirmRegex();

    const invalid =
      !this.isFieldValid("#username") ||
      !this.isFieldValid("#password") ||
      !this.isFieldValid("#confirm");

    if (invalid || password !== confirm) {
      (this.qs("#form-error") as HTMLElement).textContent =
        "Uzupełnij poprawnie wszystkie pola.";
      this.qs("#form-error").removeAttribute("hidden");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API}/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          avatar: avatarDataUrl || undefined,
        }),
      });

      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).error || "Registration failed"
        );

      this.qs("#form-error").setAttribute("hidden", "");

      // success toast
      toaster.create({
        type: "success",
        title: "Account created",
        description: "Your account has been created successfully.",
      });

      // Always redirect to login after successful registration
      const target = "/login";
      this.emit("navigate", target);
      history.pushState({}, "", target);
      render(location.pathname);
    } catch (err: any) {
      const box = this.qs<HTMLDivElement>("#form-error");
      box.textContent = err?.message ?? "Nie udało się utworzyć konta.";
      box.hidden = false;
    }
  }

  private isFieldValid(sel: string) {
    const host = this.qs<HTMLElement>(sel);
    const group = host.shadowRoot?.querySelector(
      ".group"
    ) as HTMLElement | null;
    return group?.classList.contains("valid") ?? false;
  }
}
