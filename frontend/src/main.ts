import { WC_PREFIX } from "./constants/config";

import "./styles.css";

import "./router/index";
import { render } from "./router/index";
import { applyAppearanceFromStorage } from "./utils/appearance";

window.addEventListener("DOMContentLoaded", () => {
  applyAppearanceFromStorage();
  render(location.pathname);
});

// Components`
import "./components/layout/main-layout";
import "./components/shared/button";
import "./components/shared/field";
import "./components/shared/create-post";
import "./components/shared/create-post-gate";
import "./components/shared/select";
import "./components/shared/card";
import "./components/shared/icon";
import "./components/shared/tooltip";
import "./components/shared/toggle-tip";
import "./components/shared/toast";
import "./components/shared/confirm";
import "./components/shared/post";
import "./components/layout/profile-layout";
import "./components/shared/avatar";
import "./components/shared/image";
import "./components/shared/separator";
import "./components/shared/heading";
import "./components/shared/tabs";
import "./components/shared/checkbox";
import "./components/shared/emoji-picker";

// import "./image.js"; - lazy loading, zoomable, etc.
// import "./textarea.js";
// import "./checkbox.js";
// import "./radio.js";
// import "./switch.js";
// import "./form.js";
// import "./alert.js";
// import "./modal.js";
// import "./dropdown.js";
// import "./pagination.js";
// import "./table.js";
// import "./popover.js";
// import "./collapse.js";
// import "./carousel.js";
// import "./accordion.js";
// import "./progress.js";
// import "./spinner.js";
// import "./badge.js";
// import "./list-group.js";
