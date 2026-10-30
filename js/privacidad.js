// Qué datos guarda RadioGuía (#privacidad). Se puede ver sin identificarse, desde la pantalla de entrada y desde Ajustes.
import { cabecera } from "./util.js";

export function vistaPrivacidad(atras) {
  return cabecera({ titulo: "Tus datos", atras }) + `
  <main class="wrap privacidad">
    <section class="panel"><h2>Qué recibe RadioGuía</h2>
      <p>Si entrás con Google, RadioGuía recibe tu nombre, tu email y tu foto de Google. Nunca ve tu contraseña: la escribís en la página de Google. No tiene acceso a tu correo, tu Drive, tus fotos ni tus contactos.</p>
      <p>Si entrás solo con un apodo, RadioGuía no recibe ningún dato de tu cuenta de Google.</p></section>
    <section class="panel"><h2>Qué se guarda y quién lo ve</h2>
      <ul>
        <li><b>Tu apodo y tu foto de perfil:</b> los ven los compañeros de los grupos a los que te unís, en el ranking.</li>
        <li><b>Tus partidas del desafío</b> (puntos, aciertos y qué preguntas fallaste): las ven los miembros del grupo; las estadísticas de dificultad, quien creó el grupo.</li>
        <li><b>Tu email:</b> no lo ve ningún otro usuario. Queda en la cuenta de Firebase, a la que solo accede el administrador de RadioGuía.</li>
        <li><b>Favoritos, listas y progreso del repaso:</b> solo en este celular.</li>
        <li><b>Las preguntas que reportás</b> en el repaso las lee solo el administrador, para corregirlas.</li>
      </ul>
      <p>Los datos se guardan en Firebase (Google Cloud). No se venden ni se comparten con nadie más, y la app no usa publicidad ni rastreadores.</p></section>
    <section class="panel"><h2>Cómo borrarlos</h2>
      <p>En Ajustes › Tu cuenta, «Borrar mi cuenta y mis datos» borra tu perfil, tu foto, tu lugar en cada grupo y la cuenta. Tus partidas pasadas quedan en el ranking del grupo como «Cuenta borrada».</p>
      <p>Cerrar la sesión borra de este celular la copia de los datos de la cuenta.</p></section>
  </main>`;
}
