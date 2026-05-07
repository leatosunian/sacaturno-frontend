import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Badge } from "./Badge";
import { Marquee } from "@/components/ui/marquee";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Probé el plan gratuito y a la semana me pasé al Full. Tener todo ilimitado me permitió agregar más servicios y organizar mejor mis tiempos.",
    author: "Facundo García",
    role: "Barbero",
    rating: 5,
  },
  {
    quote:
      "Simple, rápido y efectivo. Mis clientes se adaptaron al toque y yo recuperé mi tranquilidad. No vuelvo al papel ni anotaciones nunca más.",
    author: "Don Fernandez",
    role: "Barbero",
    rating: 5,
  },
  {
    quote:
      "Lo que más valoro es la renovación automática de la agenda. Antes tenía que cargar turnos todas las semanas, ahora el sistema trabaja por mí 24/7.",
    author: "Emilia Lopez",
    role: "Manicura",
    rating: 5,
  },
  {
    quote:
      "El Plan Full vale cada peso. Puedo manejar varios servicios a la vez y el soporte me ayudó rapidísimo cuando tuve una duda. Súper recomendable.",
    author: "Luz",
    role: "Centro de estética",
    rating: 4,
  },
  {
    quote:
      "Tener mi propia web de turnos le dio una imagen mucho más seria a mi servicio. Mis alumnos reservan sus clases y yo tengo el control total desde el celular.",
    author: "Javier Perez",
    role: "Personal trainer",
    rating: 5,
  },
  {
    quote:
      "Necesitaba algo simple para organizar mis consultorios. En 10 minutos configuré mis horarios y empecé a pasar el link. Me ahorra muchísimo estrés administrativo.",
    author: "Dra. Elena B.",
    role: "Nutricionista",
    rating: 5,
  },
  {
    quote:
      "Desde que activé las señas para reservar, los 'no show' bajaron un montón. Mis clientes confirman el turno con la seña y casi nadie falta. Recuperé horas de trabajo que antes perdía esperando.",
    author: "Valentina Torres",
    role: "Esteticista",
    rating: 5,
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="w-[320px] mx-2 shrink-0 overflow-hidden transition-all border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur pointer-events-none md:pointer-events-auto md:hover:shadow-md hover:border-orange-800/15 md:hover:shadow-orange-800/20">
      <CardContent className="flex flex-col h-full p-4">
        <div className="flex mb-3">
          {Array(testimonial.rating)
            .fill(0)
            .map((_, j) => (
              <Star
                key={j}
                className="text-yellow-500 size-3 fill-yellow-500"
              />
            ))}
        </div>
        <p className="flex-grow mb-3 text-sm">{testimonial.quote}</p>
        <div className="flex items-center gap-4 pt-4 mt-auto border-t border-border/40">
          <div className="flex items-center justify-center font-medium rounded-full size-10 bg-muted text-foreground">
            {testimonial.author.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium">{testimonial.author}</p>
            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const firstRow = testimonials.slice(0, 3);
const secondRow = testimonials.slice(3);

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="flex justify-center w-full bg-white pt-24 pb-16 lg:py-18 2xl:py-24"
    >
      <div className="w-full px-4 max-w-8xl md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center mb-12 space-y-4 text-center"
        >
          <Badge
            className="rounded-full text-orange-600 bg-orange-50 px-4 py-1.5 text-sm font-medium"
            variant="secondary"
          >
            Testimonios
          </Badge>
          <h2 className="text-3xl mb-6 font-bold tracking-tight md:text-4xl 2xl:text-5xl">
            Emprendedores que
            <br />
            <span className="text-accent font-extrabold">
              {" "}
              potenciaron su negocio
            </span>
            .
          </h2>
          <p className="max-w-[800px] text-slate-600 dark:text-slate-300 md:text-base 2xl:text-lg">
            Una buena gestión de turnos es la primera impresión que se lleva tu
            cliente. Mirá lo que opinan.
          </p>
        </motion.div>

        <div className="relative flex flex-col gap-0 overflow-hidden">
          <Marquee pauseOnHover className="[--duration:30s]">
            {firstRow.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:30s]">
            {secondRow.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-white" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-white" />
        </div>
      </div>
    </section>
  );
}
