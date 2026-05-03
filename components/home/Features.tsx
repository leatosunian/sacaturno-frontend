import React from "react";
import { motion } from "framer-motion";
import { IoIosInfinite } from "react-icons/io";
import { Badge } from "./Badge";

const Zap: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M13 2L3 14h9l-1 8L21 10h-9l1-8z" />
    </svg>
);

const Star: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2l2.9 6.3L21 9.3l-4.5 4.1L17.8 21 12 17.8 6.2 21l1.3-7.6L3 9.3l6.1-1L12 2z" />
    </svg>
);

const Mail: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
        <path d="M22 6l-10 7L2 6" />
    </svg>
);

const Loop: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M23 4v6h-6" />
        <path d="M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0 1 14.98-3.36L23 10" />
        <path d="M20.49 15a9 9 0 0 1-14.98 3.36L1 14" />
    </svg>
);

const Calendar: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />
        <path d="M16 3v4M8 3v4" />
        <path d="M3 11h18" />
    </svg>
);



const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...rest }) => (
    <div
        className={`rounded-2xl border bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
        {...rest}
    >
        {children}
    </div>
);

const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...rest }) => (
    <div className={`p-6 ${className}`} {...rest}>
        {children}
    </div>
);

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};
const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const features = [
    {
        title: "Tu recepcionista 24/7",
        description: "Tus clientes pueden reservar su turno en cualquier momento desde tu link personalizado, sin esperas.",
        icon: <Zap className="w-5 h-5" />,
    },
    {
        title: "Control Total de Reservas",
        description: "Agendá turnos reservados manualmente o dejar que tus clientes reserven solos. Vos decidís cómo gestionar tu día.",
        icon: <Calendar className="w-5 h-5" />,
    },
    {
        title: "Automatizá tu Agenda",
        description: "Configurá la renovación automática de tu agenda y no pierdas tiempo cargando turnos cada semana.",
        icon: <Loop className="w-5 h-5" />,
    },
    {
        title: "Servicios Ilimitados",
        description: "Definí duración, precio y descripción para cada servicio que ofrecés.",
        icon: <IoIosInfinite className="w-6 h-6" />,
    },
    {
        title: "Cobro de señas",
        description: "Pedí un anticipo al reservar. Turno confirmado solo cuando se paga. Reducí las ausencias.",
        icon: <Star className="w-5 h-5" />,
    },
    {
        title: "Recordatorios automáticos",
        description: "Por email antes del turno. Los no-shows bajan hasta 98%.",
        icon: <Mail className="w-5 h-5" />,
    },
];

export default function Features() {
    return (
        <section id="features" className="w-full pt-24 pb-16 lg:py-18 2xl:py-24">
            <div className="px-4 mx-auto max-w-7xl md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center mb-8 lg:mb-10 2xl:mb-12 space-y-3 2xl:space-y-4 text-center"
                >
                    <Badge className="rounded-full text-orange-600 bg-orange-50 px-4 py-1.5 text-sm font-medium" variant="secondary">
                        Ahorrá tu tiempo
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Todo lo que necesitás para profesionalizar tus turnos</h2>
                    <p className="max-w-[800px] text-slate-600 dark:text-slate-300 md:text-base 2xl:text-lg">
                        Olvidate de contestar decenas de mensajes y de anotar en agendas de papel. SacaTurno gestiona y automatiza tu proceso de reservas para que vos te enfoques en brindar el mejor servicio a tus clientes.
                    </p>
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid gap-4 lg:gap-4 2xl:gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {features.map((feature, i) => (
                        <motion.div key={i} variants={item}>
                            <Card className="h-full overflow-hidden  border-border/40 bg-gradient-to-b from-white to-slate-50/60 dark:from-gray-900 dark:to-gray-800/40  bg-white/10 border shadow-md hover:shadow-md hover:border-orange-800/15   transition-all duration-200 md:hover:shadow-orange-800/20 cursor-pointer">
                                <CardContent className="flex cursor-pointer flex-col h-full p-4 lg:p-5 2xl:p-6">
                                    <div className="flex items-center justify-center w-10 h-10 lg:w-10 lg:h-10 2xl:w-12 2xl:h-12 mb-3 2xl:mb-4 text-orange-600 rounded-full bg-orange-50 dark:bg-orange-900/10 dark:text-orange-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="mb-1.5 2xl:mb-2 text-lg lg:text-lg 2xl:text-xl font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
                                    <p className="text-sm lg:text-sm 2xl:text-base text-slate-600 dark:text-slate-300">{feature.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}