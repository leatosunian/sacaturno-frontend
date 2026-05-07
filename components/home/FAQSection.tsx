"use client";

import { useState } from "react";
import Accordion from "@/components/home/Accordion";
import { Badge } from "./Badge";

const step = "flex items-start gap-2.5";
const num = "flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center mt-0.5";
const bullet = "flex items-start gap-2.5 mt-2 first:mt-0";
const dot = "flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5";

const faqs = [
  {
    title: "¿Cómo reservo un turno?",
    answer: (
      <ol className="flex flex-col gap-2.5">
        <li className={step}><span className={num}>1</span><span>Accedé al menú y hacé click en <strong className="text-gray-700 font-semibold">&ldquo;Reservar turno&rdquo;</strong>.</span></li>
        <li className={step}><span className={num}>2</span><span>Buscá el nombre de la empresa que querés.</span></li>
        <li className={step}><span className={num}>3</span><span>En el resultado, pulsá el <strong className="text-gray-700 font-semibold">ícono del calendario</strong>.</span></li>
        <li className={step}><span className={num}>4</span><span>Elegí el horario disponible que te quede mejor.</span></li>
        <li className={step}><span className={num}>5</span><span>Completá tus datos y confirmá la reserva.</span></li>
        <li className={step}><span className={num}>6</span><span>Recibirás un <strong className="text-gray-700 font-semibold">correo de confirmación</strong> con todos los detalles. Si no lo ves, revisá la carpeta de spam.</span></li>
      </ol>
    ),
  },
  {
    title: "¿Cómo creo mi empresa?",
    answer: (
      <ol className="flex flex-col gap-2.5">
        <li className={step}><span className={num}>1</span><span>Registrate y <strong className="text-gray-700 font-semibold">confirmá tu cuenta</strong> desde el correo que te enviaremos.</span></li>
        <li className={step}><span className={num}>2</span><span>Iniciá sesión y accedé a <strong className="text-gray-700 font-semibold">&ldquo;Mi empresa&rdquo;</strong>.</span></li>
        <li className={step}><span className={num}>3</span><span>Completá los datos de tu negocio y hacé click en <strong className="text-gray-700 font-semibold">&ldquo;Crear empresa&rdquo;</strong>.</span></li>
        <li className={step}><span className={num}>4</span><span>Creá al menos un <strong className="text-gray-700 font-semibold">servicio</strong> para poder comenzar a cargar turnos.</span></li>
      </ol>
    ),
  },
  {
    title: "¿Cómo cancelo un turno?",
    answer: (
      <div className="flex flex-col gap-2">
        <div className={bullet}><span className={dot} /><span><strong className="text-gray-700 font-semibold">En el momento de la reserva:</strong> podés cancelarlo directamente desde la aplicación.</span></div>
        <div className={bullet}><span className={dot} /><span><strong className="text-gray-700 font-semibold">Después de reservar:</strong> contactá al negocio por correo o teléfono. Encontrás los datos de contacto en el correo de confirmación que recibiste.</span></div>
      </div>
    ),
  },
  {
    title: "Pagos en la aplicación",
    answer: (
      <div className="flex flex-col gap-2">
        <div className={bullet}><span className={dot} /><span>Los pagos se procesan a través de <strong className="text-gray-700 font-semibold">Mercado Pago</strong>, de forma segura. Tus datos de pago los maneja Mercado Pago directamente — nosotros nunca tenemos acceso a esa información.</span></div>
        <div className={bullet}><span className={dot} /><span><strong className="text-gray-700 font-semibold">No necesitás vincular una tarjeta</strong> para activar tu período gratuito ni para pagos futuros.</span></div>
        <div className={bullet}><span className={dot} /><span><strong className="text-gray-700 font-semibold">Señas de turnos:</strong> algunos negocios pueden requerir el pago de una seña para confirmar la reserva. En ese caso, serás redirigido a Mercado Pago para completar el pago antes de que el turno quede confirmado.</span></div>
        <div className={bullet}><span className={dot} /><span>El dinero de la seña va <strong className="text-gray-700 font-semibold">directamente a la cuenta de Mercado Pago del negocio</strong> — SacaTurno actúa solo como intermediario de la conexión y nunca retiene los fondos.</span></div>
      </div>
    ),
  },
  {
    title: "No recibo los correos",
    answer: (
      <div className="flex flex-col gap-2">
        <div className={bullet}><span className={dot} /><span>Revisá tu carpeta de <strong className="text-gray-700 font-semibold">spam o correo no deseado</strong>, suelen llegar ahí.</span></div>
        <div className={bullet}><span className={dot} /><span>Si el problema persiste, no dudes en <strong className="text-gray-700 font-semibold">contactarnos</strong> y lo resolvemos.</span></div>
      </div>
    ),
  },
  {
    title: "Necesito ayuda",
    answer: (
      <div className="flex flex-col gap-2">
        <div className={bullet}><span className={dot} /><span>Ante cualquier duda o inconveniente, escribinos a <strong className="text-gray-700 font-semibold">leandrotosunian@hotmail.com</strong> y te respondemos a la brevedad.</span></div>
      </div>
    ),
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq" className="w-full bg-white pt-16 pb-36">
      <div className="flex flex-col items-center gap-10 2xl:gap-14 px-6">

        <header className="text-center max-w-xl">
          <Badge className="rounded-full text-orange-600 bg-orange-100 border-0 px-4 py-1.5 text-sm font-medium mb-4" variant="secondary">
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3">
            Preguntas frecuentes
          </h2>
          <p className="text-base text-gray-500">
            Respondemos tus dudas más comunes
          </p>
        </header>

        <div className="w-full max-w-2xl">
          {faqs.map((faq, i) => (
            <Accordion
              key={i}
              title={faq.title}
              answer={faq.answer}
              isOpen={openIndex === i}
              onToggle={() => handleToggle(i)}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default FAQSection;
