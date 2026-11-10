// Columna · Enfoques Chelo (resúmenes de clase de un compañero, Técnicas 1).
// Transcripción de las hojas (solo se corrigió la ortografía). «fuente.paginas» = número de hoja (foto) del resumen.
// Sin los enfoques que Chelo rotula «complementario» (pedido de Martin, 9/11/2026).
// Datos que dio Martin donde la hoja no los trae: DFRI 1 m (desfiladero, cadera oblicua, pelvis, cervical frente, C1-C2,
// torácica, lumbar y lumbosacro), columna lumbar = intermedia y «homogeneizada» sin número = homogeneizada 1.
export default {
  "capitulo": 3,
  "titulo": "Columna",
  "paginas": "",
  "regiones": [
    {
      "id": "columna-cervical",
      "nombre": "Columna cervical",
      "detalle": "Incluye atlas y axis (C1-C2)"
    },
    {
      "id": "columna-toracica",
      "nombre": "Columna torácica",
      "detalle": "Dorsal"
    },
    {
      "id": "columna-lumbar",
      "nombre": "Columna lumbar",
      "detalle": "Incluye pasaje lumbosacro L5-S1"
    }
  ],
  "proyecciones": [
    {
      "id": "columna-cervical-ap-perfil",
      "region": "columna-cervical",
      "nombre": "Columna cervical frente y perfil",
      "categoria": [
        "AP",
        "Perfil"
      ],
      "tipo": "R",
      "factores": {
        "ri": null,
        "dfri": "Frente: 1 metro · Perfil: 150 aprox.",
        "respiracion": "Frente: Aguante el aire. · Perfil: Que largue todo el aire.",
        "tecnica": null
      },
      "rc": {
        "direccion": "variable",
        "texto": "Frente: 15°-20° craneal. Perfil: Perpendicular en C4."
      },
      "posicion": [
        "Frente: Decúbito supino, debo elevar el mentón cuanto sea necesario para que la mandíbula se superponga solo a C1-C2."
      ],
      "criterios": [
        [
          "Frente · Región comprendida",
          [
            "Vemos cuerpos vertebrales de C3 a T2.",
            "Articulaciones intervertebrales abiertas y apófisis espinosas equidistantes respecto a línea media."
          ]
        ],
        [
          "Perfil · Región comprendida",
          [
            "De C1 a C7 como mínimo.",
            "No hay superposición de la mandíbula."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "20"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/columna-cervical-ap-perfil.webp",
        "alt": "Imagen de la hoja de Chelo y lámina de placas: Columna cervical frente y perfil",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "atlas-axis-ap",
      "region": "columna-cervical",
      "nombre": "Atlas y axis (C1-C2) frente",
      "categoria": [
        "AP"
      ],
      "tipo": "R",
      "factores": {
        "ri": null,
        "dfri": "1 metro",
        "respiracion": "No respire, no trague.",
        "tecnica": null
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Perpendicular a la porción media de la boca (C1-C2)."
      },
      "posicion": [
        "Decúbito supino o bipedestación."
      ],
      "criterios": [
        [
          "Región comprendida",
          [
            "Debe verse apófisis odontoides, atlas, axis y articulación entre primera y segunda vértebra.",
            "Superposición de incisivos superiores y base del cráneo."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "17"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/atlas-axis-ap.webp",
        "alt": "Imagen de la hoja de Chelo: Atlas y axis (C1-C2) frente",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "columna-toracica-ap-perfil",
      "region": "columna-toracica",
      "nombre": "Columna torácica frente y perfil",
      "categoria": [
        "AP",
        "Perfil"
      ],
      "tipo": "R",
      "factores": {
        "ri": null,
        "dfri": "1 metro",
        "respiracion": "Frente: Que largue todo el aire.",
        "tecnica": null
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Frente: Perpendicular T7."
      },
      "posicion": [
        "Frente: Decúbito supino o bipedestación.",
        "Perfil: Si la columna tiene una curvatura (escoliosis), debo apoyar el lado hacia donde va la curva, para reducir magnificación."
      ],
      "criterios": [
        [
          "Frente · Región comprendida",
          [
            "12 cuerpos torácicos, espacios articulares y agujeros intervertebrales.",
            "Esternoclavicular equidistantes."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "16"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/columna-toracica-ap-perfil.webp",
        "alt": "Imagen de la hoja de Chelo y lámina de placas: Columna torácica frente y perfil",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "columna-lumbar-ap-perfil",
      "region": "columna-lumbar",
      "nombre": "Columna lumbar frente y perfil",
      "categoria": [
        "AP",
        "Perfil"
      ],
      "tipo": "R",
      "factores": {
        "ri": null,
        "dfri": "1 metro",
        "respiracion": null,
        "tecnica": "Intermedia"
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Frente: Perpendicular en L3 (4 dedos encima de crestas). Perfil: Si tiene pelvis ancha y tórax chico, puede necesitar angulación caudal de 3°-5° para compensar la inclinación."
      },
      "posicion": [
        "Frente: Decúbito supino (flexionar cadera y rodilla) o bipedestación.",
        "Frente: Sin rotación (espinas ilíacas misma distancia de la mesa).",
        "Perfil: Se apoya el lado de la curvatura (escoliosis) si es que tiene, por la magnificación."
      ],
      "criterios": [
        [
          "Frente · Región comprendida",
          [
            "Se ve como mínimo de T12 a S1.",
            "Cuerpos vertebrales, articulaciones intervertebrales y apófisis transversas.",
            "Sin rotación: me doy cuenta por la simetría de las apófisis transversas, las articulaciones sacroilíacas y el sacro.",
            "Apófisis espinosas al medio."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "15"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/columna-lumbar-ap-perfil.webp",
        "alt": "Imagen de la hoja de Chelo y lámina de placas: Columna lumbar frente y perfil",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "lumbosacro-perfil-ap",
      "region": "columna-lumbar",
      "nombre": "Pasaje lumbosacro L5-S1 perfil y frente",
      "categoria": [
        "Perfil",
        "AP"
      ],
      "tipo": "R",
      "factores": {
        "ri": null,
        "dfri": "1 metro",
        "respiracion": null,
        "tecnica": null
      },
      "rc": {
        "direccion": "variable",
        "texto": "Perfil: Con almohada perpendicular. Sin almohada 5° hombres, 8° mujeres, caudal. 4 cm debajo de crestas. 5 cm posterior a espinas ilíacas anterosuperiores (EIAS). Frente: 30° craneal hombres, 35 craneal mujeres; línea media, 4 cm debajo de EIAS."
      },
      "posicion": [
        "Perfil: Decúbito lateral.",
        "Perfil: Almohada para que no quede inclinada; si no uso almohada debo angular el rayo caudal 5° hombres, 8° mujeres.",
        "Frente: Decúbito supino, piernas flexionadas para disminuir lordosis."
      ],
      "criterios": [
        [
          "Perfil · Región comprendida",
          [
            "Articulación intervertebral lumbosacra abierta.",
            "El pasaje L5-S1 en el medio.",
            "Si no llevo angulación, las crestas deben estar casi superpuestas."
          ]
        ],
        [
          "Frente · Región comprendida",
          [
            "Espacio abierto intervertebral entre L5-S1.",
            "Ausencia de rotación por apófisis espinosas al medio."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "19"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/lumbosacro-perfil-ap.webp",
        "alt": "Imagen de la hoja de Chelo: Pasaje lumbosacro L5-S1 perfil y frente",
        "verificada": true
      },
      "estado": "pendiente-revision"
    }
  ]
};
