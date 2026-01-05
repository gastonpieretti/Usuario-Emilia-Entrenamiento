"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-background to-primary/20 pt-16">
            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl opacity-50 animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50" />

            <div className="container px-4 md:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 text-center md:text-left space-y-6"
                >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
                        Transforma tu <span className="text-gradient">Cuerpo</span>, <br />
                        Renueva tu <span className="text-primary">Vida</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto md:mx-0">
                        Planes de entrenamiento y nutrición personalizados para mujeres reales.
                        Logra tus objetivos con un enfoque delicado, sostenible y efectivo.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Button size="lg" className="shadow-lg shadow-primary/25">
                            Comenzar Ahora
                        </Button>
                        <Button size="lg" variant="outline">
                            Ver Planes
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex-1 relative"
                >
                    {/* Placeholder for Hero Image - Using a glass card effect for now */}
                    <div className="relative w-full max-w-md mx-auto aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl glass flex items-center justify-center border-white/50">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10" />
                        <div className="text-center p-8">
                            <p className="text-muted-foreground italic">
                                "Tu mejor versión comienza hoy"
                            </p>
                            {/* If we had an image, it would go here. 
                  <Image src="/hero.jpg" alt="Emilia" fill className="object-cover" /> 
              */}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
