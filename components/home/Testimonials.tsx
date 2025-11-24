// ...existing code...
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Badge } from "./Badge";

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
        rating: 5,
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
];

export default function Testimonials() {
    return (
        // section content centered on the x axis using flex + justify-center.
        <section id="testimonials" className="flex justify-center w-full py-20 ">
            {/* Constrain width and center content with max-w; keeps layout responsive */}
            <div className="w-full px-4 max-w-7xl md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center mb-12 space-y-4 text-center"
                >
                    <Badge className="rounded-full text-orange-600 bg-orange-50 px-4 py-1.5 text-sm font-medium " variant="secondary">
                        Testimonios
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Emprendedores que potenciaron su negocio  </h2>
                    <p className="max-w-[800px] text-muted-foreground md:text-lg">
                        Una buena gestión de turnos es la primera impresión que se lleva tu cliente. Mirá lo que opinan.
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                        >
                            <Card className="h-full overflow-hidden transition-all border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur hover:shadow-md">
                                <CardContent className="flex flex-col h-full p-6">
                                    <div className="flex mb-4">
                                        {Array(testimonial.rating)
                                            .fill(0)
                                            .map((_, j) => (
                                                <Star key={j} className="text-yellow-500 size-4 fill-yellow-500" />
                                            ))}
                                    </div>
                                    <p className="flex-grow mb-6 text-sm">{testimonial.quote}</p>
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
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
// ...existing code...