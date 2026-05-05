import { Outlet, NavLink } from 'react-router-dom';
import { obtenerVersion } from '../utils/config';
export default function LayoutMain() {
  return (
    <>
      {/* BRAND */}
      <div className="bg-white border-b-[3px] border-[#1565C0] py-[10px] px-6 shadow-[0_2px_8px_rgba(21,101,192,0.12)] print:hidden">
        <div className="max-w-[1200px] mx-auto flex items-center gap-6">
          <svg className="h-[68px] shrink-0 max-sm:h-[50px]" viewBox="0 0 420 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M37 22 Q29 10 21 14 Q15 21 19 31" stroke="#ABABAB" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M63 22 Q71 10 79 14 Q85 21 81 31" stroke="#ABABAB" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M19 31 C19 50 50 58 50 58" stroke="#3D3D3D" strokeWidth="5.5" fill="none" strokeLinecap="round"/>
            <path d="M81 31 C81 50 50 58 50 58" stroke="#3D3D3D" strokeWidth="5.5" fill="none" strokeLinecap="round"/>
            <text x="50" y="46" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#777" fontFamily="Arial,sans-serif" letterSpacing="1.8">IPS</text>
            <line x1="50" y1="58" x2="50" y2="91" stroke="#3D3D3D" strokeWidth="5.5" strokeLinecap="round"/>
            <circle cx="50" cy="97" r="14" fill="#9A9A9A"/><circle cx="50" cy="97" r="7" fill="#F2F2F2"/>
            <text x="104" y="53" fontSize="33" fontWeight="900" fill="#1565C0" fontFamily="'Arial Black',Arial,sans-serif" letterSpacing="0.5">CLINICAL</text>
            <text x="104" y="91" fontSize="39" fontWeight="900" fill="#1565C0" fontFamily="'Arial Black',Arial,sans-serif">H</text>
            <circle cx="146" cy="78" r="15.5" fill="#9A9A9A"/><circle cx="146" cy="78" r="7.5" fill="#F2F2F2"/>
            <text x="163" y="91" fontSize="39" fontWeight="900" fill="#1565C0" fontFamily="'Arial Black',Arial,sans-serif">use</text>
            <text x="104" y="107" fontSize="11" fill="#ABABAB" fontFamily="Arial,sans-serif" letterSpacing="0.3">Una Experiencia de Atención</text>
          </svg>
          <div className="w-[1px] h-[50px] bg-[#D0D8E8] shrink-0 max-sm:hidden"></div>
          <div className="flex flex-col gap-[2px] max-sm:hidden">
            <span className="text-[11px] font-semibold text-[#1565C0] uppercase tracking-[1.2px]">Coordinación de Salud Pública</span>
            <span className="text-[10px] text-[#888] tracking-[0.3px]">Programa de Vigilancia Epidemiológica · SIVIGILA</span>
            <span className="text-[10px] text-[#888] tracking-[0.3px]">Norte de Santander · 2026</span>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="bg-[var(--color-navy)] px-6 flex items-center justify-between h-[50px] sticky top-0 z-50 print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-[26px] h-[26px] bg-[var(--color-teal)] rounded-md flex items-center justify-center">
            <svg viewBox="0 0 16 16" className="w-[15px] h-[15px] fill-white"><path d="M8 1L2 4v5c0 3.3 2.5 6.4 6 7.1C12.5 15.4 14 12.3 14 9V4L8 1z"/></svg>
          </div>
          <span className="text-white text-[13px] font-medium">Verificador BAI-EISP</span>
          <span className="text-white/40 text-[11px] ml-1">IPS Clinical House · SP</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <span className="rounded-[20px] px-2.5 py-0.5 text-[10.5px] font-[var(--font-mono)] bg-[rgba(239,159,39,.3)] border-[0.5px] border-[rgba(239,159,39,.5)] text-[#FAC775]">{obtenerVersion()} -  XLSX nativo · Fichas 995/998 </span>
          <span className="rounded-[20px] px-2.5 py-0.5 text-[10.5px] font-[var(--font-mono)] bg-[rgba(0,168,150,.2)] border-[0.5px] border-[rgba(0,168,150,.4)] text-[#9FE1CB]">807 CIE-10</span>
          <span className="rounded-[20px] px-2.5 py-0.5 text-[10.5px] font-[var(--font-mono)] bg-[rgba(255,255,255,.1)] border-[0.5px] border-[rgba(255,255,255,.2)] text-white/65">N. Santander 2026</span>
        </div>
      </header>

      {/* TABS (Navbar) */}
      <div className="max-w-[1200px] mx-auto pt-3.5 px-5 flex gap-1 max-sm:overflow-x-auto max-sm:pb-0 print:hidden">
        <NavLink 
          to="/bai" 
          className={({isActive}) => `px-4 py-2 rounded-t-lg text-[12px] font-medium cursor-pointer border-[0.5px] border-b-0 relative top-[1px] whitespace-nowrap transition-all duration-150 border-t-[3px] border-t-[var(--color-teal)] ${isActive ? 'bg-white text-[var(--color-navy)] font-semibold border-[var(--color-br)] z-10' : 'bg-[var(--color-gl)] text-[var(--color-ts)] border-l-[var(--color-gm)] border-r-[var(--color-gm)] hover:bg-[var(--color-gm)]'}`
        }>
          🔍 BAI-EISP
        </NavLink>
        <NavLink 
          to="/rips" 
          className={({isActive}) => `px-4 py-2 rounded-t-lg text-[12px] font-medium cursor-pointer border-[0.5px] border-b-0 relative top-[1px] whitespace-nowrap transition-all duration-150 border-t-[3px] border-t-[#7B1FA2] ${isActive ? 'bg-white text-[var(--color-navy)] font-semibold border-[var(--color-br)] z-10' : 'bg-[var(--color-gl)] text-[var(--color-ts)] border-l-[var(--color-gm)] border-r-[var(--color-gm)] hover:bg-[var(--color-gm)]'}`
        }>
          📂 Cargar RIPS
        </NavLink>
        <NavLink 
          to="/ficha-995" 
          className={({isActive}) => `px-4 py-2 rounded-t-lg text-[12px] font-medium cursor-pointer border-[0.5px] border-b-0 relative top-[1px] whitespace-nowrap transition-all duration-150 border-t-[3px] border-t-[var(--color-ira)] ${isActive ? 'bg-white text-[var(--color-navy)] font-semibold border-[var(--color-br)] z-10' : 'bg-[var(--color-gl)] text-[var(--color-ts)] border-l-[var(--color-gm)] border-r-[var(--color-gm)] hover:bg-[var(--color-gm)]'}`
        }>
          📋 Ficha 995 · IRA
        </NavLink>
        <NavLink 
          to="/ficha-998" 
          className={({isActive}) => `px-4 py-2 rounded-t-lg text-[12px] font-medium cursor-pointer border-[0.5px] border-b-0 relative top-[1px] whitespace-nowrap transition-all duration-150 border-t-[3px] border-t-[var(--color-eda)] ${isActive ? 'bg-white text-[var(--color-navy)] font-semibold border-[var(--color-br)] z-10' : 'bg-[var(--color-gl)] text-[var(--color-ts)] border-l-[var(--color-gm)] border-r-[var(--color-gm)] hover:bg-[var(--color-gm)]'}`
        }>
          📋 Ficha 998 · EDA/Brotes
        </NavLink>
      </div>

      {/* MAIN CONTENT AREA */}
      <main>
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="text-center p-3 text-[11px] text-[var(--color-ts)] border-t-[0.5px] border-[var(--color-br)] mt-5 bg-white max-w-[1200px] mx-auto w-full">
        IPS Clinical House S.A.S. · ISO 9001:2015 SC-CER677878 · Coordinación de Salud Pública<br/>
        Av. 1 Nro 22-44, El Rosal, Cúcuta · PBX 316 834 3174 · www.clinicalhouse.co<br/>
        <span className="text-[var(--color-gm)]">v7.0 · 807 CIE-10 · Lector RIPS automático · Fichas 995/998 con grupos de edad · IPS sin hospitalización · N. Santander 2026</span>
      </footer>
    </>
  );
}
