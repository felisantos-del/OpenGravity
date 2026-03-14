import { useState, useEffect } from 'react';
import { Search, Plus, Boxes, ArrowRightLeft, History, MoreVertical, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Asset {
  id: string;
  tag: string;
  description: string;
  location: string;
  status: string;
  updated_at: string;
}

export default function AssetManager() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const resp = await fetch('http://localhost:3001/api/assets');
      if (!resp.ok) throw new Error('Falha ao buscar assets');
      const data = await resp.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar ativos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(a => 
    a.tag.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header do Módulo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestão de Ativos</h1>
          <p className="text-slate-500 font-medium">Controle patrimonial e inventário offline</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <History size={20} /> Histórico
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <Plus size={20} /> Novo Ativo
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por TAG ou Descrição..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-4 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 transition-all">
          <Filter size={20} />
        </button>
      </div>

      {/* Tabela de Ativos */}
      <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 italic font-medium text-slate-400 text-sm">
                <th className="px-8 py-5">TAG</th>
                <th className="px-8 py-5">Descrição</th>
                <th className="px-8 py-5">Localização</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Ações {showAddModal && '(Modal Ativo)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredAssets.map((asset) => (
                  <motion.tr 
                    key={asset.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-white/80 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 font-mono font-bold rounded-lg text-xs">
                        {asset.tag}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-800 font-bold">{asset.description}</td>
                    <td className="px-8 py-5 text-slate-500 font-medium">{asset.location}</td>
                    <td className="px-8 py-5 text-slate-500 font-medium text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" /> {asset.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                          <ArrowRightLeft size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="font-bold">Carregando inventário...</p>
            </div>
          )}

          {!loading && filteredAssets.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Boxes size={48} className="opacity-20 mb-2" />
              <p className="font-bold">Nenhum ativo encontrado</p>
              <p className="text-sm">Tente mudar o termo de busca ou adicione um novo item.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
