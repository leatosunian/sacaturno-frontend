/**
 * Contenido del centro de ayuda (/admin/ayuda).
 *
 * Es data, no JSX, para que la página server pueda filtrarla por rol y plan
 * antes de mandarla al cliente. Las capturas viven en /public/ayuda.
 *
 * Al tocar un flujo del panel hay que actualizar la sección correspondiente acá
 * Y el modal de ayuda que la duplica: GuideDialog (primeros pasos), HelpModal
 * (cómo cargo turnos) y TutorialAutomateModal (agenda automática).
 */

export type Audience = "owner" | "employee" | "all";

/** Plan mínimo que habilita la función. `null` = disponible en todos. */
export type PlanGate = "SC_PRO" | "SC_FULL" | "paid" | null;

export type Block =
  | { k: "p"; text: string }
  | { k: "list"; items: string[] }
  | { k: "steps"; items: { title: string; text: string; tip?: string }[] }
  /** `size: "modal"` acota el ancho: las capturas de diálogos se ven mal a todo lo ancho. */
  | { k: "img"; src: string; alt: string; caption?: string; size?: "modal" }
  | { k: "tip"; text: string }
  | { k: "warn"; text: string }
  | { k: "table"; head: string[]; rows: string[][] }
  | { k: "route"; href: string; label: string };

export interface Topic {
  id: string;
  title: string;
  audience: Audience;
  plan?: PlanGate;
  /** Términos extra para el buscador que no están en el texto visible. */
  keywords?: string[];
  blocks: Block[];
}

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  audience: Audience;
  topics: Topic[];
}

