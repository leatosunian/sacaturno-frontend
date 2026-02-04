// ...existing code...
import { FC } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const CallToAction: FC = () => {
    return (
        // section centered on the x axis
        <section className="relative flex justify-center w-full py-20 overflow-hidden bg-gradient-to-br from-orange-800 to-orange-700/80 text-primary-foreground">
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            <div className="absolute w-64 h-64 rounded-full -top-24 -left-24 bg-white/10 blur-3xl"></div>
            <div className="absolute w-64 h-64 rounded-full -bottom-24 -right-24 bg-white/10 blur-3xl"></div>

            {/* centered container with max width */}
            <div className="relative w-full px-4 max-w-7xl md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center mx-auto space-y-6 text-center"
                >
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                        ¿Qué esperás para transformar tu negocio?
                    </h2>
                    <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
                        Tus clientes esperan una experiencia moderna y rápida. Dales la herramienta que merecen y profesionalizá tu marca.
                    </p>
                    <div className="flex flex-col gap-4 mt-4 sm:flex-row">
                        <Link href="/register" >
                            <Button size="lg" variant="secondary" className="h-12 px-8 text-base rounded-full">
                                Comenzar Prueba Gratuita
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                        {/* <Button
                            size="lg"
                            variant="outline"
                            className="h-12 px-8 text-base text-white bg-transparent border-white rounded-full hover:bg-white/10"
                        >
                            Schedule a Demo
                        </Button> */}
                    </div>
                    <p className="mt-4 text-base text-primary-foreground/80">
                        15 días de prueba full. Sin costos ocultos. Cancelá cuando quieras.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

export default CallToAction
// ...existing code...