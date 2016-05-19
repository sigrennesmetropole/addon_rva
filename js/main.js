/*global
 Ext, GeoExt, OpenLayers, GEOR
 */

Ext.namespace("GEOR.Addons");

/**
 * GEOR.Addons.RVA - Search in Rennees Métropole Référentiel Voies et Adresses (RVA)
 *
 * Layout of the search box is dependant of its location. Pleas use the target config option carefully
 * supported target are "tabs_n" and "tbar_n" where n is a number indicating the tab number or the position in the
 * toolbar.
 */
GEOR.Addons.RVA = Ext.extend(GEOR.Addons.Base, {

    /**
     * Method: init
     *
     * Parameters:
     * record - {Ext.data.record} a record with the addon parameters
     */
    init: function(record) {
        var tr = OpenLayers.i18n,
            clonedStyle;

        this.layer = new OpenLayers.Layer.Vector("__georchestra_rva", {
            displayInLayerSwitcher: false,
            styleMap: new OpenLayers.StyleMap({
                "default": this.options.addressStyle
            })
        });
        clonedStyle = this.layer.styleMap.styles.default.clone();
        clonedStyle.defaultStyle.label = null;
        this.layer.styleMap.styles.default.addRules([
            new OpenLayers.Rule({
                minScaleDenominator: 0,
                maxScaleDenominatore: this.options.addressLabelMaxScaleDenominator,
                symbolizer: this.layer.styleMap.styles.default.defaultStyle
            }),
            new OpenLayers.Rule({
                minScaleDenominator: this.options.addressLabelMaxScaleDenominator,
                symbolizer: clonedStyle.defaultStyle
            })
        ]);


        this.layerLane = new OpenLayers.Layer.Vector("__georchestra_rvaLane", {
            displayInLayerSwitcher: false,
            styleMap: new OpenLayers.StyleMap({
                "default": this.options.laneStyle
            })
        });
        clonedStyle = this.layerLane.styleMap.styles.default.clone();
        clonedStyle.defaultStyle.label = null;
        this.layerLane.styleMap.styles.default.addRules([
            new OpenLayers.Rule({
                minScaleDenominator: 0,
                maxScaleDenominatore: this.options.laneLabelMaxScaleDenominator,
                symbolizer: this.layerLane.styleMap.styles.default.defaultStyle
            }),
            new OpenLayers.Rule({
                minScaleDenominator: this.options.laneLabelMaxScaleDenominator,
                symbolizer: clonedStyle.defaultStyle
            })
        ]);

        this.map.addLayer(this.layer);
        this.map.addLayer(this.layerLane);

        /**
         * By default, the combobox is looking for lane
         * @type {string}
         */
        this.state = "searchlane";

        this.events = new Ext.util.Observable();

        /**
         * We are looking for a line
         */
        this.events.addEvents("searchlane");

        /**
         * We are looking for an address
         */
        this.events.addEvents("searchaddress");

        this.events.on({
            "searchlane": {
                fn: function(query) {
                    if (this.state !== "searchlane") {
                        this.combo = this.combo.cloneConfig({
                            store: this._createStore("lanes"),
                            tpl: new Ext.XTemplate(
                                '<tpl for="."><div class="x-combo-list-item" ext:qtip="{values.feature.attributes.name}">',
                                '{values.feature.attributes.name}',
                                '</div></tpl>'
                            )
                        });
                        this.components.destroy();

                        if (this.target.getXType() === "toolbar") {
                            this.components = this.target.insertButton(this.position, this.createToolbarComponent());
                        } else if (this.target.getXType() === "tabpanel") {
                            this.components = this.target.insert(this.position, this.createTabpanelComponent());
                            this.target.setActiveTab(this.position);
                        }
                        this.target.doLayout();
                        this.combo.setValue(query.query);
                        this.combo.focus(false, 0);
                    }
                    this.state = "searchlane";


                },
                scope: this
            },
            "searchaddress": {
                fn: function(query) {
                    if (this.state !== "searchaddress") {
                        this.combo = this.combo.cloneConfig({
                            store: this._createStore("fullAddresses"),
                            tpl: new Ext.XTemplate(
                                '<tpl for="."><div class="x-combo-list-item" ext:qtip="{values.feature.attributes.addr3}">',
                                '{values.feature.attributes.addr3}',
                                '</div></tpl>'
                            )
                        });
                        this.components.destroy();

                        if (this.target.getXType() === "toolbar") {
                            this.components = this.target.insertButton(this.position, this.createToolbarComponent());
                        } else if (this.target.getXType() === "tabpanel") {
                            this.components = this.target.insert(this.position, this.createTabpanelComponent());
                            this.target.setActiveTab(this.position);
                        }
                        this.target.doLayout();
                        this.combo.setValue(query.query);
                        this.combo.focus(false, 0);

                    }
                    this.state = "searchaddress";

                },
                scope: this
            }
        });


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
            displayField: "addr3",
            tpl: new Ext.XTemplate(
                '<tpl for="."><div class="x-combo-list-item" ext:qtip="{values.feature.attributes.name}">',
                '{values.feature.attributes.name}',
                '</div></tpl>'
            ),
            store: this._createStore("lanes"),
            emptyText: tr("addon_rva_emptyText"),
            triggerAction: 'all',
            width: 250,
            listeners: {
                "beforequery": {
                    fn: function(query) {
                        if (query.query === "") {

                        } else if (/^\d+/.test(query.query)) {
                            this.events.fireEvent("searchaddress", query);
                        } else {
                            this.events.fireEvent("searchlane", query);
                        }
                    },
                    scope: this
                },
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

        // switch to this new tab:
        if (this.target.getXType() == "toolbar") {
            this.components = this.target.insertButton(this.position, this.createToolbarComponent());
        }
        if (this.target.getXType() === "tabpanel") {
            this.components = this.target.insert(this.position, this.createTabpanelComponent());
            this.target.layout.setActiveItem(this.components);
        }

        this.target.doLayout();

        this.laneWindow = new Ext.Window({
            //TODO tr
            title: "Adresses sur la voie",
            layout: "table",
            layoutConfig: {
                columns: 1
            },
            width: 540,
            autoHeight: true,
            closable: true,
            closeAction: "hide",
            items: [
                {
                    id: "rva-lane-grid",
                    xtype: "grid",
                    store: this._createStore("addresses"),
                    autoExpandColumn: "addr3",
                    columns: [
                        {id: 'insee', header: "Insee", dataIndex: "insee", width: 60},
                        {id: "idaddres", header: "Idaddress", dataIndex: "idaddress", width: 60},
                        {id: "number", header: "Num.", dataIndex: "number", width: 40},
                        {id: 'extension', header: "Ext", dataIndex: "extension", width: 40},
                        {id: 'building', header: "Bât", dataIndex: "building", width: 40},
                        {id: 'addr3', header: "Adresse", dataIndex: "addr3"}
                    ],
                    sm: new GeoExt.grid.FeatureSelectionModel({
                        autoPanMapOnSelection: true
                    }),
                    width: 520,
                    height: 520,
                    frame: true
                }
            ],
            buttons: [
                {
                    text: "Close",
                    handler: function() {
                        this.laneWindow.hide();
                    },
                    scope: this
                },
                {
                    text: "Export",
                    handler: function() {
                        var grid = Ext.getCmp("rva-lane-grid"),
                            row, columns = [], data = [];
                        for (var c = 0; c < grid.getColumnModel().getColumnCount(); c++) {
                            columns.splice(-1, 0, grid.getColumnModel().getDataIndex(c));
                        }
                        grid.getStore().each(function(record) {
                            row = [];
                            for (var c = 0; c < columns.length; c++) {
                                row.push(record.get(columns[c]));
                            }
                            data.push(row);
                        });
                        OpenLayers.Request.POST({
                            url: GEOR.config.PATHNAME + "/ws/csv/",
                            data: (new OpenLayers.Format.JSON()).write({
                                columns: columns,
                                data: data
                            }),
                            success: function(response) {
                                var o = Ext.decode(response.responseText);
                                window.location.href = GEOR.config.PATHNAME + "/" + o.filepath;
                            }
                        })
                    },
                    scope: this
                }
            ]

        });
    },

    /**
     * Method: _createStore
     */
    _createStore: function(storeType) {
        var storeLayer, proxyParams, rvaFormat, storeFields, storeSortInfo;

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
                internalProjection: new OpenLayers.Projection("EPSG:" + map_srs),
                externalProjection: new OpenLayers.Projection("EPSG:4326")
            };
        }

        proxyParams = {
            key: this.options.key,
            version: '1.0',
            format: 'json',
            epsg: api_srs
        };

        if (storeType === "lanes") {
            storeLayer = this.layerLane;
            proxyParams.cmd = "getlanes";
            proxyParams.insee = "all";
            rvaFormat = OpenLayers.Format.RVALane;
            storeFields = [
                'insee',
                'name',
                'name3'
            ];
            storeSortInfo = {
                sorters: [{
                    field: 'insee',
                    direction: "ASC"
                }, {
                    field: 'name3',
                    direction: "ASC"
                }],
                direction: 'ASC'
            }
        } else if ((storeType === "fullAddresses") || (storeType == "addresses")) {
            storeLayer = this.layer;
            rvaFormat = OpenLayers.Format.RVA;
            storeFields = [
                'insee',
                {name: 'idlane', type: "int"},
                {name: 'number', type: "int"},
                'extension',
                'building',
                'addr3'
            ];
            storeSortInfo = {
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
            };

            if (storeType === "fullAddresses") {
                proxyParams.cmd = "getfulladdresses";

            } else if (storeType == "addresses") {
                proxyParams.cmd = "getaddresses";
                proxyParams.insee = "all";
            }
        }

        return new GeoExt.data.FeatureStore({
            fields: storeFields,
            layer: storeLayer,
            proxy: new GeoExt.data.ProtocolProxy({
                protocol: new OpenLayers.Protocol.HTTP({
                    url: this.options.service,
                    params: proxyParams,
                    format: new rvaFormat(formatOptions)
                })
            }),
            hasMultiSort: true,
            multiSortInfo: storeSortInfo,
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
        this.layerLane.destroyFeatures();

        this.popup && this.popup.destroy();

        if (this.state === "searchaddress") {
            this.map.setCenter(f.geometry.getBounds().getCenterLonLat());
            this.layer.addFeatures([f]);
            this.popup = new GeoExt.Popup({
                location: f,
                width: 300,
                tpl: ["<p>{address}</p><p>idaddress : {idaddress}</p>"],
                data: {
                    address: f.attributes.addr3,
                    idaddress: f.attributes.idaddress
                },
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
        }
        if (this.state === "searchlane") {
            this.map.setCenter(f.geometry.getBounds().getCenterLonLat());
            this.layerLane.addFeatures([f]);
            this.map.zoomToExtent(this.layerLane.getDataExtent());

            var laneGrid = Ext.getCmp("rva-lane-grid");
            laneGrid.getStore().load({
                    params: {
                        idlane: f.attributes.idlane
                    },
                    callback: function() {
                        this.laneWindow.show();
                    },
                    scope: this
                }
            );


        }
    },

    createToolbarComponent: function() {
        return ["-", "RVA:", this.combo, "-"];
    },

    createTabpanelComponent: function() {
        return {
            xtype: 'form',
            bodyStyle: 'padding: 1.5em;',
            title: tr("addon_rva_tabTitle"),
            labelWidth: 1,
            items: this.combo
        };
    },


    /**
     * Method: destroy
     *
     */
    destroy: function() {
        this.popup && this.popup.destroy();
        this.popup = null;
        this.map.removeLayer(this.layer);
        this.map.removeLayer(this.layerLane);
        this.layer = null;
        this.layerLane = null;

        GEOR.Addons.Base.prototype.destroy.call(this);
    }
});