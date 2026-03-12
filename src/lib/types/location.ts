import type {
  AssetPath,
  Position2D,
  Slug,
  TransitionDirection,
} from './common';
import type { DialogueAction } from './dialogue';

/** Location categories for world areas. */
export type LocationType = 'interior' | 'exterior' | 'transition';

/** An object in a location that the player can interact with. */
export interface InteractiveObject {
  id: string;
  name: string;
  position: Position2D;
  /**
   * Action triggered when the player interacts with this object.
   * Uses the full `ActionType` set — no subset restriction at this time.
   */
  action: DialogueAction;
}

/** A connection between two locations in the world. */
export interface LocationTransition {
  target: Slug;
  position: Position2D;
  direction?: TransitionDirection;
}

/** A defined area in the world — an interior, exterior zone, or transition area. */
export interface Location {
  name: string;
  slug: Slug;
  description: string;
  type: LocationType;
  tileset?: AssetPath;
  characters?: Slug[];
  objects?: InteractiveObject[];
  transitions?: LocationTransition[];
  contentSection?: string;
}
