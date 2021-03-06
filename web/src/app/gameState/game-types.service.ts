import {Injectable} from '@angular/core';
import {CompiledEnum, CompiledMember, CompiledStruct} from '@pwootage/bstruct/lib/BCompiler_JSON';
import {MemoryOffset, MemoryView} from './MemoryView';
import * as PrimeDefs from '../../assets/prime-defs.json';

export interface GameDefs {
  enums: CompiledEnum[];
  structs: CompiledStruct[];
}

type MemoryStruct = CompiledStruct & { type: 'struct' };
type MemoryEnum = CompiledEnum & { type: 'enum' };

interface MemoryPrimitive {
  type: 'primitive';
  size: number;
  name: string;
  read(view: MemoryView, offset: MemoryOffset): number;
}

export type MemoryObject = MemoryStruct | MemoryPrimitive | MemoryEnum;

export class MemoryObjectInstance {
  offset: MemoryOffset;
  obj: MemoryObject;
}

const PRIMITIVE_TYPES: MemoryPrimitive[] = [
  {type: 'primitive', name: 'bool', size: 1, read: (view: MemoryView, offset: MemoryOffset) =>  view.s8(offset)},
  {type: 'primitive', name: 'i8', size: 1, read: (view: MemoryView, offset: MemoryOffset) =>  view.s8(offset)},
  {type: 'primitive', name: 'i16', size: 2, read: (view: MemoryView, offset: MemoryOffset) =>  view.s16(offset)},
  {type: 'primitive', name: 'i32', size: 4, read: (view: MemoryView, offset: MemoryOffset) =>  view.s32(offset)},
  // {type: 'primitive', name: 'i64', size: 8, readFn: (view: MemoryView, offset: MemoryOffset) =>  view.s64(offset)},
  {type: 'primitive', name: 'u8', size: 1, read: (view: MemoryView, offset: MemoryOffset) =>  view.u8(offset)},
  {type: 'primitive', name: 'u16', size: 2, read: (view: MemoryView, offset: MemoryOffset) =>  view.u16(offset)},
  {type: 'primitive', name: 'u32', size: 4, read: (view: MemoryView, offset: MemoryOffset) =>  view.u32(offset)},
  // {type: 'primitive', name: 'u64', size: 8, readFn: (view: MemoryView, offset: MemoryOffset) =>  view.s64(offset)},
  {type: 'primitive', name: 'f32', size: 4, read: (view: MemoryView, offset: MemoryOffset) =>  view.f32(offset)},
  {type: 'primitive', name: 'f64', size: 4, read: (view: MemoryView, offset: MemoryOffset) =>  view.f64(offset)},
];

@Injectable({
  providedIn: 'root'
})
export class GameTypesService {
  types: GameDefs;
  table = new Map<string, MemoryObject>();
  vtable = new Map<number, MemoryObject>();

  constructor() {
    this.types = PrimeDefs;
    for (const s of PrimeDefs.structs) {
      this.table.set(s.name, {type: 'struct', ...s});
      if (s.vtable) {
        this.vtable.set(s.vtable, {type: 'struct', ...s});
      }
    }
    for (const e of PrimeDefs.enums) {
      this.table.set(e.name, {type: 'enum', ...e});
    }
    for (const p of PRIMITIVE_TYPES) {
      this.table.set(p.name, p);
    }
  }

  lookup(name: string): MemoryObject | null {
    return this.table.get(name);
  }

  lookupVtable(vtable: number): MemoryObject | null {
    return this.vtable.get(vtable);
  }

  lookupMember(obj: MemoryObject, member: string): CompiledMember | null {
    // const type = this.table.get(name);
    // if (!type) {
    //   return null;
    // }
    if (obj.type !== 'struct') {
      return null;
    }
    return obj.members.find(v => v.name === member) || null;
  }
}
