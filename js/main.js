Ext.namespace("GEOR.Addons");

GEOR.Addons.RVA = Ext.extend(GEOR.Addons.Base, {

    /**
     * Method: init
     *
     * Parameters:
     * record - {Ext.data.record} a record with the addon parameters
     */
    init: function(record) {
        var tr = OpenLayers.i18n;

        this.layer = new OpenLayers.Layer.Vector("__georchestra_rva", {
            displayInLayerSwitcher: false,
            styleMap: new OpenLayers.StyleMap({
                "default": this.options.graphicStyle
            })
        });
        this.map.addLayer(this.layer);

        this.combo = new Ext.form.ComboBox({
            hideTrigger: true,
            selectOnFocus: true,
            mode: 'remote',
            // we're setting it here:
            queryParam: 'query',
            // the default value matches by chance the RVA query parameter!
            loadingText: tr('Loading...'),
            minChars: this.options.minChars,
            queryDelay: 100,
            tpl: new Ext.XTemplate(
                '<tpl for="."><div class="x-combo-list-item" ext:qtip="{values.feature.attributes.addr3}">',
                '{values.feature.attributes.addr3}',
                '</div></tpl>'
            ),
            store: this._createStore(),
            emptyText: tr("addon_rva_emptyText"),
            triggerAction: 'all',
            width: 250,
            listeners: {
                "render": function(c) {
                    new Ext.ToolTip({
                        target: c.getEl(),
                        trackMouse: true,
                        html: tr("addon_rva_searchTip")
                    });
                },
                "select": this._onComboSelect,
                scope: this
            }
        });
        this.components = this.target.insert(this.position, {
            xtype: 'form',
            bodyStyle: 'padding: 1.5em;',
            title: tr("addon_rva_tabTitle"),
            labelWidth: 1,
            items: this.combo
        });
        // switch to this new tab:
        this.target.layout.setActiveItem(this.components);
        this.target.doLayout();
    },

    /**
     * Method: _createStore
     *
     */
    _createStore: function() {
        var api_srs = null,
            formatOptions = {},
            map_srs = this.map.getProjection().split(':')[1];

        if (this.options.supported_srs.indexOf(map_srs) > -1) {
            // the API natively supports our map SRS
            // let's use this SRS.
            api_srs = map_srs;
        } else {
            // we have to reproject client side
            api_srs = 4326;
            formatOptions = {
                internalProjection: new OpenLayers.Projection("EPSG:"+map_srs),
                externalProjection: new OpenLayers.Projection("EPSG:4326")
            };
        }
        return new GeoExt.data.FeatureStore({
            fields: [
                'insee',
                {name: 'idlane', type: "int"},
                {name: 'number', type: "int"},
                'extension',
                'building'
            ],
            layer: this.layer,
            proxy: new GeoExt.data.ProtocolProxy({
                protocol: new OpenLayers.Protocol.HTTP({
                    url: this.options.service,
                    params: {
                        key: this.options.key,
                        version: '1.0',
                        format: 'json',
                        epsg: api_srs,
                        cmd: 'getfulladdresses'
                    },
                    format: new OpenLayers.Format.RVA(formatOptions)
                })
            }),
            hasMultiSort: true,
            multiSortInfo: {
                sorters: [{
                    field: 'insee',
                    direction: "ASC"
                }, {
                    field: 'idlane',
                    direction: "ASC"
                }, {
                    field: 'number',
                    direction: "ASC"
                }, {
                    field: 'extension', 
                    direction: "ASC"
                }, {
                    field: 'building', 
                    direction: "ASC"
                }],
                direction: 'ASC'
            },
            listeners: {
                'datachanged': function(store) {
                    this.popup && this.popup.close();
                    if (store.getCount() == 0) {
                        return;
                    }
                    var bounds = new OpenLayers.Bounds(),
                        records = store.getRange();
                    Ext.each(records, function(r) {
                        var f = r.getFeature();
                        // copy feature attributes to record:
                        Ext.applyIf(r.data, f.attributes);
                        if (f.geometry) {
                            bounds.extend(f.geometry.getBounds());
                        }
                    });
                    this.map.zoomToExtent(bounds);
                },
                scope: this
            }
        });
    },


    /**
     * Method: _onComboSelect
     * Callback on combo selected
     */
    _onComboSelect: function(combo, record) {
        var f = record.get('feature').clone();
        this.layer.destroyFeatures();
        this.popup && this.popup.destroy();
        this.map.setCenter(f.geometry.getBounds().getCenterLonLat());
        this.layer.addFeatures([f]);
        this.popup = new GeoExt.Popup({
            location: f,
            width: 300,
            tpl: ["<p>{addr3}</p><p>idaddress : {idaddress}</p>"],
            data: f.attributes,
            anchorPosition: "top-left",
            bodyStyle: "padding: 5px;",
            collapsible: false,
            closable: true,
            closeAction: "hide",
            unpinnable: true,
            listeners: {
                "hide": function() {
                    this.layer.destroyFeatures();
                },
                scope: this
            },
            buttons: [{
                text: tr("zoom"),
                handler: function() {
                    this.map.zoomTo(this.options.zoomLevel);
                },
                scope: this
            }]
        });
        this.popup.show();
    },

    /**
     * Method: destroy
     * 
     */
    destroy: function() {
        this.popup && this.popup.destroy();
        this.popup = null;
        this.map.removeLayer(this.layer);
        this.layer = null;

        GEOR.Addons.Base.prototype.destroy.call(this);
    }
});