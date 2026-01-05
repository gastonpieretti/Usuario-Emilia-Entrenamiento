"use client";

import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background font-sans selection:bg-primary/30">
      <Navbar />
      <Hero />

      {/* Features / Services Section */}
      <section id="planes" className="py-20 container px-4 md:px-8 mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Nuestros Planes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Elige el plan perfecto para ti. Todos incluyen soporte personalizado y acceso a nuestra app.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Entrenamiento",
              desc: "Rutinas para casa o gimnasio adaptadas a tu nivel.",
              price: "Desde $20/mes",
              features: ["App Móvil", "Videos Explicativos", "Soporte 24/7"]
            },
            {
              title: "Nutrición + Entrenamiento",
              desc: "El plan más completo para resultados acelerados.",
              price: "Desde $40/mes",
              features: ["Todo lo de Entrenamiento", "Plan de Comidas", "Lista de Compras"],
              highlight: true
            },
            {
              title: "Nutrición",
              desc: "Aprende a comer saludable sin dietas restrictivas.",
              price: "Desde $25/mes",
              features: ["Menú Semanal", "Recetas Saludables", "Guía de Porciones"]
            }
          ].map((plan, i) => (
            <Card key={i} className={`relative overflow-hidden transition-all hover:shadow-lg ${plan.highlight ? 'border-primary shadow-md ring-1 ring-primary/20' : ''}`}>
              {plan.highlight && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Más Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription>{plan.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-2xl font-bold text-accent">{plan.price}</div>
                <ul className="space-y-2">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.highlight ? "default" : "outline"}>
                  Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container px-4 md:px-8 mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">¿No sabes qué plan elegir?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Responde unas simples preguntas y te recomendaremos el plan ideal para tu cuerpo y objetivos.
          </p>
          <Button size="lg" className="rounded-full px-8">
            Hacer Test Gratuito
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-background">
        <div className="container px-4 md:px-8 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-lg">EMILIA ENTRENAMIENTO APP</h3>
            <p className="text-sm text-muted-foreground">© 2025 Todos los derechos reservados.</p>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary">Instagram</a>
            <a href="#" className="hover:text-primary">Contacto</a>
            <a href="#" className="hover:text-primary">Términos</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
