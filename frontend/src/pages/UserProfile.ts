import { WC_PREFIX } from "../constants/config";
import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";

@WC(`user-profile-page`)
export default class UserProfile extends ShadowComponent {
  constructor() {
    super();

    this.html`
      <style>
        h1 {
          color: blue;
        }
      </style>
      <h1>User Profile Page</h1>
      <y-route-outlet></y-route-outlet>
    `;
  }
}
