import {MemoryObjectInstance} from '../gameState/game-types.service';
import {RenderService} from './render.service';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import NAMES from '../../assets/editor_names.json';
import {RenderObject} from './RenderObject';

export abstract class RenderObjectEntity extends RenderObject {
  readonly uniqueID: number;
  readonly editorID: number;
  readonly name: string;

  nameText: GUI.TextBlock;

  constructor(
    public entity: MemoryObjectInstance,
    render: RenderService
  ) {
    super();
    const entitySuper = render.state.getSuper(entity, 'CEntity');
    const gameState = render.state.getMember(render.state.globalObjects, 'gameState');
    const world = render.state.readPrimitiveMember(gameState, 'mlvlID');

    this.uniqueID = render.state.readPrimitiveMember(entitySuper, 'uniqueID');
    this.editorID = render.state.readPrimitiveMember(entitySuper, 'editorID');
    this.name = render.state.readString(render.state.getMember(entitySuper, 'name'));

    const names = NAMES;
    const worldNames = NAMES[world] || {};

    this.nameText = new GUI.TextBlock();
    const prettyName = worldNames[this.editorID] || this.name || this.editorID.toString(16);
    this.nameText.text = prettyName + '\n' + this.entity.obj.name;
    this.nameText.color = 'white';
    this.nameText.outlineColor = 'black';
    this.nameText.outlineWidth = 2;
    render.gui.addControl(this.nameText);

    this.nameText.isVisible = false;
  }

  abstract update(render: RenderService, entity: MemoryObjectInstance);

  onPick(render: RenderService) {
    render.state.selectedEntity.next(this.entity);
  }

  dispose(): void {
    super.dispose();
    this.nameText.dispose();
    this.nameText = null;
  }
}

export class ROEntityUnknown extends RenderObjectEntity {
  constructor(entity: MemoryObjectInstance, render: RenderService) {
    super(entity, render);
  }

  dispose(): void {
    super.dispose();
  }

  update(render: RenderService, entity: MemoryObjectInstance) {
  }
}
