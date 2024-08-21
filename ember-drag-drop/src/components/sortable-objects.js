/* eslint-disable ember/no-classic-classes, ember/no-classic-components, ember/no-component-lifecycle-hooks, ember/no-get, ember/require-super-in-lifecycle-hooks, ember/require-tagless-components, prettier/prettier */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SortableObjects extends Component {
  @service dragCoordinator

  @tracked sortableObjectList = A()

  get enableSort() {
    return this.args.enableSort ?? true;
  }
  
  get useSwap() {
    return this.args.useSwap ?? true;
  }

  get inPlace() {
    return this.args.inPlace ?? false;
  }

  // get sortingScope() {
  //   return this.args.sortingScope ?? 'drag-objects';
  // }

  @tracked sortingScope = this.args.sortingScope ?? 'drag-objects'

  @action
  initComp() {
    this.sortableObjectList = this.args.sortableObjectList ?? A()
    if (this.enableSort) {
      this.dragCoordinator.pushSortComponent(this);
    }
  }

  @action
  destroy() {
    if (this.enableSort) {
      this.dragCoordinator.removeSortComponent(this);
    }
  }

  @action
  dragStart(event) {
    event.stopPropagation();
    if (!this.enableSort) {
      return false;
    }

    this.dragCoordinator.sortComponentController = this;
  }

  @action
  dragEnter(event) {
    //needed so drop event will fire
    event.stopPropagation();
    event.preventDefault();
    return false;
  }

  @action
  dragOver(event) {
    //needed so drop event will fire
    event.stopPropagation();
    event.preventDefault();
    return false;
  }

  @action
  drop(event) {
    event.stopPropagation();
    event.preventDefault();
    this.dragCoordinator.sortComponentController = undefined;
    if (this.enableSort && this.args.sortEndAction) {
      this.args.sortEndAction(event);
    }
  }
}
