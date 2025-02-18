import { run } from '@ember/runloop';
import c from './helpers/data-transfer.js';

/* eslint-disable prettier/prettier */
/* global triggerEvent , andThen */
function drop($dragHandle, dropCssPath, dragEvent) {
  let dropTarget = document.querySelector(dropCssPath);
  if (dropTarget.length === 0) {
    throw new Error(`There are no drop targets by the given selector: '${dropCssPath}'`);
  }
  run(() => {
    triggerEvent(dropTarget, 'dragover', c.makeMockEvent());
  });
  run(() => {
    triggerEvent(dropTarget, 'drop', c.makeMockEvent(dragEvent.dataTransfer.get('data.payload')));
  });
  run(() => {
    triggerEvent($dragHandle, 'dragend', c.makeMockEvent());
  });
}
function drag(cssPath, options = {}) {
  let dragEvent = c.makeMockEvent();
  let dragHandle = document.querySelector(cssPath);
  run(() => {
    triggerEvent(dragHandle, 'mouseover');
  });
  run(() => {
    triggerEvent(dragHandle, 'dragstart', dragEvent);
  });
  andThen(function () {
    if (options.beforeDrop) {
      options.beforeDrop.call();
    }
  });
  andThen(function () {
    if (options.drop) {
      drop(dragHandle, options.drop, dragEvent);
    }
  });
}

export { drag };
//# sourceMappingURL=ember-drag-drop.js.map
