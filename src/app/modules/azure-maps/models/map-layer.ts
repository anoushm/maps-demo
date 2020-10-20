import atlas from "azure-maps-control";

export interface MapLayer {
  add(map: atlas.Map);
  remove(map: atlas.Map);
}
