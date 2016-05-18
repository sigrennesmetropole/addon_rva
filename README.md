ADDON RVA
==========

Cet [addon](https://github.com/georchestra/georchestra/blob/15.12/mapfishapp/src/main/webapp/app/addons/README.md) permet de requêter l'[API RVA de Rennes Métropole](http://rva.data.rennes-metropole.fr/) depuis le visualiseur de [geOrchestra](http://www.georchestra.org/).

auteurs : [@fvanderbiest](https://github.com/fvanderbiest/), [@jdenisgiguere](https://github.com/jdenisgiguere/)

Compatibilité : geOrchestra >= 15.12

Exemple de configuration :

```js
    {
        "id": "rva_0",
        "name": "RVA",
        "options": {
            "key": "xxxxxxxxxxxxxxxxxxxxxx",
            "zoomLevel": 18,
            "minChars": 7,
            "laneLabelMaxScaleDenominator": 300000,
            "addressLabelMaxScaleDenominator": 5000,
            "laneStyle": {
                "strokeColor": "blue",
                "strokeWidth": 2,
                "fillOpacity": 0,
                "label": "${name3}",
                "fontColor": "blue",
                "fontSize": 12,
                "fontFamily": "serif",
                "labelYOffset": "15",
                "labelOutlineColor": "white",
                "labelOutlineWidth": 3
            },
            "addressStyle": {
                "graphicName": "star",
                "pointRadius": 4,
                "strokeColor": "fuchsia",
                "strokeWidth": 2,
                "fillOpacity": 0,
                "label": "${addr2}",
                "fontColor": "fuchsia",
                "fontSize": 10,
                "fontFamily": "serif",
                "labelAlign": "cc",
                "labelYOffset": "15",
                "labelOutlineColor": "white",
                "labelOutlineWidth": 3
            }
        },
        "title": {
            "en": "RVA",
            "fr": "RVA",
            "es": "RVA",
            "de": "RVA",
        },
        "description": {
            "en": "...",
            "fr": "Trouvez en quelques secondes une rue ou une adresse avec l'API RVA de Rennes Métropole",
            "de": "...",
            "es": "..."
        }
    }
```

`options.zoomLevel` permet de choisir le niveau de zoom à appliquer lorsqu'un usager clique sur le bouton `zoom` de
la fenêtre flottante indiquant l'adresse.
