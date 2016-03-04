ADDON RVA
==========

Cet addon permet de requêter l'[API RVA de Rennes Métropole](http://rva.data.rennes-metropole.fr/).

auteur : @fvanderbiest 

Compatibilité : geOrchestra >= 15.12

Exemple de configuration :

```js
    {
        "id": "rva_0",
        "name": "RVA",
        "options": {
            "key": "xxxxxxxxxxxxxxxxxxxxxx",
            "minChars": 7,
            "graphicStyle": {
                "graphicName": "star",
                "pointRadius": 4,
                "strokeColor": "fuchsia",
                "strokeWidth": 2,
                "fillOpacity": 0
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
