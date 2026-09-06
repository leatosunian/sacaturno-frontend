"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Accordion from "@/components/home/Accordion";
import { Badge } from "./Badge";

const ease = [0.22, 1, 0.36, 1] as const;

const headerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
};
const headerItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const listItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

const step = "flex items-start gap-2.5";
const num =
  "flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center mt-0.5";
const bullet = "flex items-start gap-2.5 mt-2 first:mt-0";
const dot = "flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5";

const CATEGORIES = [
  { id: "all", label: "Todas" },
  { id: "turnos", label: "Turnos" },
  { id: "cuenta", label: "Cuenta" },
  { id: "pagos", label: "Pagos" },
] as const;

type CategoryID = (typeof CATEGORIES)[number]["id"];

type Faq = {
  title: string;
  answer: ReactNode;
  cat: Exclude<CategoryID, "all">;
};

const faqs: Faq[] = [
  {
    cat: "turnos",
    title: "¿Cómo reservo un turno?",
    answer: (
      <>
      <ol className="flex flex-col gap-2.5">
        <li className={step}>
          <span className={num}>1</span>
          <span>
            Si tenés el link del negocio, entrá directo. Si no, usá{" "}
            <strong className="text-gray-700 font-semibold">
              &ldquo;Buscar negocio&rdquo;
            </strong>{" "}
            en el menú y escribí su nombre.
          </span>
        </li>
        <li className={step}>
          <span className={num}>2</span>
          <span>
            En el resultado, pulsá el{" "}
            <strong className="text-gray-700 font-semibold">
              botón naranja
            </strong>{" "}
            para ver sus turnos.
          </span>
        </li>
        <li className={step}>
          <span className={num}>3</span>
          <span>
            Elegí el{" "}
            <strong className="text-gray-700 font-semibold">servicio</strong>{" "}
            que necesitás. Si el negocio tiene varias sucursales o más de un
            profesional, también vas a poder elegirlos.
          </span>
        </li>
        <li className={step}>
          <span className={num}>4</span>
          <span>Elegí el día y el horario que te queden mejor.</span>
        </li>
        <li className={step}>
          <span className={num}>5</span>
          <span>Completá tus datos y confirmá la reserva.</span>
        </li>
        <li className={step}>
          <span className={num}>6</span>
          <span>
            Si el servicio pide{" "}
            <strong className="text-gray-700 font-semibold">seña</strong>, te
            llevamos a Mercado Pago: el turno queda confirmado cuando se acredita
            el pago.
          </span>
        </li>
        <li className={step}>
          <span className={num}>7</span>
          <span>
            Recibirás un{" "}
            <strong className="text-gray-700 font-semibold">
              correo de confirmación
            </strong>{" "}
            con todos los detalles y un link para cancelar. Si no lo ves, revisá
            la carpeta de spam.
          </span>
        </li>
      </ol>
      <p className="mt-3">
        ¿Querés verlo antes? En la{" "}
        <strong className="text-gray-700 font-semibold">
          demo interactiva
        </strong>{" "}
        recorrés todo el proceso de reserva, sin registrarte ni reservar nada de
        verdad.
      </p>
      <div className="mt-2">
        <Link
          href="/demo"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#dd4924] no-underline hover:opacity-75 transition-opacity"
        >
          Probar la demo interactiva
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>
      </>
    ),
  },
  {
    cat: "turnos",
    title: "¿Hace falta crear una cuenta para reservar?",
    answer: (
      <div className="flex flex-col gap-2">
        <div className={bullet}>
          <span className={dot} />
          <span>
            <strong className="text-gray-700 font-semibold">No.</strong> Para
            reservar solo te pedimos nombre, teléfono y correo. No hay registro
            ni contraseña.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            Escribí bien tu correo: ahí te llega la confirmación, el recordatorio
            antes del turno y el{" "}
            <strong className="text-gray-700 font-semibold">
              link para cancelar
            </strong>
            .
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            La cuenta hace falta solo del otro lado del mostrador: si querés{" "}
            <strong className="text-gray-700 font-semibold">
              publicar tu propio negocio
            </strong>{" "}
            y recibir reservas.
          </span>
        </div>
      </div>
    ),
  },
  {
    cat: "cuenta",
    title: "¿Cómo creo mi empresa?",
    answer: (
      <ol className="flex flex-col gap-2.5">
        <li className={step}>
          <span className={num}>1</span>
          <span>
            Registrate con tu correo o{" "}
            <strong className="text-gray-700 font-semibold">
              directamente con Google
            </strong>
            . Si elegís correo, confirmá tu cuenta desde el mail que te
            enviaremos.
          </span>
        </li>
        <li className={step}>
          <span className={num}>2</span>
          <span>
            Creá tu empresa: nombre, rubro, datos de contacto, dirección y tu{" "}
            <strong className="text-gray-700 font-semibold">
              link público de reservas
            </strong>
            , que es la dirección que vas a compartir con tus clientes.
          </span>
        </li>
        <li className={step}>
          <span className={num}>3</span>
          <span>
            Cargá al menos un{" "}
            <strong className="text-gray-700 font-semibold">servicio</strong>{" "}
            con su precio y su duración. Es lo que va a elegir el cliente.
          </span>
        </li>
        <li className={step}>
          <span className={num}>4</span>
          <span>
            Armá tu agenda. Con la{" "}
            <strong className="text-gray-700 font-semibold">
              agenda automática
            </strong>{" "}
            configurás una semana tipo una sola vez y los turnos se crean y
            renuevan solos.
          </span>
        </li>
        <li className={step}>
          <span className={num}>5</span>
          <span>
            Compartí tu link por WhatsApp, Instagram o tu ficha de Google. Es la
            puerta de entrada de las reservas.
          </span>
        </li>
        <li className={step}>
          <span className={num}>6</span>
          <span>
            Opcional: vinculá{" "}
            <strong className="text-gray-700 font-semibold">Mercado Pago</strong>{" "}
            si vas a cobrar señas, y sumá sucursales y empleados si trabajás con
            un equipo.
          </span>
        </li>
      </ol>
    ),
  },
  {
    cat: "cuenta",
    title: "¿Puedo trabajar con mi equipo o en varias sucursales?",
    answer: (
      <div className="flex flex-col gap-2">
        <div className={bullet}>
          <span className={dot} />
          <span>
            Sí, a partir del{" "}
            <strong className="text-primary font-semibold">plan Pro</strong>:
            hasta 6 profesionales y 3 sucursales. El{" "}
            <strong className="text-primary font-semibold">plan Full</strong>{" "}
            amplía a 10 profesionales y 5 sucursales.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            Cada persona de tu equipo entra con{" "}
            <strong className="text-gray-700 font-semibold">
              su propio usuario
            </strong>{" "}
            y ve únicamente lo que vos le habilitás.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            Al reservar, el cliente elige sucursal y profesional cuando hay más
            de uno. Vos también podés mostrarte como prestador para que te elijan
            a vos.
          </span>
        </div>
      </div>
    ),
  },
  {
    cat: "turnos",
    title: "¿Cómo cancelo un turno?",
    answer: (
      <div className="flex flex-col gap-2">
        <div className={bullet}>
          <span className={dot} />
          <span>
            <strong className="text-gray-700 font-semibold">
              Desde el correo de confirmación:
            </strong>{" "}
            ese mail incluye un link para cancelar. Entrás, ves los datos del
            turno y lo cancelás vos mismo, sin escribirle a nadie.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            <strong className="text-gray-700 font-semibold">
              Hasta cuándo:
            </strong>{" "}
            cada negocio define con cuánta anticipación se puede cancelar. Si ya
            pasó ese plazo, el link te lo avisa y tenés que contactarlo — sus
            datos están en el mismo correo.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            <strong className="text-gray-700 font-semibold">
              Si pagaste una seña:
            </strong>{" "}
            cuando cancelás vos, la seña queda para el negocio. Si el turno lo
            cancela el negocio, se te devuelve automáticamente por Mercado Pago.
          </span>
        </div>
      </div>
    ),
  },
  {
    cat: "turnos",
    title: "¿Qué pasa si un cliente no viene?",
    answer: (
      <div className="flex flex-col gap-2">
        <div className={bullet}>
          <span className={dot} />
          <span>
            <strong className="text-gray-700 font-semibold">
              Recordatorios automáticos:
            </strong>{" "}
            todos los planes avisan al cliente 24 horas antes. Pro suma un aviso
            5 horas antes y Full uno más, 1 hora antes.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            <strong className="text-gray-700 font-semibold">Señas:</strong> si el
            servicio pide una, el turno se confirma recién con la seña pagada. Si
            después el cliente cancela, esa seña queda para vos.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            <strong className="text-gray-700 font-semibold">
              Política de cancelación:
            </strong>{" "}
            definís con cuánta anticipación puede cancelar el cliente, así el
            horario se libera a tiempo para que lo tome otra persona.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            Si aun así no aparece, cancelás el turno desde tu agenda y el horario
            vuelve a quedar disponible. Queda registrado en tu historial de
            cancelaciones.
          </span>
        </div>
      </div>
    ),
  },
  {
    cat: "pagos",
    title: "Precios y prueba gratuita",
    answer: (
      <div className="flex flex-col gap-2">
        <div className={bullet}>
          <span className={dot} />
          <span>
            Empezás con{" "}
            <strong className="text-gray-700 font-semibold">
              15 días gratis, sin tarjeta
            </strong>
            . No te pedimos datos de pago para probar.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            Después elegís entre{" "}
            <strong className="text-primary font-semibold">
              Básico, Pro o Full
            </strong>
            , y se paga mes a mes por Mercado Pago.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            Los planes se diferencian en el equipo y los recordatorios:{" "}
            <strong className="text-primary font-semibold">Básico</strong> es
            para trabajar solo;{" "}
            <strong className="text-primary font-semibold">Pro</strong> suma
            sucursales, empleados y un aviso extra 5 horas antes;{" "}
            <strong className="text-primary font-semibold">Full</strong> amplía
            esos límites y suma el aviso de 1 hora antes.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            El{" "}
            <strong className="text-gray-700 font-semibold">
              cobro de señas
            </strong>{" "}
            está disponible en todos los planes.
          </span>
        </div>
        <div className="mt-1">
          <Link
            href="#pricing"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#dd4924] no-underline hover:opacity-75 transition-opacity"
          >
            Ver los planes y precios
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    ),
  },
  {
    cat: "pagos",
    title: "Pagos en la aplicación",
    answer: (
      <div className="flex flex-col gap-2">
        <div className={bullet}>
          <span className={dot} />
          <span>
            Los pagos se procesan a través de{" "}
            <strong className="text-gray-700 font-semibold">Mercado Pago</strong>
            , de forma segura. Tus datos de pago los maneja Mercado Pago
            directamente — nosotros nunca tenemos acceso a esa información.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            <strong className="text-gray-700 font-semibold">
              No necesitás vincular una tarjeta
            </strong>{" "}
            para activar tu período gratuito ni para pagos futuros.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            <strong className="text-gray-700 font-semibold">
              Señas de turnos:
            </strong>{" "}
            algunos negocios piden una seña para confirmar la reserva. En ese
            caso, serás redirigido a Mercado Pago para completar el pago antes de
            que el turno quede confirmado.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            El dinero de la seña va{" "}
            <strong className="text-gray-700 font-semibold">
              directamente a la cuenta de Mercado Pago del negocio
            </strong>{" "}
            — SacaTurno actúa solo como intermediario de la conexión y nunca
            retiene los fondos.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            <strong className="text-gray-700 font-semibold">
              Si tenés un negocio:
            </strong>{" "}
            para cobrar señas necesitás vincular tu propia cuenta de Mercado Pago
            desde el panel. Sin vincularla, el campo de seña de tus servicios no
            funciona.
          </span>
        </div>
      </div>
    ),
  },
  {
    cat: "cuenta",
    title: "No recibo los correos",
    answer: (
      <div className="flex flex-col gap-2">
        <div className={bullet}>
          <span className={dot} />
          <span>
            Revisá tu carpeta de{" "}
            <strong className="text-gray-700 font-semibold">
              spam o correo no deseado
            </strong>
            , suelen llegar ahí.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            Si el problema persiste, no dudes en{" "}
            <strong className="text-gray-700 font-semibold">contactarnos</strong>{" "}
            y lo resolvemos.
          </span>
        </div>
      </div>
    ),
  },
  {
    cat: "cuenta",
    title: "No pude activar mi cuenta",
    answer: (
      <div className="flex flex-col gap-2">
        <div className={bullet}>
          <span className={dot} />
          <span>
            Si el correo de activación no te llegó o el link expiró, podés{" "}
            <strong className="text-gray-700 font-semibold">
              solicitar uno nuevo
            </strong>{" "}
            ingresando tu correo en nuestra página de reenvío.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            También revisá la carpeta de{" "}
            <strong className="text-gray-700 font-semibold">
              spam o correo no deseado
            </strong>{" "}
            por si el correo original llegó ahí.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            Otra opción es{" "}
            <strong className="text-gray-700 font-semibold">
              entrar con Google
            </strong>
            : si usás el mismo correo, tu cuenta queda activa al instante.
          </span>
        </div>
        <div className="mt-1">
          <Link
            href="/resend-confirmation"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#dd4924] no-underline hover:opacity-75 transition-opacity"
          >
            Reenviar correo de activación
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    ),
  },
  {
    cat: "cuenta",
    title: "Necesito ayuda",
    answer: (
      <div className="flex flex-col gap-2">
        <div className={bullet}>
          <span className={dot} />
          <span>
            Si ya tenés cuenta, dentro de tu panel está el{" "}
            <strong className="text-gray-700 font-semibold">
              centro de ayuda
            </strong>{" "}
            con el manual completo: agenda, servicios, equipo, señas y métricas.
          </span>
        </div>
        <div className={bullet}>
          <span className={dot} />
          <span>
            Ante cualquier otra duda o inconveniente, escribinos a{" "}
            <strong className="text-gray-700 font-semibold">
              sacaturno.com.ar@gmail.com
            </strong>{" "}
            y te respondemos a la brevedad.
          </span>
        </div>
        <div className="mt-1">
          <Link
            href="/admin/ayuda"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#dd4924] no-underline hover:opacity-75 transition-opacity"
          >
            Ir al centro de ayuda
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    ),
  },
];

