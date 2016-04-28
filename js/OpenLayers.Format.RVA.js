/**
 * Class: OpenLayers.Format.RVA
 *
 * Inherits from:
 *  - <OpenLayers.Format.JSON>
 */
OpenLayers.Format.RVA = OpenLayers.Class(OpenLayers.Format.JSON, {

    /**
     * APIMethod: read
     * Deserialize an RVA JSON string.
     *
     * Parameters:
     * json - {String} An RVA JSON string
     *
     * Returns: 
     * {Object} an array of <OpenLayers.Feature.Vector>. 
     */
    read: function(json, filter) {
        var results = null;
        var obj = null;
        if (typeof json == "string") {
            obj = OpenLayers.Format.JSON.prototype.read.apply(this,
                                                              [json, filter]);
        } else {
            obj = json;
        }
        if(!obj) {
            OpenLayers.Console.error("Bad JSON: " + json);
        } else if(typeof(obj.rva) != "object") {
            OpenLayers.Console.error("Bad RVA response - " + json);
        } else {
            results = [];
            var addresses = obj.rva.answer.addresses;
            for(var i=0, len=addresses.length; i<len; ++i) {
                try {
                    results.push(this.parseFeature(addresses[i]));
                } catch(err) {
                    results = null;
                    OpenLayers.Console.error(err);
                }
            }
        }
        return results;
    },

    /**
     * Method: parseFeature
     * Convert an address object into an
     *     <OpenLayers.Feature.Vector>.
     *
     * Parameters:
     * obj - {Object}
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} A feature.
     */
    parseFeature: function(obj) {
        var feature, geometry;
        try {
            geometry = this.parseGeometry(
                parseFloat(obj.x), 
                parseFloat(obj.y)
            );
        } catch(err) {
            throw err;
        }
        feature = new OpenLayers.Feature.Vector(geometry, obj);
        if (obj.idaddress) {
            feature.fid = obj.idaddress;
        }
        return feature;
    },

    /**
     * Method: parseGeometry
     *
     * Parameters:
     * x - {float}
     * y - {float}
     *
     * Returns: 
     * {<OpenLayers.Geometry>} A geometry.
     */
    parseGeometry: function(x, y) {
        var geometry = new OpenLayers.Geometry.Point(x, y);
        if (this.internalProjection && this.externalProjection) {
            geometry.transform(this.externalProjection, 
                               this.internalProjection); 
        }
        return geometry;
    },

    CLASS_NAME: "OpenLayers.Format.RVA" 

});

/**
 * Class: OpenLayers.Format.RVALane
 *
 * Inherits from:
 *  - <OpenLayers.Format.JSON>
 */
OpenLayers.Format.RVALane = OpenLayers.Class(OpenLayers.Format.JSON, {

    /**
     * APIMethod: read
     * Deserialize an RVA JSON string.
     *
     * Parameters:
     * json - {String} An RVA JSON string
     *
     * Returns:
     * {Object} an array of <OpenLayers.Feature.Vector>.
     */
    read: function(json, filter) {
        var results = null;
        var obj = null;
        if (typeof json == "string") {
            obj = OpenLayers.Format.JSON.prototype.read.apply(this,
                [json, filter]);
        } else {
            obj = json;
        }
        if(!obj) {
            OpenLayers.Console.error("Bad JSON: " + json);
        } else if(typeof(obj.rva) != "object") {
            OpenLayers.Console.error("Bad RVA response - " + json);
        } else {
            results = [];
            var lanes = obj.rva.answer.lanes;
            for(var i=0, len=lanes.length; i<len; ++i) {
                try {
                    results.push(this.parseFeature(lanes[i]));
                } catch(err) {
                    results = null;
                    OpenLayers.Console.error(err);
                }
            }
        }
        return results;
    },

    /**
     * Method: parseFeature
     * Convert an address object into an
     *     <OpenLayers.Feature.Vector>.
     *
     * Parameters:
     * obj - {Object}
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} A feature.
     */
    parseFeature: function(obj) {
        var feature, geometry;
        try {
            geometry = this.parseGeometry(obj.lowerCorner, obj.upperCorner);
        } catch(err) {
            throw err;
        }
        feature = new OpenLayers.Feature.Vector(geometry, obj);
        if (obj.idlanes) {
            feature.fid = obj.idlanes;
        }
        return feature;
    },

    /**
     * Method: parseGeometry
     *
     * Parameters:
     * lowerCorner - {String} "left bottom"
     * upperCorner - {String} "right up"
     *
     * Returns:
     * {<OpenLayers.Geometry>} A geometry.
     */
    parseGeometry: function(lowerCorner, upperCorner) {
        var bounds = new OpenLayers.Bounds(lowerCorner.split(" ")[1], lowerCorner.split(" ")[0],
            upperCorner.split(" ")[1], upperCorner.split(" ")[0]);
        var geometry = bounds.toGeometry();
        if (this.internalProjection && this.externalProjection) {
            geometry.transform(this.externalProjection,
                this.internalProjection);
        }
        return geometry;
    },

    CLASS_NAME: "OpenLayers.Format.RVALane"

});
