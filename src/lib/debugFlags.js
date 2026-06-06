// Diagnostic URL flags. Append e.g. ?nomesh=1 to disable a system
// and isolate which one is driving GPU/CPU load.
const params = typeof window === 'undefined'
  ? new URLSearchParams()
  : new URLSearchParams(window.location.search);

const flag = (name) => params.get(name) === '1';

const bare = flag('bare');

export const debugFlags = {
  // ?bare=1 disables everything below at once
  noMesh:   bare || flag('nomesh'),
  noGrain:  bare || flag('nograin'),
  noCursor: bare || flag('nocursor'),
  noVideos: bare || flag('novideos'),
  debug:    flag('debug'),
  // ?mesh=full|css|loader|off — picks the Mesh implementation
  meshVariant: params.get('mesh') || 'full',
};
