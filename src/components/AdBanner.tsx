import React from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBannerProps {
  adSlot?: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle';
  fullWidthResponsive?: boolean;
}

/**
 * AdBanner Real para Google AdSense
 * 
 * INSTRUÇÕES:
 * 1. Certifique-se de que o script do AdSense está no <head> do index.html
 * 2. Substitua o 'data-ad-client' pelo seu Publisher ID (ca-pub-...)
 * 3. Substitua o 'data-ad-slot' pelo ID do bloco de anúncio que criou no Google AdSense
 */
export const AdBanner: React.FC<AdBannerProps> = ({ 
  adSlot = "1353980279", // Seu Ad Slot ID real do AdMob
  adFormat = "auto",
  fullWidthResponsive = true 
}) => {
  const adContainerRef = React.useRef<HTMLDivElement>(null);
  const initialized = React.useRef(false);
  
  React.useEffect(() => {
    // Evita inicialização duplicada no mesmo ciclo de vida (ex: React Strict Mode)
    if (initialized.current) return;

    const tryInitAd = () => {
      // Verifica se o container tem largura para evitar "availableWidth=0"
      if (adContainerRef.current && adContainerRef.current.offsetWidth > 0) {
        try {
          if (typeof window !== 'undefined' && window.adsbygoogle) {
            // Verifica se este elemento específico já tem um anúncio (status "done")
            const insElement = adContainerRef.current.querySelector('ins.adsbygoogle');
            if (insElement && !insElement.hasAttribute('data-adsbygoogle-status')) {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              initialized.current = true;
            }
          }
        } catch (e) {
          console.error("AdSense error inside tryInitAd:", e);
        }
      } else if (adContainerRef.current) {
        // Se ainda não tem largura, tenta novamente em breve (ex: durante transição de página)
        setTimeout(tryInitAd, 500);
      }
    };

    // Pequeno atraso inicial para garantir que o DOM e Layout estejam prontos
    const timer = setTimeout(tryInitAd, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={adContainerRef} className="my-6 overflow-hidden flex flex-col items-center">
      {/* Etiqueta pequena indicando publicidade para transparência */}
      <div className="w-full text-center mb-1">
        <span className="text-[7px] uppercase font-black tracking-widest text-zinc-600">Publicidade</span>
      </div>
      
      <div className="w-full bg-zinc-900/20 rounded-xl border border-white/5 min-h-[100px] flex items-center justify-center relative">
        {/* Bloco de Anúncio Real AdMob/AdSense */}
        <ins className="adsbygoogle"
             style={{ display: 'block', minWidth: '250px', minHeight: '100px' }}
             data-ad-client="ca-pub-5846284780255138" // Seu Publisher ID Real
             data-ad-slot={adSlot}
             data-ad-format={adFormat}
             data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
        ></ins>
      </div>
    </div>
  );
};
