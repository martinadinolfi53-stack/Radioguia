Prueba de figura nueva del paciente con la malla base de MakeHuman (CC0, septiembre 2020).
Bajar la malla: curl -o /tmp/claude-0/mh/base.obj https://raw.githubusercontent.com/makehumancommunity/makehuman/master/makehuman/data/3dobjs/base.obj
Targets de forma (CC0) en targets/ (copiar a /tmp/claude-0/mh/t/). Correr con MUSC=0.9 MAGRO=0.35 python3 partes.py; luego python3 rend.py <carpeta>.
Pendiente de aprobación de Martin; todavía no se usa en las ilustraciones.

## Avatar sobre el esqueleto anatómico (herramientas/ilus3d/avatar.py)
1. `cd figura-base && CARA=mandibula2 RAZA=norte PELO=degrade MUSC=0.9 MAGRO=0.35 GUARDAR=../.cache/avatar_reposo.pkl python3 partes.py`
   (necesita base.obj y los targets en /tmp/claude-0/mh: ver arriba).
2. `escena.figura(..., avatar=True)` o `AVATAR=1` en el entorno: la piel del modelo BodyParts3D se reemplaza por el avatar,
   que sigue las mismas transformaciones por segmento (esqueleto default de MakeHuman, CC0, en rig/). Huesos, puntos, RI y
   RC siguen saliendo del modelo anatómico. render_obj.py lo dibuja con luz y contorno (realista) y el rapado pintado.
