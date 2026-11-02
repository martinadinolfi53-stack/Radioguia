// Mudanza de RadioGuía: de GitHub Pages (martinadinolfi53-stack.github.io/Radioguia) a Firebase Hosting (app-rx-188a6.web.app).
// En el sitio nuevo el ingreso con Google funciona también en el iPhone con la app instalada.
//
// Cada sitio guarda sus datos aparte (favoritos, repaso, la cuenta del celular), así que la mudanza los lleva:
//  - en el sitio viejo, junta lo de RadioGuía (localStorage "radioguia.*") y la sesión de Firebase, y abre el nuevo con
//    todo eso en "#mudanza=..." (lo que va después de # no viaja a ningún servidor: queda en el navegador);
//  - en el sitio nuevo, antes de que arranque la app, lo copia si este navegador todavía no tiene nada y borra el
//    "#mudanza" de la dirección.
// Script clásico (no módulo): corre antes que js/main.js, así la app ya arranca con los datos copiados.
(function () {
  // Interruptor: mientras esté en false el sitio viejo sigue funcionando igual que siempre.
  // Se pasa a true recién cuando el sitio nuevo esté publicado y probado.
  var MUDANZA_ACTIVA = false;
  var NUEVA = "https://app-rx-188a6.web.app/";
  var MARCA = "#mudanza=";

  var viejo = /(^|\.)github\.io$/.test(location.hostname);
  if (!viejo) { if (location.hash.indexOf(MARCA) === 0) importar(); return; }
  if (!MUDANZA_ACTIVA) return;

  // la app vieja no arranca (js/main.js espera esta marca)
  window.RG_MUDANDO = true;
  var instalada = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  armarLink().then(function (url) {
    // en el navegador se pasa directo al sitio nuevo; la app instalada no puede cambiar de sitio sola: se explica cómo reinstalarla
    if (!instalada) location.replace(url);
    else pantalla(url);
  });

  function armarLink() {
    var datos = { v: 1, hash: location.hash || "", ls: {}, auth: null };
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        // la foto grande pesa mucho y vuelve sola desde la cuenta
        if (k.indexOf("radioguia.") === 0 && k !== "radioguia.foto.grande") datos.ls[k] = localStorage.getItem(k);
      }
    } catch (e) {}
    return sesionFirebase().then(function (a) {
      datos.auth = a;
      return NUEVA + MARCA + aBase64(JSON.stringify(datos));
    });
  }

  // la sesión de Firebase está en IndexedDB (base "firebaseLocalStorageDb"); se lee sin cargar Firebase
  function sesionFirebase() {
    return new Promise(function (ok) {
      var listo = function (v) { clearTimeout(t); ok(v); };
      var t = setTimeout(function () { ok(null); }, 3000);
      try {
        var pedido = indexedDB.open("firebaseLocalStorageDb");
        pedido.onupgradeneeded = function () { pedido.transaction.abort(); };
        pedido.onerror = function () { listo(null); };
        pedido.onsuccess = function () {
          var db = pedido.result;
          try {
            var todo = db.transaction("firebaseLocalStorage", "readonly").objectStore("firebaseLocalStorage").getAll();
            todo.onsuccess = function () {
              var f = (todo.result || []).filter(function (x) { return x && /^firebase:authUser:/.test(x.fbase_key); })[0];
              db.close();
              listo(f ? { clave: f.fbase_key, valor: f.value } : null);
            };
            todo.onerror = function () { db.close(); listo(null); };
          } catch (e) { db.close(); listo(null); }
        };
      } catch (e) { listo(null); }
    });
  }

  function pantalla(url) {
    var dibujar = function () {
      var app = document.getElementById("app");
      app.innerHTML =
        '<main class="portada ident" style="text-align:left">' +
        '<p class="portada-rx">RX</p>' +
        "<h1 style=\"font-size:1.3rem;margin:0 0 8px\">RadioGuía tiene dirección nueva</h1>" +
        "<p>Ahora está en <b>app-rx-188a6.web.app</b>. Ahí se puede entrar con Google también desde la app instalada.</p>" +
        "<ol style=\"padding-left:20px;line-height:1.5\">" +
        "<li>Tocá el botón de abajo: se abre la dirección nueva en el navegador, con tus favoritos, tu progreso y tu cuenta.</li>" +
        "<li>Ahí tocá <b>Compartir</b> y después <b>Agregar a inicio</b>.</li>" +
        "<li>Abrí la RadioGuía nueva desde la pantalla de inicio y borrá este ícono viejo.</li>" +
        "</ol>" +
        '<a class="ident-google" style="display:block;text-align:center;text-decoration:none" target="_blank" rel="noopener"></a>' +
        "<small class=\"ident-nota\">Si en la app nueva no aparecen tus datos, entrá con Google: tus grupos, tus puntos y tus favoritos están guardados en tu cuenta.</small>" +
        "</main>";
      var a = app.querySelector("a");
      a.href = url;
      a.textContent = "Abrir la RadioGuía nueva";
    };
    if (document.getElementById("app")) dibujar(); else document.addEventListener("DOMContentLoaded", dibujar);
  }

  function importar() {
    try {
      var datos = JSON.parse(deBase64(location.hash.slice(MARCA.length)));
      // si este navegador ya usa la app nueva, no se pisa nada
      if (datos && datos.v === 1 && !localStorage.getItem("radioguia.nombre")) {
        for (var k in datos.ls) if (k.indexOf("radioguia.") === 0 && localStorage.getItem(k) === null) localStorage.setItem(k, datos.ls[k]);
        // Firebase busca la sesión primero en IndexedDB y después en localStorage; si la encuentra acá la pasa sola a IndexedDB
        if (datos.auth && /^firebase:authUser:/.test(datos.auth.clave)) localStorage.setItem(datos.auth.clave, JSON.stringify(datos.auth.valor));
      }
      history.replaceState(null, "", location.pathname + location.search + (datos && /^#[^#]*$/.test(datos.hash) && datos.hash.indexOf(MARCA) !== 0 ? datos.hash : ""));
    } catch (e) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  // base64 apta para direcciones, con acentos y eñes
  function aBase64(s) {
    var bytes = new TextEncoder().encode(s), bin = "";
    for (var i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function deBase64(s) {
    var bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
})();
