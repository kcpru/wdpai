import { WC_PREFIX } from "../constants/config";

export const WC =
  (localName: string, prefix = WC_PREFIX) =>
  <T extends CustomElementConstructor>(ctor: T) => {
    const tag = `${prefix}-${localName}`;
    if (!customElements.get(tag)) customElements.define(tag, ctor);
  };
