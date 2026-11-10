// Miembro superior · Enfoques Chelo (resúmenes de clase de un compañero, Técnicas 1).
// Transcripción de las hojas (solo se corrigió la ortografía). «fuente.paginas» = número de hoja (foto) del resumen.
// Sin los enfoques que Chelo rotula «complementario» (pedido de Martin, 9/11/2026).
// Datos que dio Martin donde la hoja no los trae: DFRI 1 m (desfiladero, cadera oblicua, pelvis, cervical frente, C1-C2,
// torácica, lumbar y lumbosacro), columna lumbar = intermedia y «homogeneizada» sin número = homogeneizada 1.
export default {
  "capitulo": 1,
  "titulo": "Miembro superior",
  "paginas": "",
  "regiones": [
    {
      "id": "hombro",
      "nombre": "Hombro",
      "detalle": ""
    },
    {
      "id": "humero",
      "nombre": "Húmero",
      "detalle": "Brazo"
    },
    {
      "id": "codo",
      "nombre": "Codo",
      "detalle": ""
    },
    {
      "id": "antebrazo",
      "nombre": "Antebrazo",
      "detalle": "Radio y cúbito"
    }
  ],
  "proyecciones": [
    {
      "id": "hombro-ap-neutro",
      "region": "hombro",
      "nombre": "Frente de hombro neutro (AP)",
      "categoria": [
        "AP"
      ],
      "tipo": "R",
      "factores": {
        "ri": "24 × 30 transversal o longitudinal para ver más húmero",
        "dfri": "1 metro",
        "respiracion": "Suspendida.",
        "parrilla": "Sí",
        "tecnica": "Homogeneizada 1"
      },
      "rc": {
        "direccion": "caudal",
        "texto": "Angulado 15 a 20 caudal, incide 2 cm debajo de apófisis coracoides.",
        "angulo": "15°-20°"
      },
      "posicion": [
        "Sentado o de pie o decúbito supino, brazo en abducción ligera.",
        "Rotar el tórax lo necesario para apoyar el hombro.",
        "Brazo en posición neutra (generalmente con la palma hacia adentro)."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "2/3 laterales de clavícula.",
            "Porción superior de la escápula.",
            "Relación cabeza humeral con cavidad glenoidea (escapulohumeral).",
            "Espacio subacromial visible.",
            "Cavidad glenoidea de perfil (superposición borde anterior y posterior), sin superposición de la cabeza del húmero.",
            "Espacio de la articulación escapulohumeral abierto.",
            "Tuberosidad mayor (troquíter) parcialmente superpuesta a cabeza de húmero.",
            "Tuberosidad menor (troquín) superpuesta a cabeza de húmero.",
            "Partes blandas del espacio articular y la axila."
          ]
        ]
      ],
      "notas": [
        "Hombro: F, P escapular y desfiladero.",
        "Hombro traumatizado: frente neutro, perfil escapular, transtorácica."
      ],
      "fuente": {
        "paginas": [
          "37"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/hombro-ap-neutro.webp",
        "alt": "Lámina de placas: Frente de hombro neutro (AP)",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "hombro-ap-rotaciones",
      "region": "hombro",
      "nombre": "Frente de hombro en rotación externa e interna (AP)",
      "categoria": [
        "AP"
      ],
      "tipo": "R",
      "factores": {
        "ri": "24 × 30 transversal o longitudinal para ver más húmero",
        "dfri": "1 metro",
        "respiracion": null,
        "parrilla": "Sí",
        "tecnica": "Homogeneizada 1"
      },
      "rc": {
        "direccion": "sin-dato",
        "texto": "Chelo no anota el rayo central en esta hoja."
      },
      "posicion": [
        "Externa: rotación externa del brazo hasta que la mano esté en supinación y epicóndilos paralelos al RI.",
        "Interna: rotación interna del brazo hasta que la mano esté en pronación y los epicóndilos perpendiculares al RI."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Externo: se ve el tubérculo mayor completo y de perfil en la zona lateral; el tubérculo menor superpuesto a la cabeza del húmero.",
            "Interno: se ve el tubérculo menor completo y de perfil en la zona medial; tubérculo mayor superpuesto a la cabeza del húmero."
          ]
        ]
      ],
      "notas": [
        "Hombro doloroso: frente externo, frente interno, desfiladero.",
        "Factores técnicos: la hoja dice «Igual que el frente neutro»."
      ],
      "fuente": {
        "paginas": [
          "35"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/hombro-ap-rotaciones.webp",
        "alt": "Lámina de placas: Frente de hombro en rotación externa e interna (AP)",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "hombro-perfil-escapular",
      "region": "hombro",
      "nombre": "Perfil escapular de hombro",
      "categoria": [
        "Perfil"
      ],
      "tipo": "R",
      "factores": {
        "ri": "24 × 30 transversal o longitudinal para ver más húmero",
        "dfri": "1 metro",
        "respiracion": null,
        "parrilla": "Sí",
        "tecnica": "Homogeneizada 1"
      },
      "rc": {
        "direccion": "caudal",
        "texto": "Rayo incidente: angulado 15-20 caudal, incidido en la mitad del borde medial de la escápula.",
        "angulo": "15°-20°"
      },
      "posicion": [
        "De la posición PA rotamos al paciente, dejando el hombro a radiografiar contra el RI.",
        "Rotación entre 45 grados y 60.",
        "Brazo no afectado arriba por delante del paciente."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Proyección lateral verdadera de la escápula, húmero proximal.",
            "Se ve el delgado cuerpo de la escápula de frente, sin superposición de costillas."
          ]
        ]
      ],
      "notas": [
        "Factores técnicos: la hoja dice «PA. Igual que el frente neutro pero cambia el rayo incidente»."
      ],
      "fuente": {
        "paginas": [
          "36"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/hombro-perfil-escapular.webp",
        "alt": "Lámina de placas: Perfil escapular de hombro",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "hombro-desfiladero",
      "region": "hombro",
      "nombre": "Desfiladero de hombro",
      "categoria": [
        "Perfil"
      ],
      "tipo": "R",
      "factores": {
        "ri": null,
        "dfri": "1 metro",
        "respiracion": null,
        "tecnica": null
      },
      "rc": {
        "direccion": "caudal",
        "texto": "Angular 10 a 15 grados caudal para ver mejor el espacio acromiohumeral (salida del supraespinoso). Rayo central en la cabeza humeral, borde superior.",
        "angulo": "10°-15°"
      },
      "posicion": [
        "Similar al perfil escapular.",
        "El paciente debe tener un poco más de rotación."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Queda abierta la región de la salida del supraespinoso.",
            "Se ve el delgado cuerpo de la escápula de frente, cabeza de húmero debajo de la salida del supraespinoso."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "34"
        ]
      },
      "ilustracion": null,
      "estado": "pendiente-revision"
    },
    {
      "id": "humero-ap",
      "region": "humero",
      "nombre": "Frente de húmero (AP)",
      "categoria": [
        "AP"
      ],
      "tipo": "R",
      "factores": {
        "ri": "35 × 43 longitudinal",
        "dfri": "1 metro",
        "respiracion": null,
        "parrilla": "Si el grosor es > 10",
        "colimacion": "A los 4 lados, incluyendo articulación de codo y hombro.",
        "tecnica": "Homogeneizada 1",
        "foco": "Fino"
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Perpendicular al RI, incide en la mitad del húmero."
      },
      "posicion": [
        "Erguido o decúbito supino, húmero alineado al eje largo del RI, salvo que tenga que usarlo transversal.",
        "Abducir el brazo ligeramente, mano supinada, epicóndilos paralelos."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Se ve húmero completo más articulación de codo y glenohumeral.",
            "Sin rotación: se ve epicóndilo medial y lateral de perfil, tubérculo mayor de perfil lateralmente.",
            "Cabeza de húmero y cavidad glenoidea."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "39"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/humero-ap.webp",
        "alt": "Lámina de placas: Frente de húmero (AP)",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "humero-perfil",
      "region": "humero",
      "nombre": "Perfil de húmero",
      "categoria": [
        "Perfil"
      ],
      "tipo": "R",
      "factores": {
        "ri": "35 × 43 longitudinal",
        "dfri": "1 metro",
        "respiracion": null,
        "parrilla": "Si el grosor es > 10",
        "colimacion": "A los 4 lados, incluyendo articulación de codo y hombro.",
        "tecnica": "Homogeneizada 1",
        "foco": "Fino"
      },
      "rc": {
        "direccion": "sin-dato",
        "texto": "Chelo no anota el rayo central en esta hoja."
      },
      "posicion": [
        "Puede ser en AP o PA.",
        "Erguida, PA: codo flexionado 90 grados; paciente rotado 15-20 grados para que el húmero haga contacto con el receptor.",
        "Erguida o decúbito supino, AP: codo ligeramente flexionado; palma mirando hacia atrás."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "PA: epicóndilos superpuestos.",
            "Se ve la trabeculación ósea nítida, sin movimiento."
          ]
        ]
      ],
      "notas": [
        "Factores técnicos: la hoja dice «Igual que el frente»."
      ],
      "fuente": {
        "paginas": [
          "38"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/humero-perfil.webp",
        "alt": "Lámina de placas: Perfil de húmero",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "codo-ap",
      "region": "codo",
      "nombre": "Frente de codo (AP)",
      "categoria": [
        "AP"
      ],
      "tipo": "R",
      "factores": {
        "ri": "24 × 30 longitudinal",
        "dfri": "1 metro",
        "respiracion": null,
        "parrilla": "No",
        "colimacion": "Incluir toda la articulación del codo.",
        "tecnica": "Homogeneizada 1",
        "foco": "Fino"
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Perpendicular, centrado en la porción media de la articulación del codo."
      },
      "posicion": [
        "Codo extendido, mano supinada.",
        "Si no se puede extender del todo el codo, debemos hacer dos proyecciones AP: una con el RC perpendicular al húmero y otra perpendicular al antebrazo.",
        "Epicóndilos paralelos, equidistantes al RI."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Ligera superposición de radio y cúbito proximales.",
            "Epicóndilos humerales de perfil.",
            "Húmero distal, radio y cúbito proximales.",
            "Si no puede extender del todo: 1/3 distal del húmero; 1/3 proximal del antebrazo; el resto igual que con la extensión completa."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "41"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/codo-ap.webp",
        "alt": "Lámina de placas: Frente de codo (AP)",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "codo-perfil",
      "region": "codo",
      "nombre": "Perfil de codo",
      "categoria": [
        "Perfil"
      ],
      "tipo": "R",
      "factores": {
        "ri": "24 × 30 longitudinal",
        "dfri": "1 metro",
        "respiracion": null,
        "parrilla": "No",
        "colimacion": "Articulación del codo; incluir al menos 5 cm de antebrazo y húmero.",
        "tecnica": "Homogeneizada 1",
        "foco": "Fino"
      },
      "rc": {
        "direccion": "sin-dato",
        "texto": "Chelo no anota el rayo central en esta hoja."
      },
      "posicion": [
        "Codo flexionado 90 grados.",
        "Centrar el codo en el centro del RI."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Se debe ver radio y cúbito proximales, húmero distal y región de las almohadillas grasas de la articulación.",
            "Olécranon / escotadura troclear de perfil.",
            "Epicóndilos humerales superpuestos.",
            "Se ven partes blandas y trabeculación ósea."
          ]
        ]
      ],
      "notas": [
        "Factores técnicos: la hoja dice «Igual que el frente»."
      ],
      "fuente": {
        "paginas": [
          "40"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/codo-perfil.webp",
        "alt": "Lámina de placas: Perfil de codo",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "antebrazo-ap",
      "region": "antebrazo",
      "nombre": "Frente de antebrazo (AP)",
      "categoria": [
        "AP"
      ],
      "tipo": "R",
      "factores": {
        "ri": "35 × 43 longitudinal",
        "dfri": "1 metro",
        "respiracion": null,
        "parrilla": "No",
        "colimacion": "Incluir toda la región más porción distal de húmero y puño (2,5 cm).",
        "tecnica": "Homogeneizada 1",
        "foco": "Fino"
      },
      "rc": {
        "direccion": "perpendicular",
        "texto": "Perpendicular al RI (receptor de imagen), en zona media del antebrazo."
      },
      "posicion": [
        "Sentado en el extremo de la mesa, brazo extendido y mano supinada.",
        "El antebrazo y codo deben estar en una posición de AP verdadera (ambos epicóndilos deben estar a la misma distancia del receptor)."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Epicóndilos humerales vistos de perfil, con la cabeza, el cuello y la tuberosidad radial ligeramente superpuesta por el cúbito.",
            "Se ven partes blandas y trabeculación ósea."
          ]
        ]
      ],
      "fuente": {
        "paginas": [
          "43"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/antebrazo-ap.webp",
        "alt": "Lámina de placas: Frente de antebrazo (AP)",
        "verificada": true
      },
      "estado": "pendiente-revision"
    },
    {
      "id": "antebrazo-perfil",
      "region": "antebrazo",
      "nombre": "Perfil de antebrazo",
      "categoria": [
        "Perfil"
      ],
      "tipo": "R",
      "factores": {
        "ri": "35 × 43 longitudinal",
        "dfri": "1 metro",
        "respiracion": null,
        "parrilla": "No",
        "colimacion": "Incluir toda la región más porción distal de húmero y puño (2,5 cm).",
        "tecnica": "Homogeneizada 1",
        "foco": "Fino"
      },
      "rc": {
        "direccion": "sin-dato",
        "texto": "Chelo no anota el rayo central en esta hoja."
      },
      "posicion": [
        "Paciente sentado en el extremo de la mesa.",
        "Codo flexionado 90 grados.",
        "Radio y cúbito distales deben estar superpuestos directamente."
      ],
      "criterios": [
        [
          "Criterios de evaluación",
          [
            "Epicóndilos humerales superpuestos.",
            "Se ven partes blandas y trabeculación ósea del túnel carpiano."
          ]
        ]
      ],
      "notas": [
        "Factores técnicos: la hoja dice «Igual que el frente»."
      ],
      "fuente": {
        "paginas": [
          "42"
        ]
      },
      "ilustracion": {
        "src": "ilustraciones/chelo/antebrazo-perfil.webp",
        "alt": "Lámina de placas: Perfil de antebrazo",
        "verificada": true
      },
      "estado": "pendiente-revision"
    }
  ]
};
