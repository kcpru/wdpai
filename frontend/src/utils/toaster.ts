import { WC_PREFIX } from "../constants/config";

export const toaster = {
  toasts: [] as HTMLElement[],

  create: (options: {
    description?: string;
    title?: string;
    type?: "info" | "success" | "error" | "warning" | "loading";
    duration?: number;
  }) => {
    const { description, title, type, duration = 5000 } = options;

    const toast = document.createElement(`${WC_PREFIX}-toast`);
    toast.setAttribute("description", description || "");
    toast.setAttribute("title", title || "");
    toast.setAttribute("type", type || "info");

    document.body.appendChild(toast);

    toaster.toasts.push(toast);

    const offset = toaster.toasts.length * 70;
    toast.style.bottom = `${offset + 20}px`;

    setTimeout(() => {
      toaster.removeToast(toast);
    }, duration);
  },

  removeToast: (toast: HTMLElement) => {
    const index = toaster.toasts.indexOf(toast);
    if (index !== -1) {
      toaster.toasts.splice(index, 1);
      document.body.removeChild(toast);
      toaster.repositionToasts();
    }
  },

  repositionToasts: () => {
    toaster.toasts.forEach((toast, index) => {
      const offset = (index + 1) * 70;
      toast.style.bottom = `${offset + 20}px`;
    });
  },

  promise: (
    promise: Promise<void>,
    options: {
      success?: { title?: string; description?: string };
      error?: { title?: string; description?: string };
      loading?: { title?: string; description?: string };
    }
  ) => {
    const { success, error, loading } = options;

    const toast = document.createElement(`${WC_PREFIX}-toast`);
    toast.setAttribute("type", "loading");
    toast.setAttribute("description", loading?.description || "");
    toast.setAttribute("title", loading?.title || "");

    document.body.appendChild(toast);
    toaster.toasts.push(toast);

    const offset = toaster.toasts.length * 70;
    toast.style.bottom = `${offset + 20}px`;

    promise
      .then(() => {
        toast.setAttribute("type", "success");
        toast.setAttribute("description", success?.description || "");
        toast.setAttribute("title", success?.title || "");
        setTimeout(() => toaster.removeToast(toast), 3000); // Zniknięcie po 3 sekundach
      })
      .catch(() => {
        toast.setAttribute("type", "error");
        toast.setAttribute("description", error?.description || "");
        toast.setAttribute("title", error?.title || "");
        setTimeout(() => toaster.removeToast(toast), 3000); // Zniknięcie po 3 sekundach
      });
  },
};
