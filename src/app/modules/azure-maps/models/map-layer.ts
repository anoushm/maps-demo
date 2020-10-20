import * as atlas from 'azure-maps-control';

export interface MapLayer {
  add(map: atlas.Map): Promise<void>;
  remove(map: atlas.Map): Promise<void>;
}
