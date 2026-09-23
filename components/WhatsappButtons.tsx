import React from 'react';
import { MessageCircle } from 'lucide-react';

const WHATSAPPS = [
  { label: "Entrar em contato", number: "5521972513478" },
];

const MESSAGE = encodeURIComponent("Olá, vim através do sistema Consulta Processo IA e gostaria de mais informações sobre meu processo");

interface WhatsappButtonsProps {
  className?: string;
  variant?: 'default' | 'outline';
}

export const WhatsappButtons: React.FC<WhatsappButtonsProps> = ({ className, variant = 'default' }) => {
  return (
    <div className={`flex flex-wrap gap-3 justify-center ${className || ''}`}>
        {WHATSAPPS.map((wa) => (
            <a 
                key={wa.number}
                href={`https://wa.me/${wa.number}?text=${MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                  h-9 px-4 py-2 gap-2
                  ${variant === 'outline' 
                    ? 'border border-green-600 text-green-500 hover:bg-green-600/10' 
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-md'}
                `}
            >
                <MessageCircle size={16} />
                {wa.label}
            </a>
        ))}
    </div>
  );
}