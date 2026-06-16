/*  ════════════════════════════════════════════════════════════════
    EVENTSBYYESY · Conexión con Google Calendar (Google Apps Script)
    ════════════════════════════════════════════════════════════════
    Este código va EN TU CUENTA DE GMAIL DEDICADA, no en el sitio.
    Recibe las reservas del sitio y crea el evento en tu Google Calendar.

    CÓMO INSTALARLO (5 minutos, una sola vez):
    1) Inicia sesión en tu Gmail dedicada.
    2) Ve a:  https://script.google.com  -> "Nuevo proyecto".
    3) Borra todo lo que aparezca y PEGA todo este archivo.
    4) (Opcional) En NOTIFY_EMAIL pon tu correo para recibir aviso de
       cada reserva nueva. Déjalo "" si no quieres correos.
    5) Arriba: ícono de engrane "Configuración del proyecto" ->
       Zona horaria -> "America/Los_Angeles". Guarda.
    6) Botón azul "Implementar" (Deploy) -> "Nueva implementación".
         - Tipo:  "Aplicación web" (Web app)
         - Ejecutar como:  "Yo" (tu cuenta)
         - Quién tiene acceso:  "Cualquier usuario" (Anyone)
       -> "Implementar". Acepta los permisos (te pedirá autorizar tu
          cuenta para calendario/correo: dale "Permitir").
    7) Copia la "URL de la aplicación web" (termina en /exec).
    8) Pásamela y yo la pego en el sitio, o pégala tú en index.html en:
            const GCAL_ENDPOINT = "AQUI_LA_URL";
    ¡Listo! Cada reserva aparecerá en el calendario de esa cuenta.
    ════════════════════════════════════════════════════════════════ */

// (Opcional) correo para recibir aviso de cada reserva. Vacío = sin correo.
var NOTIFY_EMAIL = "";

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var cal = CalendarApp.getDefaultCalendar(); // el calendario de esta cuenta

    // Inicio = fecha + hora de montaje ; Fin = fecha + hora de recoger
    var start = new Date(d.fechaEvento + "T" + (d.horaLlegada || "09:00") + ":00");
    var end   = new Date(d.fechaEvento + "T" + (d.horaRecoger || "23:00") + ":00");
    if (isNaN(start.getTime())) start = new Date();                 // por si acaso
    if (isNaN(end.getTime()) || end <= start)
      end = new Date(start.getTime() + 60 * 60 * 1000);            // mínimo 1 hora

    var titulo = (d.tipoEvento || "Evento") + " — " + (d.nombre || "Cliente");
    var desc =
      "Nombre: " + (d.nombre || "") + "\n" +
      "Teléfono: " + (d.telefono || "") + "\n" +
      "Correo: " + (d.correo || "—") + "\n" +
      "Tipo de evento: " + (d.tipoEvento || "") + "\n" +
      "Lugar: " + (d.ciudad || "") + " (" + (d.lugar || "") + ")\n" +
      "Montaje: " + (d.horaLlegada || "—") + "   |   Recoger: " + (d.horaRecoger || "—") + "\n" +
      "Presupuesto: " + (d.presupuesto || "—") + "\n" +
      "Detalles: " + (d.detalles || "—") + "\n\n" +
      "— Reserva desde el sitio Eventsbyyesy —";

    cal.createEvent(titulo, start, end, {
      location: (d.ciudad || "") + " (" + (d.lugar || "") + ")",
      description: desc
    });

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, "Nueva reserva: " + titulo, desc);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Permite probar en el navegador que el Web App está vivo.
function doGet() {
  return ContentService.createTextOutput("Eventsbyyesy endpoint OK");
}
