/* jshint bitwise:false */

'use strict';

var core = {
    // Return value or default if undefined.
    // Usefull for assigning argument default values.
    def: function (value, defaultValue) {
        return _.isUndefined(value) ? defaultValue : value;
    },

    toInt: function (something) {
        return something | 0;
    },

    // Return first argument that is not undefined and not null.
    coalesce: function () {
        return _.find(arguments, function (arg) {
            return !_.isNull(arg) && !_.isUndefined(arg);
        });
    },

    isUndefinedOrNull: function (thing) {
        return _.isUndefined(thing) || _.isNull(thing);
    }
};
var _ = require('lodash');

/**
 * Two dimensional array functions.
 */
module.exports = function (array) {
    array = core.def(array, []);
    return {

        value: array,

         /**
         * Get value at index.
         */
        get: function (x, y) {
            if (_(array[y]).isUndefined()) {
                return null;
            }
            return array[y][x];
        },

        /**
         * Set value at index.
         */
        set: function (x, y, value) {
            array[y] = core.def(array[y], []);
            array[y][x] = value;
            return array;
        },

        /**
         * Iterate rows.
         * @param  {function} returnRow
         */
        foreachY: function (returnRow) {
            _(array).each(function (y) {
                if (!_(y).isUndefined()) {
                    returnRow(y);
                }
            });
        },

        /**
         * Iterate cells.
         * @param  {function} returnXYAndValue
         */
        foreachXY: function (returnXYAndValue) {
            var yIndex;
            for (yIndex = 0; yIndex < array.length; yIndex++) {
                if (!_(array[yIndex]).isUndefined()) {
                    var xIndex;
                    for (xIndex = 0; xIndex < array[yIndex].length; xIndex++) {
                        if (!_(array[yIndex][xIndex]).isUndefined()) {
                            var value = array[yIndex][xIndex];
                            if (value !== null) {
                                returnXYAndValue(xIndex, yIndex, value);
                            }
                        }
                    }
                }
            }
        },

        /**
         * Find index of anything in array.
         * @param  {function} testValue Function should return true for match, else false.
         */
        any: function (testValue) {
            var yIndex;
            for (yIndex = 0; yIndex < array.length; yIndex++) {
                if (!_(array[yIndex]).isUndefined()) {
                    var xIndex;
                    for (xIndex = 0; xIndex < array[yIndex].length; xIndex++) {
                        if (!_(array[yIndex][xIndex]).isUndefined()) {
                            var value = array[yIndex][xIndex];
                            if (value !== null) {
                                if (testValue(value)) {
                                    return {x: xIndex, y: yIndex };
                                }
                            }
                        }
                    }
                }
            }
            return null;
        },

        /**
         * Get dimensions of array.
         * @return {object} x is width, y is height
         */
        dimensions: function () {
            var height = array.length;
            var width = 0;
            
            this.foreachY(function (y) {
                width = Math.max(width, y.length);
            });

            return {x: width, y: height};
        }
    };
};

/**
 * Compute two dimensional indices of a flat index based on array width and block size.
 * @param {int} index
 * @param {int} width
 * @param {int} blockSize
 */
module.exports.getIndices = function (index, width, blockSize) {
    blockSize = blockSize || 1;
    return {
        x : (index / blockSize) % width,
        y : core.toInt((index / blockSize) / width)
    };
};