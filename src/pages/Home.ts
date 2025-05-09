import { WC_PREFIX } from "../constants/config";
import { ShadowComponent } from "../utils/shadow-component";

export default class Home extends ShadowComponent {
  constructor() {
    super();

    const posts = [
      {
        text: "Exploring the forest today 🌲",
        images: [
          "https://picsum.photos/id/1011/400/300",
          "https://picsum.photos/id/1012/400/300",
        ],
      },
      {
        text: "Just finished a 10k run! 🏃‍♂️",
        images: [],
      },
      {
        text: "Throwback to last summer ☀️",
        images: ["https://picsum.photos/id/1015/400/300"],
      },
      {
        text: "Anyone up for a coffee?",
        images: [],
      },
    ];

    this.html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: calc(2 * var(--spacing-xl));
        }
      </style>

      <y-create-post></y-create-post>

      ${posts
        .map(
          (post) =>
            `<y-post text="${post.text}" images='${JSON.stringify(post.images)}'></y-post>`
        )
        .join("")}
    `;
  }
}

customElements.define(`${WC_PREFIX}-home-page`, Home);
