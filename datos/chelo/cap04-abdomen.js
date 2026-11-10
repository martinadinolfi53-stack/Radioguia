// Abdomen · Enfoques Chelo (resúmenes de clase de un compañero, Técnicas 1).
// Transcripción de las hojas (solo se corrigió la ortografía). «fuente.paginas» = número de hoja (foto) del resumen.
// Sin los enfoques que Chelo rotula «complementario» (pedido de Martin, 9/11/2026).
// Datos que dio Martin donde la hoja no los trae: DFRI 1 m (desfiladero, cadera oblicua, pelvis, cervical frente, C1-C2,
// torácica, lumbar y lumbosacro), columna lumbar = intermedia y «homogeneizada» sin número = homogeneizada 1.
export default {
  "capitulo": 4,
  "titulo": "Abdomen",
  "paginas": "",
  "regiones": [
    {
      "id": "abdomen",
      "nombre": "Abdomen",
      "detalle": ""
    }
  ],
  "proyecciones": [
    {
      "id": "abdomen-ap",
      "region": "abdomen",
      "nombre": "Abdomen",
      "categoria": [
        "AP"
      ],
      "tipo": "R",
      "factores": {
        "ri": "35 × 43 longitudinal",
        "dfri": "1 metro",
        "respiracion": "Exponer al final de la espiración.",
        "parrilla": "Sí",
        "colimacion": "Hasta bordes del abdomen.",
        "tecnica": null,
        "foco": "Grueso"
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Perpendicular al RI, incide a nivel de crestas ilíacas."
      },
      "posicion": [
        "Decúbito supino, piernas extendidas y brazos a los lados.",
        "Asegurarse que no haya rotación (EIAS a la misma distancia).",
        "Borde superior de la sínfisis incluido en el borde inferior del RI."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Veo perfil del hígado, bazo, músculo psoas y riñones, hasta incluir la sínfisis del pubis.",
            "Sin rotación, simetría en alas ilíacas.",
            "Bordes externos de costillas inferiores.",
            "Se ven niveles hidroaéreos si están presentes.",
            "Los bordes del hígado y riñones se ven en pacientes de tamaño medio."
          ]
        ],
        [
          "Criterios de evaluación en bipedestación",
          [
            "Los dos diafragmas y una porción importante del abdomen inferior.",
            "Comparte mismas estructuras que decúbito."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "14"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/abdomen-ap.webp",
        "alt": "Lámina de placas: Abdomen",
        "verificada": true
      },
      "estado": "pendiente-revision"
    }
  ]
};