const arrow = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const helpBox = (
  <div className="rounded-2xl border border-black/[0.08] bg-[#fdfaf7] p-5">
    <p className="text-sm font-semibold text-gray-700">
      ¿No encontrás lo que buscabas?
    </p>
    <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
      Si ya tenés cuenta, dentro de tu panel está el centro de ayuda con el
      manual completo de todas las funciones.
    </p>
    <div className="flex flex-col items-start gap-2.5 mt-4">
      <Link
        href="/admin/ayuda"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#dd4924] no-underline hover:opacity-75 transition-opacity"
      >
        Ir al centro de ayuda
        {arrow}
      </Link>
      <a
        href="mailto:sacaturno.com.ar@gmail.com"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 no-underline hover:text-gray-700 transition-colors"
      >
        O escribinos por correo
        {arrow}
      </a>
    </div>
  </div>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [category, setCategory] = useState<CategoryID>("all");

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleCategory = (id: CategoryID) => {
    if (id === category) return;
    setCategory(id);
    setOpenIndex(null);
  };

  const visible = faqs
    .map((faq, index) => ({ faq, index }))
    .filter(({ faq }) => category === "all" || faq.cat === category);

  return (
    <div id="faq" className="w-full bg-white pt-12 pb-16 lg:pt-20 lg:pb-36">
      <div className="w-full max-w-6xl px-6 mx-auto">
        <div className="grid items-start grid-cols-1 gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <motion.header
            className="text-center lg:sticky lg:top-28 lg:text-left"
            variants={headerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
          >
            <motion.div variants={headerItem}>
              <Badge
                className="rounded-full text-orange-600 bg-orange-100 border-0 px-4 py-1.5 text-sm font-medium"
                variant="secondary"
              >
                FAQ
              </Badge>
            </motion.div>
            <motion.h2
              variants={headerItem}
              className="mt-4 text-3xl font-bold leading-[1.12] tracking-tight md:text-4xl 2xl:text-5xl"
            >
              Preguntas<br className="hidden lg:block" /> frecuentes
              <span className="text-accent">.</span>
            </motion.h2>
            <motion.p
              variants={headerItem}
              className="max-w-md mx-auto mt-4 text-slate-600 md:text-base 2xl:text-lg lg:mx-0"
            >
              Respondemos tus dudas más comunes sobre turnos, cuentas y pagos.
            </motion.p>
            <motion.div variants={headerItem} className="hidden mt-7 lg:block">
              {helpBox}
            </motion.div>
          </motion.header>

          <div className="w-full">
            <div className="flex flex-wrap justify-center gap-2 mb-6 lg:justify-start">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategory(c.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                    category === c.id
                      ? "bg-orange-600 border-orange-600 text-white"
                      : "bg-white border-black/10 text-gray-600 [@media(hover:hover)]:hover:border-orange-300 [@media(hover:hover)]:hover:text-orange-600"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <motion.div
              key={category}
              className="w-full border-t border-black/[0.08]"
              variants={listContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
            >
              {visible.map(({ faq, index }) => (
                <motion.div key={index} variants={listItem}>
                  <Accordion
                    title={faq.title}
                    answer={faq.answer}
                    tag={
                      category === "all"
                        ? CATEGORIES.find((c) => c.id === faq.cat)?.label
                        : undefined
                    }
                    isOpen={openIndex === index}
                    onToggle={() => handleToggle(index)}
                  />
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-8 lg:hidden">{helpBox}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
