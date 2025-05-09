import { WC_PREFIX } from "./constants/config";

import "./styles.css";

import "./router";
import { render } from "./router";

window.addEventListener("DOMContentLoaded", () => {
  render(location.pathname);
});

import MainLayout from "./components/layout/main-layout";
import Button from "./components/shared/button";
import Field from "./components/shared/field";
import CreatePost from "./components/shared/create-post";
import Select from "./components/shared/select";
import Card from "./components/shared/card";
import Icon from "./components/shared/icon";
import Tooltip from "./components/shared/tooltip";
import ToggleTip from "./components/shared/toggle-tip";
import Toast from "./components/shared/toast";
import Post from "./components/shared/post";
import ProfileLayout from "./components/layout/profile-layout";
import Avatar from "./components/shared/avatar";

customElements.define(`${WC_PREFIX}-main-layout`, MainLayout);
customElements.define(`${WC_PREFIX}-button`, Button);
customElements.define(`${WC_PREFIX}-field`, Field);
customElements.define(`${WC_PREFIX}-create-post`, CreatePost);
customElements.define(`${WC_PREFIX}-select`, Select);
customElements.define(`${WC_PREFIX}-card`, Card);
customElements.define(`${WC_PREFIX}-icon`, Icon);
customElements.define(`${WC_PREFIX}-tooltip`, Tooltip);
customElements.define(`${WC_PREFIX}-toggle-tip`, ToggleTip);
customElements.define(`${WC_PREFIX}-toast`, Toast);
customElements.define(`${WC_PREFIX}-post`, Post);
customElements.define(`${WC_PREFIX}-profile-layout`, ProfileLayout);
customElements.define(`${WC_PREFIX}-avatar`, Avatar);

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
