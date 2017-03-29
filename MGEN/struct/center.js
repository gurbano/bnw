'use strict';

module.exports = function () {
    return {
        index: null,
        id: null,
        tipo:'zona',
        point: null,        // Point location
        water: null,        // lake or ocean
        ocean: null,        // ocean
        coast: null,        // land polygon touching an ocean
        border: null,       // at the edge of the map
        biome: null,          // biome type (see article)
        elevation: null,     // 0.0-1.0
        moisture: null,      // 0.0-1.0

        neighbors: [],    // Vector<Center>
        borders: [],      // Vector<Edge>
        corners: [],       // Vector<Corner>
    };
};