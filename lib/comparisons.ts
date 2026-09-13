// Páginas comparativas (/comparar/[competidor]).
// Son landings de SEO: no se navegan desde el sitio, se entra por buscador,
// por respuestas de IA o por link pegado en un DM. Cada dato de la competencia
// tiene que ser verificable y estar fechado — ver `verifiedAt` y `sourceUrl`.

export type Advantage = "us" | "them" | "tie";

export interface ComparisonRow {
  feature: string;
  us: string;
  them: string;
  advantage: Advantage;
}

export interface ComparisonExample {
  title: string;
  intro: string;
  lines: { label: string; value: string; highlight?: boolean }[];
  conclusion: string;
}

export interface Comparison {
  slug: string;
  competitor: string;
  metaTitle: string;
  metaDescription: string;
  heading: string;
  subheading: string;
  verifiedAt: string;
  sourceLabel: string;
  sourceUrl: string;
  rows: ComparisonRow[];
  example: ComparisonExample;
  chooseThem: { title: string; points: string[] };
  chooseUs: { title: string; points: string[] };
  faq: { q: string; a: string }[];
}

export const COMPARISONS: Comparison[] = [
  {
    slug: "turnito",
    competitor: "Turnito",
    metaTitle: "SacaTurno vs Turnito: cuál conviene si cobrás seña",
    metaDescription:
      "Comparación honesta entre SacaTurno y Turnito: comisión por cobro, precio de los planes, recordatorios y a dónde va la plata de la seña. Datos verificados en el sitio de Turnito.",
    heading: "SacaTurno vs Turnito",
    subheading:
      "Las dos sirven para que tus clientes reserven solos. La diferencia grande está en qué pasa con la plata de la seña.",
    verifiedAt: "8 de septiembre de 2026",
    sourceLabel: "turnito.app",
    sourceUrl: "https://turnito.app/ar/",
    rows: [
      {
        feature: "Comisión sobre la seña",
        us: "0% en todos los planes",
        them: "5% en el plan gratuito, 3,5% en Plus, 1% en Advance, 0% recién en Pro",
        advantage: "us",
      },
      {
        feature: "A dónde entra la plata",
        us: "Directo a tu cuenta de Mercado Pago",
        them: "Se cobra a través de la plataforma",
        advantage: "us",
      },
      {
        feature: "Precio para tener 0% de comisión",
        us: "Desde $9.990 por mes",
        them: "$42.000 por mes (plan Pro)",
        advantage: "us",
      },
      {
        feature: "Plan gratuito permanente",
        us: "No: 15 días de prueba y después es pago",
        them: "Sí, con límite de reservas y 5% de comisión",
        advantage: "them",
      },
      {
        feature: "Recordatorios por WhatsApp",
        us: "No, solo por email",
        them: "Sí, con cupo mensual según el plan",
        advantage: "them",
      },
      {
        feature: "Recordatorios por email",
        us: "Sí, automáticos",
        them: "Sí, automáticos",
        advantage: "tie",
      },
      {
        feature: "Página de reservas propia",
        us: "Sí, con tu link y tu logo",
        them: "Sí, con tu link",
        advantage: "tie",
      },
      {
        feature: "Turnos y servicios ilimitados",
        us: "Sí, en todos los planes pagos",
        them: "Limitado en el plan gratuito",
        advantage: "us",
      },
    ],
    example: {
      title: "Cuánto te sale en la práctica",
      intro:
        "Una barbería que cobra $2.000 de seña y toma 100 turnos por mes junta $200.000 en señas. Esto es lo que se lleva cada plataforma por ese movimiento:",
      lines: [
        {
          label: "Turnito, plan gratuito (5%)",
          value: "$10.000 por mes en comisiones",
        },
        {
          label: "Turnito, plan Pro (0% + abono)",
          value: "$42.000 por mes de abono",
        },
        {
          label: "SacaTurno, plan Básico (0% + abono)",
          value: "$9.990 por mes de abono",
          highlight: true,
        },
      ],
      conclusion:
        "El plan gratuito de Turnito no es gratis si cobrás seña: a ese volumen te sale igual que nuestro plan pago, y sube con cada turno que agregás. El nuestro no se mueve.",
    },
    chooseThem: {
      title: "Cuándo te conviene Turnito",
      points: [
        "Si los recordatorios por WhatsApp son tu prioridad. Es la función que más baja el ausentismo y nosotros hoy no la tenemos: mandamos recordatorios por email.",
        "Si no cobrás seña. Sin cobros de por medio la comisión no existe y su plan gratuito te sirve sin pagar nada.",
        "Si tomás pocos turnos por mes y estás empezando. El plan gratuito te deja probar sin poner plata.",
      ],
    },
    chooseUs: {
      title: "Cuándo te conviene SacaTurno",
      points: [
        "Si cobrás seña, sin vueltas. La plata entra directo a tu cuenta de Mercado Pago y no retenemos nada, en ningún plan.",
        "Si querés saber cuánto pagás por mes y que no dependa de cuánto factures. El abono es fijo.",
        "Si tenés varias sucursales o un equipo. Hasta 10 empleados y 5 sucursales en el plan Full.",
      ],
    },
    faq: [
      {
        q: "¿SacaTurno cobra alguna comisión sobre las señas?",
        a: "No. La seña se cobra con tu propia cuenta de Mercado Pago y el dinero entra directo ahí. SacaTurno no retiene ningún porcentaje en ningún plan. Mercado Pago sí aplica sus propias comisiones de procesamiento, igual que en cualquier cobro que hagas con ellos.",
      },
      {
        q: "¿Cuánto cobra Turnito de comisión?",
        a: "Según su sitio, 5% en el plan gratuito, 3,5% en el plan Plus, 1% en Advance y 0% en el plan Pro. Los planes van de $0 a $42.000 por mes. Verificado el 8 de septiembre de 2026.",
      },
      {
        q: "¿SacaTurno tiene recordatorios por WhatsApp?",
        a: "No. Hoy los recordatorios salen por email, automáticos, antes del turno. Si WhatsApp es un requisito para vos, Turnito lo ofrece y nosotros no.",
      },
      {
        q: "¿Puedo probar SacaTurno antes de pagar?",
        a: "Sí, tenés 15 días de prueba con todas las funciones y sin cargar tarjeta.",
      },
      {
        q: "¿Puedo migrar mi agenda desde Turnito?",
        a: "Sí. Cargás tus servicios y tus horarios una vez y tu página de reservas queda publicada el mismo día.",
      },
    ],
  },
];

export const getComparison = (slug: string): Comparison | undefined =>
  COMPARISONS.find((c) => c.slug === slug);