export const HELP: Chapter[] = [
  /* ══════════════════════════════════════════════════════════════════
     1. PRIMEROS PASOS
     ══════════════════════════════════════════════════════════════════ */
  {
    id: "primeros-pasos",
    title: "Primeros pasos",
    summary: "Qué hace SacaTurno y cómo dejarlo funcionando de punta a punta.",
    audience: "all",
    topics: [
      {
        id: "que-es",
        title: "Cómo funciona SacaTurno",
        audience: "all",
        keywords: ["empezar", "arrancar", "concepto", "para qué sirve"],
        blocks: [
          {
            k: "p",
            text: "SacaTurno reemplaza el ida y vuelta de mensajes para coordinar un turno. Vos publicás cuándo estás disponible, tus clientes reservan solos desde un link, y cada reserva aparece en tu agenda sin que tengas que hacer nada.",
          },
          {
            k: "p",
            text: "El circuito completo tiene cuatro piezas, y conviene tenerlas claras porque el resto del manual gira alrededor de ellas:",
          },
          {
            k: "list",
            items: [
              "Tu empresa — tus datos y, sobre todo, tu link público de reservas.",
              "Tus servicios — lo que ofrecés, con precio y duración. Es lo que el cliente elige.",
              "Tu agenda — los turnos disponibles. Podés automatizar la creación de una plantilla de turnos semanal o cargarlos a mano: podés usar una u otra o combinar ambas.",
              "Tu equipo — quién atiende cada turno. Podés ser vos solo o un equipo con sucursales.",
            ],
          },
          {
            k: "tip",
            text: "Si querés el camino más corto: creá la empresa, cargá un servicio, activá la agenda automática y compartí tu link. Con eso ya estás recibiendo reservas.",
          },
        ],
      },
      {
        id: "crear-cuenta",
        title: "Crear tu cuenta e iniciar sesión",
        audience: "all",
        keywords: ["registro", "registrarse", "google", "contraseña", "login"],
        blocks: [
          {
            k: "p",
            text: "Podés registrarte con email y contraseña, o directamente con tu cuenta de Google. Si elegís Google no tenés que crear ni recordar una contraseña.",
          },
          {
            k: "p",
            text: "Si te olvidaste la contraseña, en la pantalla de login tenés el enlace de recuperación: te llega un correo con un link para definir una nueva. Ese link vence, así que si tardás en usarlo pedí uno nuevo.",
          },
          {
            k: "warn",
            text: "Si te registraste con Google, configurá una contraseña también. Si algún día querés entrar sin Google o perdiste tu cuenta, vas a necesitarla como alternativa para acceder a tu cuenta de SacaTurno.",
          },
        ],
      },
      /*{
        id: "elegir-contexto",
        title: "Elegir con qué perfil entrás",
        audience: "all",
        keywords: ["select context", "contexto", "perfil", "dueño", "empleado"],
        blocks: [
          {
            k: "p",
            text: "Una misma cuenta puede tener más de un perfil: por ejemplo, si sos dueño de tu negocio y además trabajás como empleado en otro. Cuando pasa eso, al iniciar sesión aparece la pantalla «Iniciá sesión como».",
          },
          {
            k: "p",
            text: "Elegís con cuál entrar y el panel se arma para ese perfil. Para cambiar de perfil, cerrá sesión y volvé a entrar.",
          },
          {
            k: "tip",
            text: "Si tenés un solo perfil no vas a ver esta pantalla nunca: el sistema entra directo.",
          },
        ],
      },*/
      {
        id: "crear-empresa",
        title: "Crear tu empresa",
        audience: "owner",
        keywords: ["negocio", "alta", "primer paso"],
        blocks: [
          {
            k: "steps",
            items: [
              {
                title: "Cargá el nombre y el rubro",
                text: "El rubro se elige en dos niveles: primero una categoría (Salud, Estética, Fitness, Mascotas, Servicios, Educación u Otros) y después una especialidad dentro de esa categoría.",
                tip: "El rubro define cómo te encuentran tus clientes en la búsqueda pública, así que elegí el que mejor describa lo que hacés.",
              },
              {
                title: "Completá el contacto y la dirección",
                text: "Teléfono, email y domicilio (opcional). La dirección tiene que estar completa —calle, altura, ciudad y provincia—; si falta algo el sistema no te deja guardar.",
              },
              {
                title: "Definí tu link público",
                text: 'Es la dirección que vas a compartir con tus clientes, del estilo " sacaturno.com.ar/tu-negocio ". Tiene que ser único: si ya está tomado, el sistema te avisa y probás con otro.',
                tip: "Elegí un nombre corto y fácil de recordar. Podés copiarlo y pegarlo en tu biografía de Instagram, en WhatsApp y en tu ficha de Google.",
              },
            ],
          },
          {
            k: "route",
            href: "/admin/business/create",
            label: "Crear mi empresa",
          },
        ],
      },
      {
        id: "recorrido-panel",
        title: "Recorrido por el panel",
        audience: "all",
        keywords: ["menú", "sidebar", "navegación", "secciones", "inicio"],
        blocks: [
          {
            k: "p",
            text: "El panel de inicio te da la foto del día apenas entrás: cuántos turnos te quedan por delante en el día, cuántos hay reservados en la semana y el mes, los ingresos, accesos rápidos y el listado de los turnos de hoy en orden.",
          },
          {
            k: "img",
            src: "/ayuda/panel-inicio.webp",
            alt: "Panel de inicio con el resumen del día, accesos rápidos y los turnos de hoy",
            caption:
              "El panel de inicio de un dueño con Plan Full. El menú de la izquierda cambia según tu plan y tu rol.",
          },
          {
            k: "p",
            text: "El menú de la izquierda está agrupado por tema: Agenda, Mi empresa, Servicios, Mi equipo, Métricas e Integraciones. Abajo del todo tenés tu plan actual y el menú de tu cuenta, donde están tu perfil, historial de facturación y el botón de cerrar sesión.",
          },
          {
            k: "warn",
            text: "No todos ven el mismo menú. Las secciones aparecen o desaparecen según tu plan y, si sos empleado, según los permisos que te haya dado el dueño. Si buscás algo y no lo encontrás, revisá el punto 10: 'Por qué no veo una sección'.",
          },
          {
            k: "p",
            text: "Desde el celular el menú se abre con el botón de la esquina superior. Todo el panel funciona en el teléfono, incluido el calendario.",
          },
        ],
      },
      {
        id: "checklist",
        title: "Paso a paso para dejar tu agenda lista",
        audience: "owner",
        keywords: [
          "empezar",
          "configuración inicial",
          "lista",
          "checklist",
          "puesta en marcha",
          "primera reserva",
          "arrancar de cero",
        ],
        blocks: [
          {
            k: "p",
            text: "Estos son los siete pasos que van de la cuenta recién creada a la primera reserva de un cliente. Los cinco primeros son los que te dejan operativo; los dos últimos son opcionales y podés sumarlos cuando los necesites.",
          },
          {
            k: "p",
            text: "El orden no es caprichoso: cada paso necesita el anterior. No podés cargar un servicio sin haber creado la empresa, ni armar la agenda sin tener al menos un servicio, porque cada turno es siempre un servicio en un horario.",
          },
          {
            k: "steps",
            items: [
              {
                title: "Creá tu empresa",
                text: "Cargá el nombre, el rubro, el contacto y la dirección. Al terminar tenés tu link público de reservas, que es la dirección donde van a entrar tus clientes.",
                tip: "Paso necesario para continuar.",
              },
              {
                title: "Cargá tus servicios",
                text: "Creá al menos uno, con su precio y su duración. Son las opciones que va a ver el cliente al reservar, y la duración define cuánto ocupa el turno en tu agenda.",
                tip: "Paso necesario para continuar.",
              },
              {
                title: "Definí tu política de cancelación",
                text: "Elegís hasta cuándo un cliente puede cancelar por su cuenta, sin escribirte. Está en la configuración de la empresa.",
                tip: "Paso necesario para continuar.",
              },
              {
                title: "Armá tu agenda",
                text: "Acá publicás tus horarios disponibles. Lo más práctico es la agenda automática: configurás una semana tipo una sola vez y el sistema crea y renueva los turnos solo.",
              },
              {
                title: "Compartí tu link",
                text: "Pasalo por WhatsApp, ponelo en tu perfil de Instagram y en tu ficha de Google. Es la única puerta de entrada de las reservas: sin compartirlo, nadie puede reservarte.",
              },
              {
                title: "Vinculá Mercado Pago",
                text: "Opcional. Solo hace falta si vas a cobrar una seña al momento de reservar. Sin la cuenta vinculada, el campo de seña de tus servicios no funciona.",
              },
              {
                title: "Sumá a tu equipo",
                text: "Opcional. Activá «Mostrarme como prestador» para que tus clientes puedan elegirte a vos, y si tenés plan Pro o Full invitá a tus empleados.",
              },
            ],
          },
          {
            k: "tip",
            text: "Los pasos 6 y 7 los podés dejar para más adelante y sumarlos cuando los necesites. Con los cinco primeros ya estás recibiendo turnos.",
          },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     2. TU EMPRESA
     ══════════════════════════════════════════════════════════════════ */
  {
    id: "empresa",
    title: "Tu empresa",
    summary: "Datos, link público, política de cancelación y sucursales.",
    audience: "owner",
    topics: [
      {
        id: "configuracion",
        title: "Configuración de la empresa",
        audience: "owner",
        keywords: ["datos", "identidad", "rubro", "dirección", "logo"],
        blocks: [
          {
            k: "p",
            text: "La pantalla de configuración está dividida en tres bloques: Identidad, Contacto y link público, y Política de cancelación.",
          },
          {
            k: "img",
            src: "/ayuda/empresa-config.webp",
            alt: "Pantalla de configuración de la empresa con los bloques de identidad, contacto y política de cancelación",
          },
          {
            k: "p",
            text: "En Identidad cargás el nombre, el logo y el rubro. El logo se ve en tu página pública de reservas y en los correos que reciben tus clientes: aceptamos JPG, PNG o WebP de hasta 5 MB.",
          },
          {
            k: "p",
            text: "En Contacto y link público van el teléfono, el email y el domicilio completo. Acordate de tocar «Guardar cambios» al final: si salís sin guardar, se pierde todo.",
          },
          { k: "route", href: "/admin/business", label: "Ir a Configuración" },
        ],
      },
      {
        id: "link-publico",
        title: "Tu link público de reservas",
        audience: "owner",
        keywords: [
          "slug",
          "url",
          "compartir",
          "whatsapp",
          "instagram",
          "página",
        ],
        blocks: [
          {
            k: "p",
            text: "Es la pieza más importante de todas: la dirección donde tus clientes entran a reservar. Tiene la forma sacaturno.com.ar/tu-negocio y la definís vos.",
          },
          {
            k: "p",
            text: "Desde la configuración tenés el botón «Copiar link» para copiarla al portapapeles, y «Ver página pública» para abrirla y ver exactamente lo que ve un cliente.",
          },
          {
            k: "tip",
            text: "Ponelo en la biografía de Instagram, en el estado de WhatsApp y en tu ficha de Google. Es el único lugar por donde entran las reservas.",
          },
          {
            k: "warn",
            text: "Si cambiás el link después de haberlo compartido, el anterior deja de funcionar y quien lo tenga guardado no va a poder reservar. Cambialo solo si es necesario.",
          },
        ],
      },
      {
        id: "politica-cancelacion",
        title: "Política de cancelación",
        audience: "owner",
        keywords: ["cancelar", "anticipación", "reembolso", "seña"],
        blocks: [
          {
            k: "p",
            text: "Acá definís hasta cuándo un cliente puede cancelar su turno por su cuenta, sin escribirte. Las opciones van desde «sin restricción» hasta «hasta 72 horas antes».",
          },
          {
            k: "img",
            src: "/ayuda/empresa-cancelacion.webp",
            alt: "Bloque de política de cancelación con el desplegable de anticipación",
          },
          {
            k: "table",
            head: ["Opción", "Qué significa"],
            rows: [
              [
                "Sin restricción",
                "El cliente puede cancelar en cualquier momento, incluso sobre la hora.",
              ],
              [
                "Hasta 2, 6 o 12 horas antes",
                "Margen corto. Sirve para servicios cortos y alta rotación.",
              ],
              [
                "Hasta 24 horas antes",
                "El más habitual. Te da un día para reubicar el turno.",
              ],
              [
                "Hasta 48 o 72 horas antes",
                "Para servicios largos o caros, donde una ausencia afecta más.",
              ],
            ],
          },
          {
            k: "warn",
            text: "Con las señas la regla es distinta según quién cancela. Si cancela el cliente, la seña no se reembolsa: queda para vos. Si cancelás vos o un empleado desde la agenda, se le devuelve automáticamente por Mercado Pago.",
          },
        ],
      },
      {
        id: "sucursales",
        title: "Sucursales",
        audience: "owner",
        plan: "SC_PRO",
        keywords: ["locales", "direcciones", "sedes"],
        blocks: [
          {
            k: "p",
            text: "Si atendés en más de una dirección, cada una es una sucursal. El cliente ve a qué sucursal corresponde el turno que está reservando, y cada empleado se asigna a una o varias.",
          },
          {
            k: "img",
            src: "/ayuda/empresa-sucursales.webp",
            alt: "Listado de sucursales de la empresa",
          },
          {
            k: "p",
            text: "Para crear una tocá «Nueva sucursal» y cargá el nombre, la dirección y el teléfono. El nombre es el que ven tus clientes, así que conviene algo reconocible: el barrio suele funcionar mejor que un código interno.",
          },
          {
            k: "img",
            src: "/ayuda/sucursal-nueva.webp",
            size: "modal",
            alt: "Formulario de creación de una sucursal",
          },
          {
            k: "warn",
            text: "Cada empleado tiene que estar asignado al menos a una sucursal. Si intentás dejar a alguien sin ninguna, el sistema no te deja guardar.",
          },
          {
            k: "table",
            head: ["Plan", "Sucursales"],
            rows: [
              ["Prueba y Básico", "No disponible"],
              ["Pro", "Hasta 3"],
              ["Full", "Hasta 5"],
            ],
          },
          {
            k: "route",
            href: "/admin/business/branches",
            label: "Ir a Sucursales",
          },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     3. SERVICIOS
     ══════════════════════════════════════════════════════════════════ */
  {
    id: "servicios",
    title: "Servicios",
    summary:
      "Lo que tus clientes pueden reservar, con precio, duración y seña.",
    audience: "all",
    topics: [
      {
        id: "crear-servicio",
        title: "Crear un servicio",
        audience: "all",
        keywords: ["precio", "duración", "alta", "nuevo"],
        blocks: [
          {
            k: "p",
            text: "Los servicios son las opciones que ve el cliente al reservar. Necesitás al menos uno para poder crear turnos.",
          },
          {
            k: "img",
            src: "/ayuda/servicios-lista.webp",
            alt: "Listado de servicios con precio, duración, seña y prestadores",
            caption:
              "Cada tarjeta muestra el precio, la duración, la seña si tiene, y quiénes lo prestan.",
          },
          {
            k: "steps",
            items: [
              {
                title: "Tocá «Nuevo servicio»",
                text: "Se abre el formulario de alta.",
              },
              {
                title: "Ponele nombre y descripción",
                text: "La descripción la lee el cliente antes de reservar: es un buen lugar para aclarar qué incluye.",
              },
              {
                title: "Cargá el precio y la duración",
                text: "La duración define cuánto ocupa el turno en tu agenda.",
              },
              {
                title: "Definí la seña si querés cobrarla",
                text: "Dejala en cero si no cobrás seña.",
                tip: "La seña no puede superar el precio del servicio.",
              },
            ],
          },
          {
            k: "img",
            src: "/ayuda/servicio-nuevo.webp",
            size: "modal",
            alt: "Formulario de creación de un servicio",
          },
          {
            k: "tip",
            text: "Podés editar o eliminar un servicio cuando quieras. Los cambios de precio no afectan a los turnos ya reservados.",
          },
          { k: "route", href: "/admin/services", label: "Ir a Mis servicios" },
        ],
      },
      {
        id: "senas",
        title: "Señas: cobrar por adelantado",
        audience: "owner",
        keywords: ["seña", "adelanto", "mercado pago", "cobro", "depósito"],
        blocks: [
          {
            k: "p",
            text: "Una seña es un monto que el cliente paga al momento de reservar. La herramienta mas útil que podés adoptar para bajar el ausentismo.",
          },
          {
            k: "p",
            text: "Cuando un servicio tiene seña, el cliente no puede reservar sin pagarla. Se lo lleva a Mercado Pago, paga, y recién ahí el turno queda confirmado en tu agenda. Si no completa el pago, el turno sigue disponible para otro.",
          },
          {
            k: "warn",
            text: "Para poder poner señas necesitás tener tu cuenta de Mercado Pago vinculada. Sin eso, el campo de seña no te va a servir.",
          },
          {
            k: "p",
            text: "La plata va directo a tu cuenta de Mercado Pago, no pasa por SacaTurno.",
          },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     4. TU AGENDA
     ══════════════════════════════════════════════════════════════════ */
  {
    id: "agenda",
    title: "Tu agenda",
    summary:
      "Las dos formas de cargar turnos, el calendario y la gestión del día a día.",
    audience: "all",
    topics: [
      {
        id: "dos-formas",
        title: "Las dos formas de cargar turnos",
        audience: "all",
        keywords: ["automática", "manual", "diferencia", "cómo cargo"],
        blocks: [
          {
            k: "p",
            text: "Hay dos maneras de llenar tu agenda, y no son excluyentes. La mayoría termina usando las dos.",
          },
          {
            k: "table",
            head: ["", "Agenda automática", "Turnos a mano"],
            rows: [
              [
                "Para qué sirve",
                "Tu semana habitual, la que se repite siempre",
                "Excepciones: un cliente fuera de horario, un día especial",
              ],
              [
                "Cuánto trabajo da",
                "Se configura una vez y se olvida",
                "Cada turno se carga aparte",
              ],
              ["Dónde está", "Agenda › Automatizar agenda", "Agenda › Turnos"],
            ],
          },
          {
            k: "tip",
            text: "La combinación más cómoda es automatizar la semana base y meter mano solo cuando hay una excepción.",
          },
          {
            k: "img",
            src: "/ayuda/agenda-ayuda.webp",
            size: "modal",
            alt: "Modal de ayuda del calendario explicando cómo cargar turnos",
            caption:
              "Este mismo resumen lo tenés dentro del panel, en el botón «¿Cómo agrego turnos?».",
          },
        ],
      },
      {
        id: "automatizar",
        title: "Automatizar tu agenda, paso a paso",
        audience: "all",
        plan: null,
        keywords: ["automática", "plantilla", "semana", "repetir", "generar"],
        blocks: [
          {
            k: "p",
            text: "Acá armás una plantilla de tu semana típica y el sistema crea los turnos por vos, renovándolos solo cuando se van agotando.",
          },
          {
            k: "img",
            src: "/ayuda/automatizar-agenda.webp",
            alt: "Pantalla de automatizar agenda con la plantilla semanal por día",
          },
          {
            k: "steps",
            items: [
              {
                title: "Configurá tu horario de atención",
                text: "Para cada día de la semana elegís desde qué hora hasta qué hora atendés. Podés tener horarios distintos cada día.",
                tip: "Los días que no trabajás, dejalos sin turnos.",
              },
              {
                title: "Agregá los turnos en el calendario",
                text: "Tocá el «+» de cada franja para sumar un turno en ese horario, eligiendo servicio y, si corresponde, sucursal y empleado.",
                tip: "Esto es una plantilla: si cargás un turno el lunes a las 18:00, todos los lunes a las 18:00 se va a crear ese turno.",
              },
              {
                title: "Elegí cuántos días de agenda crear",
                text: "En «Frecuencia y cantidad de días» elegís crear 7, 15 o 30 días de turnos por vez.",
                tip: "Arrancá con 7 días para probar cómo funciona antes de largar un mes entero.",
              },
              {
                title: "Definí con cuánta anticipación renovar",
                text: "Elegís cuántos días antes del último turno se vuelve a generar la plantilla. Por ejemplo: si creás 7 días y ponés 3 de anticipación, el día 4 se crean 7 días más.",
              },
              {
                title: "Activá «Crear turnos automáticamente»",
                text: "El interruptor se pone naranja cuando está activo. Si está gris, la agenda automática está apagada y la plantilla no publica nada.",
              },
              {
                title: "Guardá los cambios",
                text: "Tocá el botón naranja «Guardar cambios» y listo.",
                tip: "Sin este paso no se guarda nada. Es el error más común.",
              },
            ],
          },
          {
            k: "img",
            src: "/ayuda/automatizar-frecuencia.webp",
            alt: "Sección de frecuencia y cantidad de días con el interruptor de creación automática",
          },
          {
            k: "img",
            src: "/ayuda/automatizar-tutorial.webp",
            size: "modal",
            alt: "Tutorial paso a paso de la agenda automática dentro del panel",
            caption:
              "Estos mismos pasos los tenés dentro de la app: el botón «Tutorial», arriba a la derecha de Automatizar agenda.",
          },
          {
            k: "warn",
            text: "La plantilla por sí sola no publica turnos. Mientras «Crear turnos automáticamente» esté apagado, lo que configures queda guardado pero tu agenda sigue vacía.",
          },
          {
            k: "route",
            href: "/admin/schedule/automate",
            label: "Ir a Automatizar agenda",
          },
        ],
      },
      {
        id: "asignar-lote",
        title: "Asignar profesional o sucursal en lote",
        audience: "all",
        plan: "SC_PRO",
        keywords: ["masivo", "varios", "lote", "asignar"],
        blocks: [
          {
            k: "p",
            text: "Si ya tenés la plantilla armada y necesitás cambiar quién atiende o en qué sucursal, no hace falta editar turno por turno. El botón «Asignar en lote» te deja aplicar el cambio a muchos de una vez.",
          },
          {
            k: "img",
            src: "/ayuda/automatizar-lote.webp",
            size: "modal",
            alt: "Modal de asignación en lote de profesional y sucursal",
          },
          {
            k: "tip",
            text: "Es lo más rápido cuando entra alguien nuevo al equipo y hay que repartirle turnos que ya estaban creados.",
          },
        ],
      },
      {
        id: "calendario",
        title: "La pantalla de Turnos",
        audience: "all",
        keywords: [
          "calendario",
          "vista",
          "rango horario",
          "intervalo",
          "filtros",
        ],
        blocks: [
          {
            k: "p",
            text: "Es tu agenda del día. Cada tarjeta es un turno: en naranja los disponibles, en color claro los ya reservados.",
          },
          {
            k: "img",
            src: "/ayuda/agenda-turnos.webp",
            alt: "Calendario de turnos del día con turnos disponibles y reservados",
            caption:
              "Arriba tenés los filtros por sucursal y empleado, y a la derecha el rango horario que se muestra.",
          },
          {
            k: "p",
            text: "Arriba a la derecha hay tres controles —Desde, Hasta e Intervalos— que definen qué franja del día ves y cada cuánto se divide.",
          },
          {
            k: "warn",
            text: "Ojo con esto, que confunde a todo el mundo: Desde y Hasta son solo la vista. No son tu horario de atención. Sirven para no mirar horas vacías en pantalla. Tu horario real se configura en Automatizar agenda.",
          },
          {
            k: "p",
            text: "Los filtros de Sucursal y Empleado te dejan ver la agenda de una sola persona o de un solo local, que con un equipo grande es la única forma de entender algo.",
          },
        ],
      },
      {
        id: "turno-suelto",
        title: "Crear un turno suelto",
        audience: "all",
        keywords: ["manual", "agregar", "nuevo turno", "cargar"],
        blocks: [
          {
            k: "p",
            text: "Tocá el «+» de cualquier franja del calendario para crear un turno en ese horario.",
          },
          {
            k: "img",
            src: "/ayuda/agenda-crear-turno.webp",
            size: "modal",
            alt: "Formulario de creación de un turno con servicio, sucursal y profesional",
          },
          {
            k: "p",
            text: "Podés crearlo de dos maneras: como disponible, para que un cliente lo reserve, o como ya reservado, completando vos el nombre, teléfono y email del cliente. Esto último sirve cuando te reservan por teléfono o en persona.",
          },
          {
            k: "tip",
            text: "Desde el celular, mantené presionado el horario hasta que se marque y después elegí la opción.",
          },
          {
            k: "warn",
            text: "Solo podés cargar turnos de hasta 2 días atrás. Para fechas más viejas el sistema no te va a dejar.",
          },
        ],
      },
      {
        id: "turnos-del-dia",
        title: "Generar todos los turnos de un día",
        audience: "all",
        keywords: ["generar", "varios", "día completo", "masivo"],
        blocks: [
          {
            k: "p",
            text: "Si querés llenar un día entero sin ir turno por turno, usá «Generar turnos». Elegís el servicio, la hora de inicio y de fin, y la duración de cada turno; el sistema crea todos los que entren en ese rango.",
          },
          {
            k: "img",
            src: "/ayuda/agenda-generar-dia.webp",
            size: "modal",
            alt: "Modal para generar todos los turnos de un día",
          },
          {
            k: "tip",
            text: "Es lo más práctico para un día suelto con horario distinto al habitual, sin tener que tocar la plantilla automática.",
          },
        ],
      },
      {
        id: "gestionar-turno",
        title: "Ver y gestionar un turno",
        audience: "all",
        keywords: ["detalle", "cliente", "asignar", "cambiar", "seña"],
        blocks: [
          {
            k: "p",
            text: "Tocá cualquier turno del calendario para ver su detalle: los datos del cliente, el servicio, el precio y el estado de la seña.",
          },
          {
            k: "img",
            src: "/ayuda/agenda-detalle-turno.webp",
            size: "modal",
            alt: "Detalle de un turno con datos del cliente y asignación de profesional y sucursal",
          },
          {
            k: "p",
            text: "Desde ahí también podés cambiar el profesional o la sucursal asignada. Si le cambiás la sucursal a un turno ya reservado, al cliente se le avisa por correo, porque le estás cambiando la dirección adonde tiene que ir.",
          },
          {
            k: "table",
            head: ["Estado de la seña", "Qué significa"],
            rows: [
              ["Seña pagada", "El cliente ya pagó. El turno está confirmado."],
              [
                "Seña pendiente",
                "Empezó el pago pero no lo terminó. El turno todavía no está confirmado.",
              ],
              [
                "Pago fallido",
                "El pago fue rechazado. El turno no quedó reservado.",
              ],
            ],
          },
        ],
      },
      {
        id: "cancelar",
        title: "Cancelar y eliminar turnos",
        audience: "all",
        keywords: ["cancelar", "borrar", "eliminar", "reembolso", "devolver"],
        blocks: [
          {
            k: "p",
            text: "Son dos cosas distintas y conviene no confundirlas. Cancelar un turno reservado libera el horario y le avisa al cliente. Eliminar un turno lo saca de la agenda por completo.",
          },
          {
            k: "warn",
            text: "Si cancelás vos un turno con seña, se le reembolsa automáticamente al cliente por Mercado Pago. Si cancela el cliente, la seña queda para vos. En algún caso el reembolso puede fallar; si pasa, el sistema te avisa para que lo revises a mano en tu cuenta de Mercado Pago.",
          },
          {
            k: "p",
            text: "Todo lo cancelado queda registrado. El botón de turnos cancelados del calendario te abre el historial con el motivo de cada cancelación.",
          },
          {
            k: "img",
            src: "/ayuda/agenda-cancelados.webp",
            size: "modal",
            alt: "Historial de turnos cancelados",
          },
        ],
      },
      {
        id: "deshabilitar-reservas",
        title: "Cerrar las reservas temporalmente",
        audience: "all",
        keywords: ["pausar", "vacaciones", "cerrar", "deshabilitar"],
        blocks: [
          {
            k: "p",
            text: "Arriba del calendario tenés el interruptor «Deshabilitar reservas». Cuando lo activás, tus clientes no pueden reservar nuevos turnos desde tu link, pero los que ya estaban reservados siguen firmes.",
          },
          {
            k: "tip",
            text: "Sirve para vacaciones o para frenar la entrada de turnos mientras reacomodás la agenda. Acordate de volver a habilitarlas.",
          },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     5. TU EQUIPO
     ══════════════════════════════════════════════════════════════════ */
  {
    id: "equipo",
    title: "Tu equipo",
    summary:
      "Publicarte como prestador, invitar empleados y repartir permisos.",
    audience: "owner",
    topics: [
      {
        id: "publicarte",
        title: "Publicarte como prestador",
        audience: "owner",
        keywords: ["dueño", "prestador", "aparecer", "especialista"],
        blocks: [
          {
            k: "p",
            text: "Si vos también atendés, activá «Mostrarme como prestador». Con eso aparecés en tu página pública y tus clientes pueden elegirte al reservar, viendo tu nombre y tu foto.",
          },
          {
            k: "img",
            src: "/ayuda/equipo-lista.webp",
            alt: "Sección de equipo con el interruptor para publicarse como prestador y el listado de empleados",
          },
          {
            k: "tip",
            text: "No ocupa un lugar de los empleados que te permite tu plan, y lo podés apagar cuando quieras. Está disponible en todos los planes, incluso los que no permiten empleados.",
          },
          {
            k: "p",
            text: "Si lo dejás apagado, los turnos solo se pueden asignar a empleados.",
          },
        ],
      },
      {
        id: "invitar",
        title: "Invitar empleados",
        audience: "owner",
        plan: "SC_PRO",
        keywords: ["empleado", "invitación", "sumar", "equipo", "alta"],
        blocks: [
          {
            k: "p",
            text: "Tocá «Invitar empleado» y cargá el nombre, el email y qué va a poder hacer. Le llega una invitación por correo para que cree su cuenta y entre a su propio panel.",
          },
          {
            k: "img",
            src: "/ayuda/equipo-invitar.webp",
            size: "modal",
            alt: "Formulario de invitación de un empleado con permisos, servicios y sucursales",
          },
          {
            k: "p",
            text: "En la misma pantalla le asignás los servicios que presta y las sucursales donde atiende. Ambas cosas son obligatorias: sin al menos un servicio y una sucursal el sistema no te deja guardar.",
          },
          {
            k: "table",
            head: ["Estado", "Qué significa"],
            rows: [
              [
                "Pendiente",
                "Ya lo invitaste pero todavía no aceptó ni creó su cuenta. Podés reenviarle la invitación.",
              ],
              ["Activo", "Aceptó, tiene su cuenta y puede recibir turnos."],
              [
                "Inactivo",
                "Lo desactivaste. No recibe turnos nuevos ni puede entrar. Se puede reactivar.",
              ],
            ],
          },
          {
            k: "table",
            head: ["Plan", "Empleados"],
            rows: [
              ["Prueba y Básico", "No disponible"],
              ["Pro", "Hasta 6"],
              ["Full", "Hasta 10"],
            ],
          },
          {
            k: "route",
            href: "/admin/team/employees",
            label: "Ir a Mi equipo",
          },
        ],
      },
      {
        id: "permisos",
        title: "Los permisos, uno por uno",
        audience: "owner",
        plan: "SC_PRO",
        keywords: ["permisos", "roles", "acceso", "qué puede hacer"],
        blocks: [
          {
            k: "p",
            text: "Cada empleado ve un panel armado según lo que le habilitaste. Los permisos son cinco y se combinan libremente:",
          },
          {
            k: "table",
            head: ["Permiso", "Qué habilita"],
            rows: [
              [
                "Gestionar propios turnos",
                "Crear y eliminar sus propios turnos. Es el permiso mínimo.",
              ],
              [
                "Gestionar todos los turnos",
                "Crear y eliminar turnos de cualquier empleado, no solo los suyos.",
              ],
              [
                "Ver estadísticas del negocio",
                "Acceso a la sección de Estadísticas.",
              ],
              ["Gestionar servicios", "Crear, editar y eliminar servicios."],
              [
                "Modificar agenda automática",
                "Acceso a Automatizar agenda y a la plantilla semanal.",
              ],
            ],
          },
          {
            k: "warn",
            text: "«Gestionar todos los turnos» y «Modificar agenda automática» son los dos más delicados: con ellos un empleado puede tocar la agenda de sus compañeros y la plantilla de todo el negocio. Dalos solo a quien realmente coordine.",
          },
          {
            k: "tip",
            text: "Un empleado nunca ve la configuración de la empresa, las sucursales, el equipo ni la facturación. Eso es siempre exclusivo del dueño.",
          },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     6. COBROS
     ══════════════════════════════════════════════════════════════════ */
  {
    id: "cobros",
    title: "Cobros con Mercado Pago",
    summary: "Vincular tu cuenta para cobrar señas al momento de reservar.",
    audience: "owner",
    topics: [
      {
        id: "vincular",
        title: "Vincular tu cuenta",
        audience: "owner",
        keywords: ["mercado pago", "mp", "vincular", "conectar", "cobrar"],
        blocks: [
          {
            k: "p",
            text: "Para cobrar señas tenés que conectar tu propia cuenta de Mercado Pago. Es un solo paso: desde Integraciones › Mercado Pago tocás conectar, te lleva a Mercado Pago, autorizás, y volvés al panel con la cuenta vinculada.",
          },
          {
            k: "img",
            src: "/ayuda/mercadopago.webp",
            alt: "Pantalla de Mercado Pago con la cuenta vinculada y activa",
          },
          {
            k: "warn",
            text: "La plata de las señas va directo a tu cuenta de Mercado Pago. SacaTurno no toca ese dinero ni lo retiene.",
          },
          {
            k: "p",
            text: "Podés desvincular la cuenta cuando quieras. Si lo hacés, los servicios con seña dejan de poder cobrarse.",
          },
          {
            k: "route",
            href: "/admin/account/mercadopago",
            label: "Ir a Mercado Pago",
          },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     7. ESTADÍSTICAS
     ══════════════════════════════════════════════════════════════════ */
  {
    id: "estadisticas",
    title: "Estadísticas",
    summary:
      "Cuánto facturaste, cuántos turnos tuviste y cómo venís mes a mes.",
    audience: "all",
    topics: [
      {
        id: "que-mide",
        title: "Qué mide cada panel",
        audience: "all",
        keywords: [
          "métricas",
          "ingresos",
          "facturación",
          "reportes",
          "historial",
        ],
        blocks: [
          {
            k: "img",
            src: "/ayuda/estadisticas.webp",
            alt: "Pantalla de estadísticas con las tarjetas de histórico y del mes en curso",
          },
          {
            k: "p",
            text: "La pantalla tiene dos solapas: Estadísticas, con los números, e Historial de turnos, con el detalle turno por turno.",
          },
          {
            k: "p",
            text: "El bloque Histórico acumula todo desde que arrancaste: ingresos totales, promedio mensual, turnos totales, señas cobradas y cancelaciones. El bloque Este mes muestra lo mismo acotado al mes en curso, más el ticket promedio por turno.",
          },
          {
            k: "p",
            text: "Abajo tenés los gráficos de ingresos y turnos por mes. Pasando el mouse por encima de cada barra ves el detalle de ese mes.",
          },
          {
            k: "tip",
            text: "El ticket promedio es útil para decidir precios: si sube el número de turnos pero el ticket baja, estás trabajando más para facturar lo mismo.",
          },
          { k: "route", href: "/admin/analytics", label: "Ir a Estadísticas" },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     8. TU CUENTA
     ══════════════════════════════════════════════════════════════════ */
  {
    id: "cuenta",
    title: "Tu cuenta",
    summary: "Perfil, planes, facturación y qué pasa si vence la suscripción.",
    audience: "all",
    topics: [
      {
        id: "perfil",
        title: "Tu perfil",
        audience: "all",
        keywords: ["foto", "datos personales", "contraseña", "teléfono"],
        blocks: [
          {
            k: "p",
            text: "En Mi perfil cambiás tu foto, tu nombre, apellido, email y teléfono. Desde ahí también podés cambiar tu contraseña.",
          },
          {
            k: "img",
            src: "/ayuda/perfil.webp",
            alt: "Pantalla de perfil con la información personal",
          },
          {
            k: "tip",
            text: "Si estás publicado como prestador, tu foto de perfil es la que ven tus clientes al elegirte. Poné una donde se te reconozca.",
          },
        ],
      },
      {
        id: "planes",
        title: "Los planes",
        audience: "owner",
        keywords: [
          "plan",
          "precio",
          "suscripción",
          "básico",
          "pro",
          "full",
          "límites",
        ],
        blocks: [
          {
            k: "p",
            text: "Hay una prueba gratuita y tres planes pagos. La diferencia principal está en cuánta gente y cuántos locales podés manejar, y con cuánta anticipación se le recuerda el turno a tus clientes.",
          },
          {
            k: "table",
            head: ["", "Básico", "Pro", "Full"],
            rows: [
              ["Servicios y turnos", "Ilimitados", "Ilimitados", "Ilimitados"],
              ["Señas con Mercado Pago", "Sí", "Sí", "Sí"],
              ["Empleados", "—", "Hasta 6", "Hasta 10"],
              ["Sucursales", "—", "Hasta 3", "Hasta 5"],
              [
                "Recordatorios por email",
                "24 h antes",
                "24 y 5 h antes",
                "24, 5 y 1 h antes",
              ],
            ],
          },
          {
            k: "img",
            src: "/ayuda/suscripcion.webp",
            alt: "Pantalla de suscripción con el plan actual y el historial de facturación",
          },
          {
            k: "p",
            text: "En Suscripción y facturación ves tu plan actual, el estado, la fecha del último pago y la de vencimiento, más el historial completo de pagos.",
          },
          {
            k: "route",
            href: "/admin/account/subscription",
            label: "Ir a Suscripción",
          },
        ],
      },
      {
        id: "cambiar-plan",
        title: "Cambiar de plan",
        audience: "owner",
        keywords: ["upgrade", "mejorar", "pagar", "cambiar"],
        blocks: [
          {
            k: "p",
            text: "Desde «Cambiar de plan» elegís el que quieras y se genera el pago por Mercado Pago. El cambio se aplica cuando el pago se acredita.",
          },
          {
            k: "img",
            src: "/ayuda/suscripcion-planes.webp",
            alt: "Selector de planes con precios",
          },
          {
            k: "warn",
            text: "Si bajás a un plan con menos lugares de los que estás usando, revisá primero tu equipo y tus sucursales. Conviene acomodarlos antes de bajar, no después.",
          },
        ],
      },
      {
        id: "vencida",
        title: "Si te vence la suscripción",
        audience: "owner",
        keywords: ["vencido", "expirado", "renovar", "impago"],
        blocks: [
          {
            k: "p",
            text: "Cuando la suscripción vence, el panel te lo avisa con un cartel rojo y varias funciones quedan bloqueadas: no podés sumar empleados ni cobrar señas.",
          },
          {
            k: "p",
            text: "Tus datos no se borran. Al renovar vuelve todo como estaba.",
          },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     9. EMPLEADOS
     ══════════════════════════════════════════════════════════════════ */
  {
    id: "empleados",
    title: "Guía para empleados",
    summary: "Si trabajás en un negocio que usa SacaTurno, empezá por acá.",
    audience: "employee",
    topics: [
      {
        id: "empezar",
        title: "Tu primer ingreso",
        audience: "employee",
        keywords: ["invitación", "aceptar", "primera vez", "empleado"],
        blocks: [
          {
            k: "p",
            text: "Cuando el dueño del negocio te suma al equipo, te llega una invitación por correo. Desde ese correo creás tu cuenta y ya podés entrar a tu panel.",
          },
          {
            k: "p",
            text: "Si trabajás en más de un negocio con la misma cuenta, al entrar vas a ver la pantalla «Iniciá sesión como» para elegir con cuál seguir.",
          },
        ],
      },
      {
        id: "tu-panel",
        title: "Qué ves en tu panel",
        audience: "employee",
        keywords: ["panel", "jornada", "turnos de hoy", "qué puedo hacer"],
        blocks: [
          {
            k: "p",
            text: "Tu panel de inicio te muestra tu jornada: los turnos que tenés asignados hoy, en orden, con el cliente, el servicio, la sucursal y si la seña está paga.",
          },
          {
            k: "img",
            src: "/ayuda/empleado-panel.webp",
            alt: "Panel de inicio de un empleado con su jornada del día",
            caption:
              "El panel de un empleado con permisos mínimos: en el menú solo aparece Turnos.",
          },
          {
            k: "p",
            text: "El menú de la izquierda depende de los permisos que te haya dado el dueño. Con los permisos mínimos vas a ver solo Turnos; con más permisos aparecen Estadísticas, Mis servicios o Automatizar agenda.",
          },
          {
            k: "img",
            src: "/ayuda/empleado-agenda.webp",
            alt: "Agenda de turnos vista por un empleado",
          },
          {
            k: "tip",
            text: "Si necesitás algo que no ves en tu menú, pedíselo al dueño del negocio: los permisos los maneja él desde su panel.",
          },
        ],
      },
      {
        id: "empleado-no-veo",
        title: "Qué no vas a poder hacer",
        audience: "employee",
        keywords: ["límites", "no puedo", "bloqueado"],
        blocks: [
          {
            k: "p",
            text: "Hay cosas que son siempre del dueño y ningún permiso te las habilita:",
          },
          {
            k: "list",
            items: [
              "Configurar los datos de la empresa y el link público",
              "Crear o editar sucursales",
              "Invitar empleados o cambiar permisos",
              "Ver o pagar la suscripción",
              "Vincular la cuenta de Mercado Pago",
            ],
          },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     10. PROBLEMAS
     ══════════════════════════════════════════════════════════════════ */
  {
    id: "problemas",
    title: "Problemas frecuentes",
    summary: "Los mensajes que puede tirarte la app, explicados.",
    audience: "all",
    topics: [
      {
        id: "no-veo-seccion",
        title: "No veo una sección del menú",
        audience: "all",
        keywords: [
          "falta",
          "no aparece",
          "desapareció",
          "sucursales",
          "empleados",
        ],
        blocks: [
          {
            k: "p",
            text: "Casi siempre es por tu plan o por tus permisos, no por un error.",
          },
          {
            k: "table",
            head: ["No ves…", "Motivo"],
            rows: [
              ["Sucursales", "Solo está en los planes Pro y Full."],
              [
                "Empleados",
                "En Prueba y Básico la sección existe pero solo sirve para publicarte a vos como prestador.",
              ],
              ["Mercado Pago", "Desaparece si tu suscripción está vencida."],
              [
                "Automatizar agenda",
                "Si sos empleado, necesitás el permiso «Modificar agenda automática».",
              ],
              [
                "Estadísticas",
                "Si sos empleado, necesitás el permiso «Ver estadísticas del negocio».",
              ],
            ],
          },
        ],
      },
      {
        id: "errores-turnos",
        title: "Mensajes al cargar turnos",
        audience: "all",
        keywords: ["error", "no me deja", "no puedo crear"],
        blocks: [
          {
            k: "table",
            head: ["Mensaje", "Qué pasó y qué hacer"],
            rows: [
              [
                "Otra persona tomó este turno",
                "Un cliente lo reservó mientras vos lo tenías abierto. Actualizá la agenda y elegí otro horario.",
              ],
              [
                "Solo podés cargar turnos de hasta 2 días atrás",
                "Hay un límite para cargar turnos en el pasado. Para fechas más viejas no se puede.",
              ],
              [
                "El profesional ya tiene un turno en ese horario",
                "Esa persona ya está ocupada. Elegí otro horario u otro profesional.",
              ],
              [
                "El profesional no atiende en esa sucursal",
                "Falta asignarle esa sucursal. Se arregla desde Mi equipo, editando al empleado.",
              ],
              [
                "El horario de fin debe ser mayor al horario de inicio",
                "Revisá las horas: estás pidiendo un rango invertido.",
              ],
              [
                "Se alcanzó el límite máximo de turnos",
                "Llegaste al tope de turnos que se pueden crear de una vez. Generá menos días.",
              ],
              [
                "Sin servicios",
                "No podés crear turnos sin al menos un servicio cargado. Andá a Mis servicios y creá uno.",
              ],
            ],
          },
        ],
      },
      {
        id: "errores-equipo",
        title: "Mensajes al gestionar el equipo",
        audience: "owner",
        keywords: ["error", "empleado", "límite"],
        blocks: [
          {
            k: "table",
            head: ["Mensaje", "Qué pasó y qué hacer"],
            rows: [
              [
                "Se alcanzó el límite máximo de empleados permitidos",
                "Llegaste al tope de tu plan. Desactivá a alguien que ya no trabaje o pasá a un plan superior.",
              ],
              [
                "Asigná al menos un servicio al empleado",
                "Todo empleado necesita al menos un servicio para poder recibir turnos.",
              ],
              [
                "Cada empleado tiene que estar asignado al menos a una sucursal",
                "No se puede dejar a alguien sin sucursal. Elegí al menos una.",
              ],
              [
                "Renová tu suscripción para volver a sumar empleados",
                "Tu suscripción está vencida. Al renovarla se desbloquea.",
              ],
            ],
          },
        ],
      },
      {
        id: "errores-servicios",
        title: "Mensajes al cargar servicios",
        audience: "all",
        keywords: ["error", "servicio", "seña", "precio"],
        blocks: [
          {
            k: "table",
            head: ["Mensaje", "Qué pasó y qué hacer"],
            rows: [
              [
                "La seña no puede superar el precio del servicio",
                "Bajá el monto de la seña o subí el precio.",
              ],
              [
                "El link ya existe, intentá con otro",
                "Otro negocio ya usa ese link público. Probá una variante.",
              ],
              [
                "La imagen supera el máximo de 5MB",
                "Achicá la imagen antes de subirla.",
              ],
              [
                "Formato inválido. Usá JPG, PNG o WebP",
                "El archivo no es una imagen soportada.",
              ],
              [
                "Completá calle, altura, ciudad y provincia del domicilio",
                "La dirección tiene que estar completa para poder guardar.",
              ],
            ],
          },
        ],
      },
      {
        id: "cliente-no-recibe",
        title: "Mi cliente no recibió el correo",
        audience: "all",
        keywords: ["email", "correo", "recordatorio", "no llegó", "spam"],
        blocks: [
          {
            k: "p",
            text: "SacaTurno manda correos automáticos al reservar, al cancelar y como recordatorio antes del turno. Si un cliente dice que no le llegó:",
          },
          {
            k: "list",
            items: [
              "Pedile que revise la carpeta de spam o correo no deseado.",
              "Verificá en el detalle del turno que el email esté bien escrito.",
              "Recordá que la anticipación de los recordatorios depende de tu plan: 24 horas en Básico, 24 y 5 en Pro, y 24, 5 y 1 en Full.",
            ],
          },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     11. GLOSARIO
     ══════════════════════════════════════════════════════════════════ */
  {
    id: "glosario",
    title: "Glosario",
    summary: "Los términos que usa la app, en una línea cada uno.",
    audience: "all",
    topics: [
      {
        id: "terminos",
        title: "Términos de la app",
        audience: "all",
        keywords: ["definición", "qué es", "vocabulario"],
        blocks: [
          {
            k: "table",
            head: ["Término", "Qué es"],
            rows: [
              [
                "Turno disponible",
                "Un horario libre que tus clientes pueden reservar.",
              ],
              ["Turno reservado", "Un horario que ya tomó un cliente."],
              ["Seña", "Monto que el cliente paga por adelantado al reservar."],
              [
                "Link público",
                "Tu dirección de reservas, del estilo sacaturno.com.ar/tu-negocio.",
              ],
              ["Prestador", "Quien atiende un turno: vos o un empleado."],
              ["Sucursal", "Cada dirección donde atendés."],
              [
                "Plantilla semanal",
                "Tu semana tipo en Automatizar agenda, que el sistema repite.",
              ],
              [
                "Agenda automática",
                "La función que crea y renueva turnos sola a partir de la plantilla.",
              ],
              [
                "Contexto",
                "El perfil con el que entrás cuando tu cuenta tiene más de uno.",
              ],
              [
                "Política de cancelación",
                "Hasta cuándo un cliente puede cancelar por su cuenta.",
              ],
            ],
          },
        ],
      },
    ],
  },
];

/** Texto plano de un tema, para el buscador. */
export function topicText(t: Topic): string {
  const parts: string[] = [t.title, ...(t.keywords ?? [])];
  for (const b of t.blocks) {
    switch (b.k) {
      case "p":
      case "tip":
      case "warn":
        parts.push(b.text);
        break;
      case "list":
        parts.push(...b.items);
        break;
      case "steps":
        for (const s of b.items) parts.push(s.title, s.text, s.tip ?? "");
        break;
      case "table":
        parts.push(...b.head, ...b.rows.flat());
        break;
      case "img":
        parts.push(b.alt, b.caption ?? "");
        break;
      case "route":
        parts.push(b.label);
        break;
    }
  }
  return parts.join(" ").toLowerCase();
}
