import React from 'react';
import { ServerCrash } from 'lucide-react';

/**
 * Tela de bloqueio total ("Servidor fora do ar").
 * Renderizada quando avaloon_settings.maintenance_mode === true.
 * Cobre o app inteiro — nenhum conteúdo fica acessível por baixo.
 */
const MaintenanceScreen = ({ title, message }) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-screen w-full flex flex-col items-center justify-center gap-8 px-6 py-16 text-center bg-[#050505] selection:bg-secondary/30"
      style={{
        paddingTop: 'max(4rem, env(safe-area-inset-top))',
        paddingBottom: 'max(4rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Ícone */}
      <div className="flex h-24 w-24 md:h-28 md:w-28 shrink-0 items-center justify-center rounded-3xl border border-secondary/30 bg-secondary/10 text-secondary shadow-[0_0_40px_rgba(255,87,34,0.25)] motion-safe:animate-pulse">
        <ServerCrash size={56} strokeWidth={1.5} aria-hidden="true" />
      </div>

      {/* Texto */}
      <div className="max-w-xl">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          {title || 'Servidor fora do ar'}
        </h1>
        <p className="mt-4 text-base md:text-lg leading-relaxed text-zinc-400">
          {message || 'A integração com a Apify (coleta de dados do Instagram) está fora do ar. O serviço será restabelecido em breve.'}
        </p>
      </div>

      {/* Indicador de status */}
      <div className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-widest text-zinc-600">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 motion-safe:animate-pulse"
          aria-hidden="true"
        />
        Sistema indisponível
      </div>
    </div>
  );
};

export default MaintenanceScreen;
