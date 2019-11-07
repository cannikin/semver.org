// See https://cameronjs.com/stimulus for more info

import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    for (let el of document.getElementsByTagName("code")) {
      if (el.parentElement.nodeName === "PRE") {
        let container = el.parentElement.parentElement;
        let link = document.createElement("a");

        link.href = "#";
        link.classList.add("block", "text-right", "text-sm");
        link.dataset.action = "click->application#copy";
        link.textContent = "Copy to Clipboard";
        container.appendChild(link);
      }
    }
  }

  copy(event) {
    event.preventDefault();
    this.copyContent(event.target.previousSibling.previousSibling.children[0]);
  }

  copyContent(target) {
    const range = document.createRange();
    window.getSelection().removeAllRanges();
    range.selectNode(target);
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
  }
}
