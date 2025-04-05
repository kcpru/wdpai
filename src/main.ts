import { WC_PREFIX } from "./constants/config";

import "./styles.css";

import MainLayout from "./components/main-layout";
import Button from "./components/button";
import Field from "./components/field";
import CreatePost from "./components/create-post";
import Select from "./components/select";
import Card from "./components/card";
import Icon from "./components/icon";
import Tooltip from "./components/tooltip";
import ToggleTip from "./components/toggle-tip";
import Toast from "./components/toast";
import Post from "./components/post";

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
