"use client";

import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const PricingTable = () => {
    const plans = [
        {
            title: "PLAN 30 DÍAS",
            oldPrice: "$2800",
            price: "$2600",
            colors: {
                bg: "bg-gradient-to-b from-purple-400 to-purple-700",
                shadow: "shadow-purple-500/40",
                badge: "bg-purple-800",
            },
            features: [
                "Plan de alimentación",
                "Plan de entrenamiento",
                "Clases grabadas",
                "Aplicación web",
                "Comunidad",
                "Soporte",
            ],
            days: 30,
        },
        {
            title: "PLAN 60 DÍAS",
            oldPrice: "$5600",
            price: "$5200",
            isPopular: true,
            colors: {
                bg: "bg-gradient-to-b from-yellow-300 to-yellow-500",
                shadow: "shadow-yellow-500/40",
                badge: "bg-yellow-600",
            },
            features: [
                "Plan de alimentación",
                "Plan de entrenamiento",
                "Clases grabadas",
                "Aplicación web",
                "Comunidad",
                "Soporte",
            ],
            days: 60,
        },
        {
            title: "PLAN 90 DÍAS",
            oldPrice: "$8400",
            price: "$7800",
            colors: {
                bg: "bg-gradient-to-b from-orange-400 to-orange-600",
                shadow: "shadow-orange-500/40",
                badge: "bg-orange-700",
            },
            features: [
                "Plan de alimentación",
                "Plan de entrenamiento",
                "Clases grabadas",
                "Aplicación web",
                "Comunidad",
                "Soporte",
            ],
            days: 90,
        },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full items-start">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.days}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative flex flex-col rounded-2xl overflow-hidden ${plan.colors.bg} text-white shadow-xl ${plan.colors.shadow} ${plan.isPopular ? 'md:-mt-8 md:mb-8 z-10 transform md:scale-105' : ''
                            }`}
                    >
                        {/* Price Badge Circle */}
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-yellow-400 text-gray-900 rounded-full w-24 h-24 flex flex-col items-center justify-center font-bold transform rotate-12 shadow-lg z-20 border-4 border-white/20">
                            <span className="text-sm line-through opacity-70">{plan.oldPrice}</span>
                            <span className="text-xl">{plan.price}</span>
                        </div>

                        {/* Header */}
                        <div className="pt-12 pb-8 px-6 text-center relative z-10">
                            <div className="bg-white text-gray-900 py-3 px-6 rounded-b-xl shadow-md inline-block transform -skew-x-6 mx-auto absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5">
                                <h3 className="text-2xl font-black uppercase transform skew-x-6 leading-none">
                                    {plan.title.split(' ').map((word, i) => (
                                        <span key={i} className="block">{word}</span>
                                    ))}
                                </h3>
                            </div>
                            {/* Spacer for the absolute header */}
                            <div className="h-4"></div>
                        </div>

                        {/* Features */}
                        <div className="flex-1 px-8 py-6 space-y-4">
                            {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-center space-x-3">
                                    <Check className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
                                    <span className="font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="p-6 space-y-3 bg-black/10 backdrop-blur-sm">
                            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded shadow-lg transition-transform transform hover:scale-105 uppercase text-sm">
                                Comprar con<br />Tarjeta de Crédito
                            </button>
                            <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded shadow transition-colors uppercase text-xs">
                                Comprar por<br />Transferencia
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
            <div className="mt-12 text-gray-400 text-sm font-medium">
                designed by freepik style
            </div>
        </div>
    );
};

export default PricingTable;
