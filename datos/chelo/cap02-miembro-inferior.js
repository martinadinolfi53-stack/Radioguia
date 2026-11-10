// Miembro inferior, cadera y pelvis · Enfoques Chelo (resúmenes de clase de un compañero, Técnicas 1).
// Transcripción de las hojas (solo se corrigió la ortografía). «fuente.paginas» = número de hoja (foto) del resumen.
// Sin los enfoques que Chelo rotula «complementario» (pedido de Martin, 9/11/2026).
// Datos que dio Martin donde la hoja no los trae: DFRI 1 m (desfiladero, cadera oblicua, pelvis, cervical frente, C1-C2,
// torácica, lumbar y lumbosacro), columna lumbar = intermedia y «homogeneizada» sin número = homogeneizada 1.
export default {
  "capitulo": 2,
  "titulo": "Miembro inferior, cadera y pelvis",
  "paginas": "",
  "regiones": [
    {
      "id": "cadera",
      "nombre": "Cadera",
      "detalle": ""
    },
    {
      "id": "pelvis",
      "nombre": "Pelvis",
      "detalle": ""
    },
    {
      "id": "femur",
      "nombre": "Fémur",
      "detalle": ""
    },
    {
      "id": "rodilla",
      "nombre": "Rodilla",
      "detalle": ""
    },
    {
      "id": "pierna",
      "nombre": "Pierna",
      "detalle": "Tibia y peroné"
    },
    {
      "id": "tobillo",
      "nombre": "Tobillo",
      "detalle": "Cuello de pie"
    },
    {
      "id": "pie",
      "nombre": "Pie",
      "detalle": ""
    }
  ],
  "proyecciones": [
    {
      "id": "cadera-ap",
      "region": "cadera",
      "nombre": "Frente de cadera",
      "categoria": [
        "AP"
      ],
      "tipo": "R",
      "factores": {
        "ri": "35 × 43 (longitudinal) bilateral; 24 × 30 unilateral",
        "dfri": "1 metro",
        "respiracion": "Apnea durante exposición.",
        "tecnica": null,
        "foco": "Grueso"
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Perpendicular al RI: → Bilateral: al medio, entre cabezas femorales, 2 cm arriba del pubis. → Unilateral: cuello femoral."
      },
      "posicion": [
        "Decúbito supino, piernas extendidas, pelvis sin rotación.",
        "Ambas piernas con rotación interna de 15°."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "1/3 de fémur proximal y partes adyacentes de la cintura pélvica.",
            "Trocánter mayor de perfil.",
            "Cabeza y cuello de fémur de perfil.",
            "Trocánter menor no se ve, o se ve muy poco."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "21"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/cadera-ap.webp",
        "alt": "Imagen de la hoja de Chelo y lámina de placas: Frente de cadera",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "cadera-oblicua",
      "region": "cadera",
      "nombre": "Oblicua de cadera",
      "categoria": [
        "Oblicuas"
      ],
      "tipo": "R",
      "factores": {
        "ri": null,
        "dfri": "1 metro",
        "respiracion": null,
        "tecnica": null
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Perpendicular en el cuello o cabeza femoral."
      },
      "posicion": [
        "Decúbito supino, se rota al paciente un poco hacia el lado afectado, hasta que el paciente pueda.",
        "Flexiona rodilla afectada como una rana.",
        "La otra pierna la flexiona y apoya el pie en la mesa. 45°."
      ],
      "criterios": [
        [
          "Región comprendida",
          [
            "Vemos articulación de la cadera (acetábulo y cabeza femoral).",
            "Cuello femoral superpuesto con el trocánter mayor."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "22"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/cadera-oblicua.webp",
        "alt": "Imagen de la hoja de Chelo: Oblicua de cadera",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "pelvis-ap",
      "region": "pelvis",
      "nombre": "Frente de pelvis",
      "categoria": [
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
        "direccion": "perpendicular",
        "texto": "Perpendicular al medio entre EIAS y sínfisis."
      },
      "posicion": [
        "Decúbito supino, piernas extendidas.",
        "Rotación de pies, rodillas y piernas de 15° interna.",
        "Asegurar que la pelvis NO esté rotada."
      ],
      "criterios": [
        [
          "Región comprendida",
          [
            "Trocánteres mayores de perfil.",
            "Cuellos femorales sin superposición.",
            "Sin rotación, por la simetría de los iliones y agujeros obturadores.",
            "Trocánteres menores generalmente no se ven."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "23"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/pelvis-ap.webp",
        "alt": "Imagen de la hoja de Chelo y lámina de placas: Frente de pelvis",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "femur-ap",
      "region": "femur",
      "nombre": "Frente de fémur (AP)",
      "categoria": [
        "AP"
      ],
      "tipo": "R",
      "factores": {
        "ri": "35 × 43 vertical (en caso de que no entre toda la región realizo dos, uno de la articulación proximal y otro distal)",
        "dfri": "1 metro",
        "respiracion": null,
        "parrilla": "Sí (no usar RI en diagonal)",
        "colimacion": "Larga y estrecha hasta el área del fémur.",
        "tecnica": "Homogeneizada 1",
        "foco": "Grueso"
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Perpendicular al RI, incide al medio."
      },
      "posicion": [
        "Decúbito supino, fémur centrado.",
        "Aplicar rotación interna de 5° a toda la extremidad para una AP de las porciones media y distal de fémur, y 15° de rotación interna para una AP que incluya cadera."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Sin rotación, cóndilos femorales y tibiales parecen simétricos en tamaño y forma.",
            "Mitad interna de cabeza peronea superpuesta a la tibia.",
            "Fémur alineado al eje longitudinal del RI."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "33"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/femur-ap.webp",
        "alt": "Lámina de placas: Frente de fémur (AP)",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "femur-perfil",
      "region": "femur",
      "nombre": "Perfil de fémur",
      "categoria": [
        "Perfil"
      ],
      "tipo": "R",
      "factores": {
        "ri": "35 × 43 vertical (en caso de que no entre toda la región realizo dos, uno de la articulación proximal y otro distal)",
        "dfri": "1 metro",
        "respiracion": null,
        "parrilla": "Sí (no usar RI en diagonal)",
        "colimacion": "Larga y estrecha hasta el área del fémur.",
        "tecnica": "Homogeneizada 1",
        "foco": "Grueso"
      },
      "rc": {
        "direccion": "sin-dato",
        "texto": "Chelo no anota el rayo central en esta hoja."
      },
      "posicion": [
        "Decúbito lateral, con pierna no afectada colocada detrás o delante.",
        "Se gira pelvis en una posición lateral, flexionar rodilla 45° aprox. y cóndilos perpendiculares a la superficie de la mesa."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Lateral verdadera con cóndilos superpuestos."
          ]
        ]
      ],
      "notas": [
        "Factores técnicos: la hoja dice «Igual al frente»."
      ],
      "fuente": {
        "paginas": [
          "32"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/femur-perfil.webp",
        "alt": "Lámina de placas: Perfil de fémur",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "rodilla-ap",
      "region": "rodilla",
      "nombre": "Frente de rodilla (AP)",
      "categoria": [
        "AP"
      ],
      "tipo": "R",
      "factores": {
        "ri": "24 × 30 vertical",
        "dfri": "1 metro",
        "respiracion": null,
        "tecnica": "Homogeneizada 1",
        "foco": "Fino"
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Perpendicular, 1,25 cm distal al vértice de la rótula."
      },
      "posicion": [
        "Decúbito supino o sentado, pierna extendida.",
        "Pierna rotada medialmente de 3° a 5° para ver un AP verdadero.",
        "Cóndilos femorales paralelos al receptor de imagen."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Espacio articular femorotibial abierto.",
            "Eminencia intercondílea al medio de la fosa intercondílea.",
            "Rótula superpuesta al fémur.",
            "Sin rotación:",
            "→ Hay simetría entre cóndilos femorales y tibiales.",
            "→ Ligera superposición de cabeza del peroné con tibia."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "26"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/rodilla-ap.webp",
        "alt": "Imagen de la hoja de Chelo y lámina de placas: Frente de rodilla (AP)",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "rodilla-perfil",
      "region": "rodilla",
      "nombre": "Perfil de rodilla",
      "categoria": [
        "Perfil"
      ],
      "tipo": "R",
      "factores": {
        "ri": "24 × 30 vertical",
        "dfri": "1 metro",
        "respiracion": null,
        "tecnica": "Homogeneizada 1",
        "foco": "Fino"
      },
      "rc": {
        "direccion": "cefálico",
        "texto": "Angulación de 5° a 7° craneal al centro de la articulación (2 cm distal al cóndilo medial). La angulación permite que el espacio articular no quede oscurecido por la sombra magnificada del cóndilo.",
        "angulo": "5°-7°"
      },
      "posicion": [
        "Decúbito lateral, apoyando el lado a radiografiar.",
        "Rodilla flexionada 20°.",
        "Pierna no afectada por detrás para evitar rotación.",
        "Epicóndilos y rótula perpendicular al receptor de imagen."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Cóndilos femorales superpuestos.",
            "Espacio de articulación femororrotuliana abierta.",
            "Rótula de perfil.",
            "Cabeza de peroné y tibia ligeramente superpuesta."
          ]
        ]
      ],
      "notas": [
        "Factores técnicos: la hoja dice «Igual al frente»."
      ],
      "fuente": {
        "paginas": [
          "27"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/rodilla-perfil.webp",
        "alt": "Imagen de la hoja de Chelo y lámina de placas: Perfil de rodilla",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "pierna-ap",
      "region": "pierna",
      "nombre": "Frente de pierna",
      "categoria": [
        "AP"
      ],
      "tipo": "R",
      "factores": {
        "ri": "35 × 43 (vertical o diagonal, depende el tamaño de la pierna)",
        "dfri": "mínimo 1 metro, puede aumentar hasta 115/125 cm",
        "respiracion": null,
        "tecnica": "Homogeneizada 1",
        "foco": "Fino"
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Perpendicular al RI, en el punto medio de la pierna."
      },
      "posicion": [
        "Decúbito supino, pierna extendida, asegurarse que no haya rotación de la rodilla, pierna ni tobillo.",
        "AP verdadera.",
        "Cóndilos femorales paralelos al RI.",
        "Pie vertical formando ángulo de 90° con la pierna."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Visualización de ambas articulaciones.",
            "Sin rotación (cóndilos femorales y tibiales de perfil).",
            "Eminencia intercondílea al medio.",
            "Ligera superposición tibio-peronea distal y proximal."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "28"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/pierna-ap.webp",
        "alt": "Imagen de la hoja de Chelo y lámina de placas: Frente de pierna",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "pierna-perfil",
      "region": "pierna",
      "nombre": "Perfil de pierna",
      "categoria": [
        "Perfil"
      ],
      "tipo": "R",
      "factores": {
        "ri": "35 × 43 (vertical o diagonal, depende el tamaño de la pierna)",
        "dfri": "mínimo 1 metro, puede aumentar hasta 115/125 cm",
        "respiracion": null,
        "tecnica": "Homogeneizada 1",
        "foco": "Fino"
      },
      "rc": {
        "direccion": "sin-dato",
        "texto": "Chelo no anota el rayo central en esta hoja."
      },
      "posicion": [
        "Decúbito lateral, con el lado afectado sobre el RI, la otra pierna por detrás para evitar rotación.",
        "Rótula perpendicular al RI y cóndilos también."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Proyección lateral verdadera:",
            "→ Peroné distal situado en la mitad posterior de la tibia.",
            "→ Tuberosidad tibial de perfil.",
            "→ Ligero solapamiento de la tibia con la cabeza del peroné proximal."
          ]
        ]
      ],
      "notas": [
        "Factores técnicos: la hoja dice «Igual al frente»."
      ],
      "fuente": {
        "paginas": [
          "29"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/pierna-perfil.webp",
        "alt": "Imagen de la hoja de Chelo y lámina de placas: Perfil de pierna",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "tobillo-ap",
      "region": "tobillo",
      "nombre": "Frente de tobillo",
      "categoria": [
        "AP"
      ],
      "tipo": "R",
      "factores": {
        "ri": "24 × 30",
        "dfri": "1 metro",
        "respiracion": null,
        "tecnica": "Homogeneizada 1"
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Perpendicular al RI, dirigido al punto medio entre ambos maléolos."
      },
      "posicion": [
        "Decúbito supino o sentado en la mesa con la pierna extendida, apoyo debajo de la rodilla.",
        "Pierna extendida, pie en flexión dorsal (ángulo de 90°).",
        "Rotar medialmente hasta que se pueda trazar una línea vertical entre el espacio del 4.º y 5.º dedo al centro del talón. Aprox. 15°.",
        "El peroné se encuentra más posterior que la tibia, por esto se realiza la rotación, para ver el espacio articular abierto."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Mortaja abierta y visible.",
            "La posición correcta se manifiesta por la apertura visible de las porciones lateral y medial de la mortaja, con los maléolos de perfil.",
            "Mínima superposición tibia-peroné distal."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "24"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/tobillo-ap.webp",
        "alt": "Imagen de la hoja de Chelo y lámina de placas: Frente de tobillo",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "tobillo-perfil",
      "region": "tobillo",
      "nombre": "Perfil de tobillo",
      "categoria": [
        "Perfil"
      ],
      "tipo": "R",
      "factores": {
        "ri": "24 × 30",
        "dfri": "1 metro",
        "respiracion": null,
        "tecnica": "Homogeneizada 1"
      },
      "rc": {
        "direccion": "sin-dato",
        "texto": "Incide en el maléolo medial."
      },
      "posicion": [
        "Sobre la mesa, decúbito lateral, apoyando el borde externo de la pierna a radiografiar.",
        "Alinear articulación del tobillo con el RC y con el eje del RI.",
        "Flexionar dorsalmente el pie, de manera que la superficie plantar forme un ángulo recto con la pierna.",
        "Incluir mitad proximal de MT y extremo distal de tibia y peroné."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Astrágalo y calcáneo de perfil.",
            "Sin rotación y lateral verdadero ya que veo superposición distal del peroné sobre la tibia.",
            "Articulación tibioastragalina abierta.",
            "También veo cuboides y escafoides."
          ]
        ]
      ],
      "notas": [
        "Factores técnicos: la hoja dice «Igual al frente»."
      ],
      "fuente": {
        "paginas": [
          "25"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/tobillo-perfil.webp",
        "alt": "Imagen de la hoja de Chelo y lámina de placas: Perfil de tobillo",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "pie-ap",
      "region": "pie",
      "nombre": "Frente de pie (AP)",
      "categoria": [
        "AP"
      ],
      "tipo": "R",
      "factores": {
        "ri": "24 × 30 longitudinal",
        "dfri": "1 metro",
        "respiracion": null,
        "parrilla": "No",
        "colimacion": "Colimar sobre los cuatro lados de la región incluyendo todo el pie.",
        "tecnica": "Homogeneizada 1",
        "foco": "Fino"
      },
      "rc": {
        "direccion": "caudal",
        "texto": "Angulado 10 a 15° hacia el talón, incide en base del tercer MT. Nota sobre rayo central: angular compensa la inclinación del arco MT. En el caso que se busque un objeto extraño no se angula.",
        "angulo": "10°-15°"
      },
      "posicion": [
        "En decúbito supino o sentado, con la superficie plantar del pie apoyada plana sobre el RI."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Se deben ver las falanges, los metatarsianos y los huesos cuneiformes, el cuboides y el navicular (o escafoides).",
            "Los bordes de la colimación deben incluir los tejidos blandos.",
            "Posición lograda: eje longitudinal del pie alineado con el RI.",
            "Sin rotación: indicado por una distancia casi igual entre los MT del 2.º al 5.º.",
            "Base del 1.º y 2.º MT generalmente separadas, pero del 2.º a 5.º aparecen superpuestos.",
            "Exposición: márgenes definidos y marcas trabeculares en falanges y tarso. Sesamoideos detrás de la cabeza del 1.er MT."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "31"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/pie-ap.webp",
        "alt": "Lámina de placas: Frente de pie (AP)",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "pie-oblicua",
      "region": "pie",
      "nombre": "Oblicua de pie",
      "categoria": [
        "Oblicuas"
      ],
      "tipo": "R",
      "factores": {
        "ri": "24 × 30 longitudinal",
        "dfri": "1 metro",
        "respiracion": null,
        "parrilla": "No",
        "colimacion": "Colimar sobre los 4 lados de la región incluyendo todo el pie.",
        "tecnica": "Homogeneizada 1",
        "foco": "Fino"
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Perpendicular al RI, incidido en base del 3.er MT."
      },
      "posicion": [
        "Igual al frente.",
        "Alinear eje longitudinal del pie con eje mayor del RI.",
        "Rotar medialmente el pie, hasta formar un ángulo de 30 a 40° con el RI.",
        "Nota: una bóveda plantar más alta requiere una posición oblicua más próxima a 45°, y un pie con bóveda plantar baja (pie plano) requiere un valor más próximo a 30°."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "MT del 3.º al 5.º sin superposición.",
            "Veo cuboides y base del 5.º MT."
          ]
        ]
      ],
      "notas": [
        "Factores técnicos: la hoja dice «Igual que el frente»."
      ],
      "fuente": {
        "paginas": [
          "30a"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/pie-oblicua.webp",
        "alt": "Lámina de placas: Oblicua de pie",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "pie-perfil",
      "region": "pie",
      "nombre": "Perfil de pie",
      "categoria": [
        "Perfil"
      ],
      "tipo": "R",
      "factores": {
        "ri": "24 × 30 longitudinal",
        "dfri": "1 metro",
        "respiracion": null,
        "parrilla": "No",
        "colimacion": "Incluyo todo el pie y 2-3 cm de la articulación del tobillo.",
        "tecnica": "Homogeneizada 1",
        "foco": "Fino"
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Perpendicular al RI, incidido en base del 3.er MT."
      },
      "posicion": [
        "En decúbito lateral, sobre el lado afectado, rodilla flexionada y pierna no afectada hacia atrás para evitar rotación.",
        "Apoyar lado lateral del pie, de manera que el 5.º dedo quede sobre el RI.",
        "MT en el centro de la película."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Pie alineado con el RI.",
            "Los MT casi superpuestos, solo la tuberosidad del 5.º se observa de perfil.",
            "Posición lateral verdadera: veo articulación tibioastragalina abierta y extremo distal del peroné superpuesto a la parte posterior de la tibia."
          ]
        ]
      ],
      "notas": [
        "Factores técnicos: la hoja dice «Igual que F y O»."
      ],
      "fuente": {
        "paginas": [
          "30b"
        ]
      },
      "ilustracion": null,
      "estado": "pendiente-revision"
    }
  ]
};
