'use strict';

module.exports = function () {
    return {
        index: null,
        id: null,
        tipo:'zona',
        point: null,        // Point location
        water: false,        // lake or ocean
        ocean: false,        // ocean
        coast: false,        // land polygon touching an ocean
        border: false,       // at the edge of the map
        biome: null,          // biome type (see article)
        elevation: null,     // 0.0-1.0
        moisture: null,      // 0.0-1.0

        neighbors: [],    // Vector<Center>
        borders: [],      // Vector<Edge>
        corners: [],       // Vector<Corner>
    };
};