import { useState } from 'react';
import { 
  BarChart3,
  Boxes, 
  CalendarCheck, 
  Contact,
  Cpu, 
  Headset, 
  LayoutDashboard, 
  LogOut, 
  User 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import AssetManager from './components/AssetManager';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// === COMPONENTES BASE ===

const ModuleCard = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  badge, 
  onClick 
}: { 
  title: string; 
  description: string; 
  icon: any; 
  color: string; 
  badge?: string;
  onClick: () => void;
}) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="relative flex flex-col justify-between min-h-[180px] p-8 glass-card rounded-3xl cursor-pointer overflow-hidden"
  >
    {badge && (
      <div className="absolute top-6 right-6 px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse uppercase tracking-wider">
        {badge}
      </div>
    )}
    
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6", color)}>
      <Icon size={28} />
    </div>

    <div>
      <h3 className="text-xl font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 font-medium">{description}</p>
    </div>
  </motion.div>
);

// === APP PRINCIPAL ===

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [userName] = useState('Felipe');

  const modules = [
    {
      id: 'snp',
      title: 'Módulo SNP',
      description: 'Gestão de chamados e incidentes (SLA)',
      icon: Headset,
      color: 'bg-gradient-to-br from-violet-500 to-violet-700',
      badge: '1 Crítico'
    },
    {
      id: 'pessoas',
      title: 'Pessoas',
      description: 'Controle de RH e colaboradores',
      icon: Contact,
      color: 'bg-gradient-to-br from-sky-500 to-sky-700',
      badge: '42 Ativos'
    },
    {
      id: 'patrimonio',
      title: 'Gestão de Ativos',
      description: 'Controle patrimonial e inventário',
      icon: Boxes,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-700'
    },
    {
      id: 'locus',
      title: 'Locus',
      description: 'Agendamentos e reservas de espaço',
      icon: CalendarCheck,
      color: 'bg-gradient-to-br from-amber-500 to-amber-700',
      badge: '4 Agendados'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8] selection:bg-violet-200">
      {/* Background Ornaments */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
          <div className="bg-nuart-dark p-2 rounded-xl text-white">
            <Cpu size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-800 uppercase">
            Nuart <span className="text-violet-600">Command</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 font-semibold text-slate-600">
            <div className="w-10 h-10 rounded-full bg-nuart-gradient flex items-center justify-center text-white shadow-md">
              <User size={20} />
            </div>
            <span className="hidden md:block">{userName}</span>
          </div>
          <button className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {activeView === 'dashboard' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div>
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
                Bom dia, {userName}! 👋
              </h1>
              <p className="text-slate-500 font-medium text-lg">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {modules.map((mod) => (
                <ModuleCard
                  key={mod.id}
                  {...mod}
                  onClick={() => setActiveView(mod.id)}
                />
              ))}
            </div>

            {/* Quick Stats / Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card rounded-[32px] p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="text-violet-500" /> Atividade Recente
                  </h2>
                  <button className="text-sm font-bold text-violet-600 hover:underline">Ver tudo</button>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Boxes size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">NB-1090 Instalado na Sala 301</p>
                        <p className="text-xs text-slate-500 font-medium">Há 15 minutos por Augusto</p>
                      </div>
                      <span className="text-xs font-bold text-slate-400">14:23</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-[32px] p-8 bg-gradient-to-br from-nuart-dark to-slate-900 text-white border-none">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <LayoutDashboard className="text-sky-400" /> Painel Geral
                </h2>
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Chamados Críticos</p>
                    <p className="text-3xl font-black">01</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Itens em Trânsito</p>
                    <p className="text-3xl font-black">12</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">SLA Preventiva</p>
                    <p className="text-3xl font-black">98%</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeView === 'patrimonio' ? (
          <AssetManager />
        ) : (
          <div className="text-center py-20">
            <p className="text-3xl font-bold text-slate-800 mb-4 uppercase">Módulo {activeView}</p>
            <p className="text-slate-400 italic mb-8">Esta funcionalidade está sendo migrada para o novo banco de dados SQLite local.</p>
            <button 
              onClick={() => setActiveView('dashboard')} 
              className="px-8 py-3 bg-nuart-gradient text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Voltar ao Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
