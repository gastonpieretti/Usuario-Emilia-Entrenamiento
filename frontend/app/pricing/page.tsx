import PricingTable from '@/components/PricingTable';

export const metadata = {
    title: 'Planes y Precios | MiAppFitness',
    description: 'Elige el plan de entrenamiento perfecto para ti. Planes de 30, 60 y 90 días.',
};

export default function PricingPage() {
    return (
        <main>
            <PricingTable />
        </main>
    );
}
