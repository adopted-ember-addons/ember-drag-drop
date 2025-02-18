import Component, { setComponentTemplate } from '@ember/component';
import { inject } from '@ember/service';
import { A } from '@ember/array';
import { precompileTemplate } from '@ember/template-compilation';

var TEMPLATE = precompileTemplate("{{! template-lint-disable no-yield-only }}\n{{yield}}");

/* eslint-disable ember/no-classic-classes, ember/no-classic-components, ember/no-component-lifecycle-hooks, ember/no-get, ember/require-super-in-lifecycle-hooks, ember/require-tagless-components, prettier/prettier */
var sortableObjects = setComponentTemplate(TEMPLATE, Component.extend({
  dragCoordinator: inject('drag-coordinator'),
  overrideClass: 'sortable-objects',
  classNameBindings: ['overrideClass'],
  enableSort: true,
  useSwap: true,
  inPlace: false,
  sortingScope: 'drag-objects',
  sortableObjectList: A(),
  init() {
    this._super(...arguments);
    if (this.get('enableSort')) {
      this.get('dragCoordinator').pushSortComponent(this);
    }
  },
  willDestroyElement() {
    if (this.get('enableSort')) {
      this.get('dragCoordinator').removeSortComponent(this);
    }
  },
  dragStart(event) {
    event.stopPropagation();
    if (!this.get('enableSort')) {
      return false;
    }
    this.set('dragCoordinator.sortComponentController', this);
  },
  dragEnter(event) {
    //needed so drop event will fire
    event.stopPropagation();
    return false;
  },
  dragOver(event) {
    //needed so drop event will fire
    event.stopPropagation();
    return false;
  },
  drop(event) {
    event.stopPropagation();
    event.preventDefault();
    this.set('dragCoordinator.sortComponentController', undefined);
    if (this.get('enableSort') && this.get('sortEndAction')) {
      this.get('sortEndAction')(event);
    }
  }
}));

export { sortableObjects as default };
//# sourceMappingURL=sortable-objects.js.map
