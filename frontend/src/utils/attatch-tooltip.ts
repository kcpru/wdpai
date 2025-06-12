export function attachTooltip(
  target: Element,
  text: string,
  position: string = "top"
) {
  const wrapper = document.createElement("tooltip-component");
  wrapper.setAttribute("text", text);
  wrapper.setAttribute("position", position);

  target.replaceWith(wrapper);
  wrapper.appendChild(target);
}
