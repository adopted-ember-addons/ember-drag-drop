/* eslint-disable ember/no-actions-hash, ember/no-classic-classes, ember/no-classic-components, ember/no-component-lifecycle-hooks, ember/no-get, ember/no-incorrect-calls-with-inline-anonymous-functions, ember/require-super-in-lifecycle-hooks, ember/require-tagless-components, import/extensions, prettier/prettier */
import { getOwner } from '@ember/application';
import Component from '@glimmer/component';
import { inject as service} from '@ember/service';
import { action } from '@ember/object';
import { scheduleOnce, next } from '@ember/runloop';
import { set } from '@ember/object';
import { wrapper } from '../utils/proxy-unproxy-objects';
import { tracked } from '@glimmer/tracking';

export default class DraggableObject extends Component {
  @service dragCoordinator

  @tracked isDraggable = true
  @tracked dragReady = true

  @tracked isDraggingObject = false

  get title() {
    return this.args.content.title;
  }

  get isSortable() { 
    return this.args.isSortable ?? false;
  }

  get sortingScope() {
    return this.args.sortingScope ?? 'drag-objects';
  }

  // idea taken from https://github.com/emberjs/rfcs/blob/master/text/0680-implicit-injection-deprecation.md#stage-1
  get coordinator() {
    if (this._coordinator === undefined) {
      this._coordinator = getOwner(this).lookup('drag:coordinator');
    }

    return this._coordinator;
  }

  set coordinator(value) {
    this._coordinator = value;
  }

  get draggable() {
    return this.args.isDraggable ?? true;
  }

get proxyContent() {
    return wrapper(this.args.content);
  }

  constructor() {
    super(...arguments);
    if (this.args.dragHandle) {
      this.dragReady = false;
    }

    this.mouseOverHandler = function() {
      this.dragReady = true;
    }.bind(this);
    this.mouseOutHandler = function() {
      this.dragReady = false;
    }.bind(this);

  }

  @action
  insert() {
    scheduleOnce('afterRender', () => {
      //if there is a drag handle watch the mouse up and down events to trigger if drag is allowed
      let dragHandle = this.args.dragHandle;
      if (dragHandle) {
        //only start when drag handle is activated
        if (document.querySelector(dragHandle)) {
          document.querySelector(dragHandle).addEventListener('mouseover', this.mouseOverHandler);
          document.querySelector(dragHandle).addEventListener('mouseout', this.mouseOutHandler);
        }
      }
    });
  }

  @action
  destroy(){
    let dragHandle = this.args.dragHandle;
    if (document.querySelector(dragHandle)) {
      document.querySelector(dragHandle).removeEventListener('mouseover', this.mouseOverHandler);
      document.querySelector(dragHandle).removeEventListener('mouseout', this.mouseOutHandler);
    }
  }


  @action
  dragStart(event) {
    if (!this.isDraggable || !this.dragReady) {
      event.preventDefault();
      return;
    }

    let dataTransfer = event.dataTransfer;

    let obj = this.proxyContent;
    let id = null;
    let coordinator = this.coordinator;
    if (coordinator) {
       id = coordinator.setObject(obj, { source: this });
    }

    dataTransfer.setData('Text', id);

    if (obj && typeof obj === 'object') {
      set(obj, 'isDraggingObject', true);
    }
    this.isDraggingObject = true;
    if (!this.dragCoordinator.enableSort && this.dragCoordinator.sortComponentController) {
      //disable drag if sorting is disabled this is not used for regular
      event.preventDefault();
      return;
    } else {
      next(()=> {
        this.dragStartHook(event);
      });
      this.dragCoordinator.dragStarted(obj, event, this);
    }

    if( this.args.dragStartAction) {
      this.args.dragStartAction(obj, event);
    }

    if (this.args.isSortable && this.draggingSortItem) {
      this.draggingSortItem(obj, event);
    }
  }

  @action
  dragEnd(event) {
    if (!this.isDraggingObject) {
      return;
    }

    let obj = this.proxyContent;

    if (obj && typeof obj === 'object') {
      set(obj, 'isDraggingObject', false);
    }
    this.isDraggingObject = false;
    this.dragEndHook(event);
    this.dragCoordinator.dragEnded();
    if(this.args.dragEndAction) {
      this.args.dragEndAction(obj, event);
    }
    if (this.args.dragHandle) {
      this.dragReady = false;
    }
  }

  @action
  drag(event) {
    if(this.args.dragMoveAction) {
      this.args.dragMoveAction(event);
    }
  }

  @action
  dragOver(event) {

   if (this.args.isSortable) {

     this.dragCoordinator.draggingOver(event, this);
   }
    return false;
  }

  dragStartHook(event) {
    if(this.args.dragStartHook) {
      this.args.dragStartHook(event);
    } else {
      event.target.style.opacity = '0.5';
    }
  }

  dragEndHook(event) {
    if(this.args.dragEndHook) {
      this.args.dragEndHook(event);
    } else {
      event.target.style.opacity = '1';
    }
  }

  @action
  drop(event) {
    //Firefox is navigating to a url on drop, this prevents that from happening
    event.preventDefault();
  }

  @action
  selectForDrag() {
    let obj = this.proxyContent;
    let hashId = this.coordinator.setObject(obj, { source: this });
    this.coordinator.clickedId = hashId;
  }

}
