#!/bin/sh
# Prepara lo necesario para generar las figuras del modelo anatómico (no se sube al repositorio):
#  - el modelo BodyParts3D 4.0 (© DBCLS, CC BY 4.0) empaquetado en npm por @dagno/anatomy-model
#  - Blender como módulo de Python (bpy) para renderizar, y scipy/numpy/pillow
set -e
cd "$(dirname "$0")"
if [ ! -d .modelo/package ]; then
  mkdir -p .modelo && (cd .modelo && npm pack @dagno/anatomy-model@0.1.2 >/dev/null && tar xzf dagno-anatomy-model-0.1.2.tgz && rm dagno-anatomy-model-0.1.2.tgz)
fi
python3 -m pip install -q scipy numpy pillow
BPY="${RADIOGUIA_BPY:-/tmp/claude-0/sp/bpyenv}"
[ -d "$BPY/bpy" ] || python3 -m pip install -q --target "$BPY" bpy
echo "Listo. Modelo en .modelo/, bpy en $BPY"
