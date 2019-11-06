// See https://cameronjs.com/stimulus for more info

import { Controller } from "stimulus";

export default class extends Controller {
  static get targets() {
    return ["code"];
  }

  copy(event) {
    event.preventDefault();
    const targetEl = event.target;

    this.codeTargets.forEach(target => {
      if (target.dataset.id === targetEl.dataset.targetId) {
        this.copyContent(target);
      }
    });
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
