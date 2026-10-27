import React, { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate, useLocation, Outlet } from "react-router";

// ─── Types ────────────────────────────────────────────────────────────────────

type Usuario = {
  id: string; login: string; nomeExibicao: string;
  tipoUsuario: string; administradorSistema: boolean;
};

type Empresa = {
  id: string; codigo: string; razaoSocial: string; nomeFantasia?: string;
  cnpj: string; municipio?: string; uf?: string; ativa: boolean; criadoEm: string;
};

type Filial = {
  id: string; codigo: string; razaoSocial: string; nomeFantasia?: string;
  cnpj: string; municipio?: string; uf?: string; ativa: boolean;
  matriz: boolean; tipoEstabelecimento: string;
  empresa?: { id: string; codigo: string; razaoSocial: string; nomeFantasia?: string };
};

type UsuarioCad = {
  id: string; login: string; nomeExibicao: string; cpf?: string;
  tipoUsuario: string; administradorSistema: boolean; ativa: boolean; bloqueado: boolean;
  empresa?: { razaoSocial: string }; criadoEm: string;
};

type RegraFiscal = {
  id: string; descricao: string; cfop: string; cst: string;
  tipoOperacao: string; ativa: boolean; vigenciaInicio: string;
  empresa?: { razaoSocial: string };
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const EMPRESAS_MOCK: Empresa[] = [
  { id:"1", codigo:"001", razaoSocial:"Comércio Geral Ltda", nomeFantasia:"ComGeral", cnpj:"11222333000181", municipio:"Florianópolis", uf:"SC", ativa:true, criadoEm:"2023-01-10" },
  { id:"2", codigo:"002", razaoSocial:"Indústria Norte S.A.", nomeFantasia:"IndNorte", cnpj:"22333444000195", municipio:"Joinville", uf:"SC", ativa:true, criadoEm:"2023-03-22" },
  { id:"3", codigo:"003", razaoSocial:"Distribuidora Sul Eireli", cnpj:"33444555000109", municipio:"Blumenau", uf:"SC", ativa:false, criadoEm:"2022-07-15" },
  { id:"4", codigo:"004", razaoSocial:"Tecnologia e Sistemas Ltda", nomeFantasia:"TechSys", cnpj:"44555666000173", municipio:"Chapecó", uf:"SC", ativa:true, criadoEm:"2024-02-01" },
  { id:"5", codigo:"005", razaoSocial:"Agro Export Ltda", nomeFantasia:"AgroEx", cnpj:"55666777000187", municipio:"Lages", uf:"SC", ativa:true, criadoEm:"2024-05-08" },
];

const FILIAIS_MOCK: Filial[] = [
  { id:"1", codigo:"001", razaoSocial:"Comércio Geral Ltda", nomeFantasia:"ComGeral Centro", cnpj:"11222333000181", municipio:"Florianópolis", uf:"SC", ativa:true, matriz:true, tipoEstabelecimento:"MATRIZ", empresa:{ id:"1", codigo:"001", razaoSocial:"Comércio Geral Ltda", nomeFantasia:"ComGeral" } },
  { id:"2", codigo:"002", razaoSocial:"Comércio Geral Ltda", nomeFantasia:"ComGeral Norte", cnpj:"11222333000262", municipio:"São José", uf:"SC", ativa:true, matriz:false, tipoEstabelecimento:"FILIAL", empresa:{ id:"1", codigo:"001", razaoSocial:"Comércio Geral Ltda", nomeFantasia:"ComGeral" } },
  { id:"3", codigo:"001", razaoSocial:"Indústria Norte S.A.", cnpj:"22333444000195", municipio:"Joinville", uf:"SC", ativa:true, matriz:true, tipoEstabelecimento:"MATRIZ", empresa:{ id:"2", codigo:"002", razaoSocial:"Indústria Norte S.A.", nomeFantasia:"IndNorte" } },
  { id:"4", codigo:"002", razaoSocial:"Indústria Norte S.A.", cnpj:"22333444000276", municipio:"Curitiba", uf:"PR", ativa:false, matriz:false, tipoEstabelecimento:"FILIAL", empresa:{ id:"2", codigo:"002", razaoSocial:"Indústria Norte S.A.", nomeFantasia:"IndNorte" } },
  { id:"5", codigo:"001", razaoSocial:"Distribuidora Sul Eireli", cnpj:"33444555000109", municipio:"Blumenau", uf:"SC", ativa:false, matriz:true, tipoEstabelecimento:"MATRIZ", empresa:{ id:"3", codigo:"003", razaoSocial:"Distribuidora Sul Eireli" } },
  { id:"6", codigo:"001", razaoSocial:"Tecnologia e Sistemas Ltda", nomeFantasia:"TechSys HQ", cnpj:"44555666000173", municipio:"Chapecó", uf:"SC", ativa:true, matriz:true, tipoEstabelecimento:"MATRIZ", empresa:{ id:"4", codigo:"004", razaoSocial:"Tecnologia e Sistemas Ltda", nomeFantasia:"TechSys" } },
];

const USUARIOS_MOCK: UsuarioCad[] = [
  { id:"1", login:"admin", nomeExibicao:"Administrador Sistema", tipoUsuario:"ADMINISTRADOR", administradorSistema:true, ativa:true, bloqueado:false, criadoEm:"2023-01-01" },
  { id:"2", login:"joao.silva", nomeExibicao:"João Silva", cpf:"12345678901", tipoUsuario:"GERENTE", administradorSistema:false, ativa:true, bloqueado:false, empresa:{ razaoSocial:"Comércio Geral Ltda" }, criadoEm:"2023-02-14" },
  { id:"3", login:"maria.costa", nomeExibicao:"Maria Costa", cpf:"98765432100", tipoUsuario:"OPERADOR", administradorSistema:false, ativa:true, bloqueado:false, empresa:{ razaoSocial:"Indústria Norte S.A." }, criadoEm:"2023-04-30" },
  { id:"4", login:"pedro.souza", nomeExibicao:"Pedro Souza", cpf:"45678901234", tipoUsuario:"CONSULTOR", administradorSistema:false, ativa:false, bloqueado:false, empresa:{ razaoSocial:"Tecnologia e Sistemas Ltda" }, criadoEm:"2023-06-18" },
  { id:"5", login:"ana.ferreira", nomeExibicao:"Ana Ferreira", cpf:"32109876543", tipoUsuario:"OPERADOR", administradorSistema:false, ativa:true, bloqueado:true, empresa:{ razaoSocial:"Agro Export Ltda" }, criadoEm:"2024-01-22" },
];

const REGRAS_MOCK: RegraFiscal[] = [
  { id:"1", descricao:"Venda de mercadorias para SC", cfop:"5102", cst:"00", tipoOperacao:"SAÍDA", ativa:true, vigenciaInicio:"2024-01-01", empresa:{ razaoSocial:"Comércio Geral Ltda" } },
  { id:"2", descricao:"Compra de matéria-prima do PR", cfop:"2101", cst:"50", tipoOperacao:"ENTRADA", ativa:true, vigenciaInicio:"2024-01-01", empresa:{ razaoSocial:"Indústria Norte S.A." } },
  { id:"3", descricao:"Transferência entre filiais SC", cfop:"5152", cst:"10", tipoOperacao:"SAÍDA", ativa:true, vigenciaInicio:"2023-07-01", empresa:{ razaoSocial:"Comércio Geral Ltda" } },
  { id:"4", descricao:"Devolução de venda estadual", cfop:"1201", cst:"00", tipoOperacao:"ENTRADA", ativa:false, vigenciaInicio:"2022-01-01", empresa:{ razaoSocial:"Distribuidora Sul Eireli" } },
  { id:"5", descricao:"Exportação direta de produto", cfop:"7101", cst:"40", tipoOperacao:"SAÍDA", ativa:true, vigenciaInicio:"2024-03-15", empresa:{ razaoSocial:"Agro Export Ltda" } },
  { id:"6", descricao:"Prestação de serviço tributado", cfop:"5933", cst:"90", tipoOperacao:"SAÍDA", ativa:true, vigenciaInicio:"2024-06-01", empresa:{ razaoSocial:"Tecnologia e Sistemas Ltda" } },
];

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtCnpj(v: string) {
  const n = v.replace(/\D/g, "");
  if (n.length !== 14) return v;
  return n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}
function fmtCpf(v: string) {
  const n = v.replace(/\D/g, "");
  if (n.length !== 11) return v;
  return n.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}
function fmtData(v: string) {
  if (!v) return "—";
  try { return new Intl.DateTimeFormat("pt-BR").format(new Date(v + "T00:00:00")); } catch { return v; }
}
function nomeEmpresa(e: Empresa | Filial) { return (e.nomeFantasia?.trim() || e.razaoSocial); }

// ─── Auth Context ─────────────────────────────────────────────────────────────

type AuthCtx = {
  usuario: Usuario | null;
  autenticado: boolean;
  carregando: boolean;
  entrar: (login: string, senha: string) => Promise<void>;
  sair: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem("master-erp:session");
    if (raw) {
      try { setUsuario(JSON.parse(raw) as Usuario); } catch { sessionStorage.removeItem("master-erp:session"); }
    }
    setCarregando(false);
  }, []);

  const entrar = useCallback(async (login: string, senha: string) => {
    await new Promise(r => setTimeout(r, 700));
    if (senha.length < 4) throw new Error("Credenciais inválidas.");
    const u: Usuario = {
      id: "1", login,
      nomeExibicao: login === "admin" ? "Administrador Sistema" : login.replace(".", " ").replace(/\b\w/g, c => c.toUpperCase()),
      tipoUsuario: login === "admin" ? "ADMINISTRADOR" : "GERENTE",
      administradorSistema: login === "admin",
    };
    sessionStorage.setItem("master-erp:session", JSON.stringify(u));
    setUsuario(u);
  }, []);

  const sair = useCallback(() => {
    sessionStorage.removeItem("master-erp:session");
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, autenticado: !!usuario, carregando, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}

// ─── UI Primitives ────────────────────────────────────────────────────────────

function Badge({ ativa, label }: { ativa: boolean; label?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
      ativa ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${ativa ? "bg-emerald-500" : "bg-slate-400"}`} />
      {label ?? (ativa ? "Ativa" : "Inativa")}
    </span>
  );
}

function Btn({ onClick, disabled, variant = "primary", size = "md", children, type = "button", className = "" }: {
  onClick?: () => void; disabled?: boolean; variant?: "primary"|"secondary"|"ghost"|"danger"|"success";
  size?: "sm"|"md"; children: ReactNode; type?: "button"|"submit"; className?: string;
}) {
  const base = "inline-flex items-center gap-1.5 font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const sz = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const v = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
  }[variant];
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sz} ${v} ${className}`}>{children}</button>;
}

function Modal({ title, eyebrow, onClose, children, width = "max-w-xl" }: {
  title: string; eyebrow?: string; onClose: () => void; children: ReactNode; width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] flex flex-col`}>
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            {eyebrow && <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">{eyebrow}</p>}
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none ml-4 mt-0.5">×</button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = "text", disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition" />
  );
}

function Select({ value, onChange, children, disabled }: {
  value: string; onChange: (v: string) => void; children: ReactNode; disabled?: boolean;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition">
      {children}
    </select>
  );
}

function Alert({ type, children }: { type: "success"|"error"|"info"; children: ReactNode }) {
  const s = { success:"bg-emerald-50 border-emerald-200 text-emerald-800", error:"bg-red-50 border-red-200 text-red-800", info:"bg-blue-50 border-blue-200 text-blue-800" }[type];
  return <div className={`px-4 py-3 rounded-xl border text-sm ${s}`}>{children}</div>;
}

function TableState({ icon, title, sub, action }: { icon: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
      <span className="text-5xl">{icon}</span>
      <strong className="text-slate-600 text-base">{title}</strong>
      {sub && <p className="text-sm">{sub}</p>}
      {action}
    </div>
  );
}

function Spinner() {
  return <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />;
}

// ─── App Shell ────────────────────────────────────────────────────────────────

type NavItem = { to: string; label: string; icon: string; end?: boolean };
type NavGroup = { group: string; color: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    group: "Principal", color: "text-white/30",
    items: [
      { to:"/", label:"Dashboard", icon:"⌂", end:true },
    ],
  },
  {
    group: "Fiscal", color: "text-white/30",
    items: [
      { to:"/empresas", label:"Empresas", icon:"▦" },
      { to:"/filiais", label:"Filiais", icon:"◇" },
      { to:"/usuarios", label:"Usuários", icon:"♙" },
      { to:"/regras-fiscais", label:"Regras fiscais", icon:"§" },
      { to:"/resolver-fiscal", label:"Resolvedor fiscal", icon:"⌘" },
    ],
  },
  {
    group: "Administrativo", color: "text-amber-400/60",
    items: [
      { to:"/adm/funcionarios", label:"Funcionários", icon:"👤" },
      { to:"/adm/cargos", label:"Cargos e depto.", icon:"🏢" },
      { to:"/adm/ponto", label:"Controle de ponto", icon:"🕐" },
      { to:"/adm/folha", label:"Folha de pagamento", icon:"💰" },
    ],
  },
  {
    group: "Manufatura", color: "text-violet-400/60",
    items: [
      { to:"/mfg/ordens", label:"Ordens de produção", icon:"⚙" },
      { to:"/mfg/estrutura", label:"Estrutura de produto", icon:"🔩" },
      { to:"/mfg/centros", label:"Centros de trabalho", icon:"🏭" },
      { to:"/mfg/roteiros", label:"Roteiros", icon:"📋" },
    ],
  },
  {
    group: "Suprimentos", color: "text-emerald-400/60",
    items: [
      { to:"/sup/fornecedores", label:"Fornecedores", icon:"🤝" },
      { to:"/sup/cotacoes", label:"Cotações", icon:"📊" },
      { to:"/sup/pedidos", label:"Pedidos de compra", icon:"🛒" },
      { to:"/sup/estoque", label:"Estoque", icon:"📦" },
    ],
  },
  {
    group: "Configurações", color: "text-slate-400/60",
    items: [
      { to:"/config/parametros", label:"Parâmetros", icon:"⚙" },
      { to:"/config/numeracoes", label:"Numerações", icon:"#" },
      { to:"/config/certificado", label:"Certificado digital", icon:"🔐" },
      { to:"/config/backup", label:"Backup", icon:"💾" },
    ],
  },
];

function SidebarNavGroup({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-1">
      <button onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${group.color} hover:text-white/50 transition`}>
        {group.group}
        <span className="text-[8px]">{open ? "▾" : "▸"}</span>
      </button>
      {open && group.items.map(item => (
        <NavLink key={item.to} to={item.to} end={item.end}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium mb-0.5 transition-all ${
              isActive ? "bg-blue-600 text-white shadow" : "text-white/55 hover:bg-white/10 hover:text-white"
            }`
          }>
          <span className="text-sm w-5 text-center">{item.icon}</span>
          <span className="truncate">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}

function AppShell({ onBack }: { onBack: () => void }) {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#f0f3f8] font-[Inter,sans-serif]">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#0f1623] flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">M</div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Master ERP</p>
            <p className="text-white/40 text-xs">Gestão integrada</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {NAV_GROUPS.map(g => <SidebarNavGroup key={g.group} group={g} />)}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <Btn onClick={onBack} variant="ghost" size="sm"
            className="w-full text-white/50 hover:text-white hover:bg-white/10 justify-start mb-1">
            ← Portal de sistemas
          </Btn>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {usuario?.nomeExibicao.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate">{usuario?.nomeExibicao}</p>
              <p className="text-white/40 text-xs truncate">{usuario?.login}</p>
            </div>
          </div>
          <button onClick={() => { sair(); navigate("/login", { replace:true }); }}
            className="w-full text-xs text-white/50 hover:text-white hover:bg-white/10 rounded-lg px-3 py-2 transition text-left">
            ← Sair do sistema
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div>
            <p className="text-xs text-slate-400 font-medium">Ambiente administrativo</p>
            <p className="text-sm font-bold text-slate-800">
              {usuario?.administradorSistema ? "Administrador do sistema" : usuario?.tipoUsuario}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sistema operacional
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { autenticado, carregando } = useAuth();
  const location = useLocation();
  if (carregando) return (
    <div className="h-screen flex flex-col items-center justify-center gap-3 text-slate-500">
      <Spinner />
      <p className="text-sm">Carregando Master ERP...</p>
    </div>
  );
  if (!autenticado) return <Navigate to="/login" replace state={{ origem: location.pathname }} />;
  return <Outlet />;
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginPage({ onBack }: { onBack: () => void }) {
  const { autenticado, carregando, entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (carregando) return (
    <div className="h-screen flex items-center justify-center">
      <Spinner />
    </div>
  );
  if (autenticado) return <Navigate to="/" replace />;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setErro(null);
    if (login.trim().length < 3) { setErro("Informe um login ou e-mail válido."); return; }
    if (senha.length < 4) { setErro("Informe sua senha."); return; }
    setEnviando(true);
    try {
      await entrar(login.trim(), senha);
      const state = location.state as { origem?: string } | null;
      navigate(state?.origem && state.origem !== "/login" ? state.origem : "/", { replace: true });
    } catch {
      setErro("Login ou senha inválidos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex font-[Inter,sans-serif]">
      {/* Brand panel */}
      <div className="hidden lg:flex w-1/2 bg-[#0f1623] flex-col justify-between p-12">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">M</div>
        <div>
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-4">Gestão integrada</p>
          <h1 className="text-white text-5xl font-bold leading-tight mb-6">Master ERP</h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-sm">
            Controle empresas, filiais, usuários, permissões e regras fiscais em um só lugar.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            {["Segurança por sessão autenticada", "Auditoria completa de operações", "Gestão multiempresa"].map(f => (
              <div key={f} className="flex items-center gap-3 text-white/60 text-sm">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/20 text-xs">© 2025 Master ERP · Todos os direitos reservados</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center bg-[#f0f3f8] p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">M</div>
            <div>
              <p className="font-bold text-slate-900">Master ERP</p>
              <p className="text-slate-400 text-xs">Gestão integrada</p>
            </div>
          </div>

          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">Bem-vindo</p>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Acesse sua conta</h2>
          <p className="text-slate-400 text-sm mb-8">Informe suas credenciais para entrar no sistema.</p>

          <form onSubmit={enviar} className="flex flex-col gap-4">
            {erro && <Alert type="error">{erro}</Alert>}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Login ou e-mail</label>
              <input type="text" value={login} onChange={e => { setLogin(e.target.value); setErro(null); }}
                placeholder="Digite seu login" autoComplete="username" autoFocus disabled={enviando}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Senha</label>
              <input type="password" value={senha} onChange={e => { setSenha(e.target.value); setErro(null); }}
                placeholder="Digite sua senha" autoComplete="current-password" disabled={enviando}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50" />
            </div>

            <button type="submit" disabled={enviando || login.trim().length < 3 || senha.length < 4}
              className="mt-2 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm shadow-sm">
              {enviando ? "Entrando..." : "Entrar no sistema"}
            </button>

            <p className="text-center text-slate-400 text-xs mt-2">🔒 Conexão protegida e acesso auditado</p>
            <p className="text-center text-slate-300 text-xs">Use qualquer login (mínimo 4 chars senha)</p>
          </form>
          <Btn onClick={onBack} variant="ghost" className="w-full mt-5 justify-center">
            ← Voltar ao portal de sistemas
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const metricas = [
    { label:"Empresas", valor: EMPRESAS_MOCK.length.toString(), sub:`${EMPRESAS_MOCK.filter(e=>e.ativa).length} ativas`, icon:"▦", cor:"blue" },
    { label:"Filiais", valor: FILIAIS_MOCK.length.toString(), sub:`${FILIAIS_MOCK.filter(f=>f.ativa).length} ativas`, icon:"◇", cor:"violet" },
    { label:"Usuários", valor: USUARIOS_MOCK.length.toString(), sub:`${USUARIOS_MOCK.filter(u=>u.ativa).length} ativos`, icon:"♙", cor:"emerald" },
    { label:"Regras fiscais", valor: REGRAS_MOCK.length.toString(), sub:`${REGRAS_MOCK.filter(r=>r.ativa).length} vigentes`, icon:"§", cor:"orange" },
  ];
  const corMap: Record<string,string> = {
    blue:"bg-blue-100 text-blue-600", violet:"bg-violet-100 text-violet-600",
    emerald:"bg-emerald-100 text-emerald-600", orange:"bg-orange-100 text-orange-600",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Visão geral</p>
          <h1 className="text-2xl font-bold mb-1">Olá, {usuario?.nomeExibicao?.split(" ")[0]}.</h1>
          <p className="text-blue-200 text-sm">Bem-vindo ao painel administrativo do Master ERP.</p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-4xl font-black text-white/80">M</div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map(m => (
          <div key={m.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 ${corMap[m.cor]}`}>{m.icon}</div>
            <p className="text-xs text-slate-400 font-medium mb-1">{m.label}</p>
            <p className="text-2xl font-bold text-slate-800">{m.valor}</p>
            <p className="text-xs text-slate-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick access + Session */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Atalhos</p>
          <h2 className="text-base font-bold text-slate-800 mb-4">Acesso rápido</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { to:"/empresas", icon:"▦", label:"Empresas" },
              { to:"/adm/funcionarios", icon:"👤", label:"Funcionários" },
              { to:"/mfg/ordens", icon:"⚙", label:"Ordens de prod." },
              { to:"/sup/pedidos", icon:"🛒", label:"Pedidos de compra" },
              { to:"/sup/estoque", icon:"📦", label:"Estoque" },
              { to:"/regras-fiscais", icon:"§", label:"Regras fiscais" },
              { to:"/resolver-fiscal", icon:"⌘", label:"Resolvedor fiscal" },
              { to:"/config/parametros", icon:"⚙", label:"Configurações" },
            ].map(a => (
              <button key={a.to} onClick={() => navigate(a.to)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-sm font-medium transition border border-slate-100">
                <span className="text-lg">{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Segurança</p>
          <h2 className="text-base font-bold text-slate-800 mb-4">Sessão atual</h2>
          <dl className="flex flex-col gap-3">
            {[
              { dt:"Usuário", dd:usuario?.login },
              { dt:"Perfil", dd:usuario?.tipoUsuario },
              { dt:"Administrador", dd:usuario?.administradorSistema ? "Sim" : "Não" },
              { dt:"Status", dd:"Autenticado", green:true },
            ].map(row => (
              <div key={row.dt} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <dt className="text-xs text-slate-400 font-medium">{row.dt}</dt>
                <dd className={`text-xs font-semibold ${row.green ? "text-emerald-600" : "text-slate-700"}`}>{row.dd}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

// ─── Empresas ─────────────────────────────────────────────────────────────────

function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>(EMPRESAS_MOCK);
  const [pesquisa, setPesquisa] = useState("");
  const [situacao, setSituacao] = useState("todas");
  const [modal, setModal] = useState<null | "novo" | Empresa>(null);
  const [statusModal, setStatusModal] = useState<Empresa | null>(null);
  const [motivo, setMotivo] = useState("");
  const [erroStatus, setErroStatus] = useState<string|null>(null);
  const [toast, setToast] = useState<string|null>(null);
  const [form, setForm] = useState({ razaoSocial:"", nomeFantasia:"", cnpj:"", municipio:"", uf:"SC" });

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); }, [toast]);

  const lista = empresas.filter(e => {
    const q = pesquisa.toLowerCase();
    const ok = !q || e.razaoSocial.toLowerCase().includes(q) || (e.nomeFantasia??'').toLowerCase().includes(q) || e.cnpj.includes(q.replace(/\D/g,""));
    const s = situacao === "todas" || (situacao === "ativas" && e.ativa) || (situacao === "inativas" && !e.ativa);
    return ok && s;
  });

  function abrirNovo() { setForm({ razaoSocial:"", nomeFantasia:"", cnpj:"", municipio:"", uf:"SC" }); setModal("novo"); }
  function abrirEditar(e: Empresa) { setForm({ razaoSocial:e.razaoSocial, nomeFantasia:e.nomeFantasia??'', cnpj:e.cnpj, municipio:e.municipio??'', uf:e.uf??'SC' }); setModal(e); }

  function salvar() {
    if (!form.razaoSocial.trim() || !form.cnpj.trim()) return;
    if (modal === "novo") {
      const nova: Empresa = { id:String(Date.now()), codigo:String(empresas.length+1).padStart(3,"0"), razaoSocial:form.razaoSocial, nomeFantasia:form.nomeFantasia||undefined, cnpj:form.cnpj.replace(/\D/g,""), municipio:form.municipio||undefined, uf:form.uf||undefined, ativa:true, criadoEm:new Date().toISOString().split("T")[0] };
      setEmpresas(p => [...p, nova]); setToast("Empresa cadastrada com sucesso!");
    } else if (modal && modal !== "novo") {
      setEmpresas(p => p.map(e => e.id === (modal as Empresa).id ? { ...e, ...form, cnpj:form.cnpj.replace(/\D/g,"") } : e));
      setToast("Empresa atualizada com sucesso!");
    }
    setModal(null);
  }

  function alterarStatus() {
    if (!statusModal) return;
    if (statusModal.ativa && motivo.trim().length < 3) { setErroStatus("Informe o motivo da inativação."); return; }
    setEmpresas(p => p.map(e => e.id === statusModal.id ? { ...e, ativa:!e.ativa } : e));
    setToast(statusModal.ativa ? "Empresa inativada." : "Empresa reativada.");
    setStatusModal(null); setMotivo(""); setErroStatus(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Parâmetros gerais</p>
          <h1 className="text-2xl font-bold text-slate-800">Empresas</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gerencie os cadastros empresariais.</p>
        </div>
        <Btn onClick={abrirNovo}>＋ Nova empresa</Btn>
      </div>

      {toast && <Alert type="success">{toast}</Alert>}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"Total", val:lista.length, sub:"no filtro atual" },
          { label:"Ativas", val:lista.filter(e=>e.ativa).length, sub:"empresas" },
          { label:"Inativas", val:lista.filter(e=>!e.ativa).length, sub:"empresas" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className="text-2xl font-bold text-slate-800">{s.val}</p>
            <p className="text-xs text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-wrap gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-1 min-w-52 bg-slate-50 border border-slate-200 rounded-lg px-3">
            <span className="text-slate-400 text-base">⌕</span>
            <input value={pesquisa} onChange={e => setPesquisa(e.target.value)} placeholder="Pesquisar empresa..."
              className="flex-1 py-2 bg-transparent text-sm focus:outline-none" />
          </div>
          <select value={situacao} onChange={e => setSituacao(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none">
            <option value="todas">Todas as situações</option>
            <option value="ativas">Somente ativas</option>
            <option value="inativas">Somente inativas</option>
          </select>
          <Btn variant="ghost" onClick={() => { setPesquisa(""); setSituacao("todas"); }}>Limpar</Btn>
        </div>

        {lista.length === 0 ? (
          <TableState icon="▦" title="Nenhuma empresa encontrada" sub="Cadastre uma empresa ou altere os filtros."
            action={<Btn onClick={abrirNovo}>Cadastrar empresa</Btn>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["Empresa","CNPJ","Localização","Cadastro","Status","Ações"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lista.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {nomeEmpresa(e).charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{nomeEmpresa(e)}</p>
                          <p className="text-xs text-slate-400">{e.codigo} · {e.razaoSocial}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{fmtCnpj(e.cnpj)}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{[e.municipio, e.uf].filter(Boolean).join(" / ") || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{fmtData(e.criadoEm)}</td>
                    <td className="px-5 py-3.5"><Badge ativa={e.ativa} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Btn size="sm" variant="ghost" onClick={() => abrirEditar(e)}>✎ Editar</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => { setStatusModal(e); setMotivo(""); setErroStatus(null); }}
                          className={e.ativa ? "text-red-500 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}>
                          {e.ativa ? "⊘" : "✓"}
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form modal */}
      {modal !== null && (
        <Modal title={modal === "novo" ? "Nova empresa" : "Editar empresa"} eyebrow="Cadastro" onClose={() => setModal(null)} width="max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Field label="Razão Social *"><Input value={form.razaoSocial} onChange={v => setForm(p=>({...p,razaoSocial:v}))} placeholder="Razão social da empresa" /></Field></div>
            <Field label="Nome Fantasia"><Input value={form.nomeFantasia} onChange={v => setForm(p=>({...p,nomeFantasia:v}))} placeholder="Nome fantasia" /></Field>
            <Field label="CNPJ *"><Input value={form.cnpj} onChange={v => setForm(p=>({...p,cnpj:v}))} placeholder="00.000.000/0000-00" /></Field>
            <Field label="Município"><Input value={form.municipio} onChange={v => setForm(p=>({...p,municipio:v}))} placeholder="Município" /></Field>
            <Field label="UF">
              <Select value={form.uf} onChange={v => setForm(p=>({...p,uf:v}))}>
                {["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"].map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </Select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn onClick={salvar} disabled={!form.razaoSocial.trim() || !form.cnpj.trim()}>Salvar empresa</Btn>
          </div>
        </Modal>
      )}

      {/* Status modal */}
      {statusModal && (
        <Modal title={statusModal.ativa ? "Inativar empresa" : "Ativar empresa"} eyebrow="Alterar situação" onClose={() => setStatusModal(null)}>
          <p className="text-sm text-slate-600 mb-4">Você está alterando a situação de <strong>{nomeEmpresa(statusModal)}</strong>.</p>
          {erroStatus && <div className="mb-3"><Alert type="error">{erroStatus}</Alert></div>}
          {statusModal.ativa ? (
            <Field label="Motivo da inativação">
              <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3} maxLength={500}
                placeholder="Informe o motivo..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </Field>
          ) : (
            <Alert type="info">A empresa voltará a ficar disponível no sistema.</Alert>
          )}
          <div className="flex justify-end gap-2 mt-5">
            <Btn variant="ghost" onClick={() => setStatusModal(null)}>Cancelar</Btn>
            <Btn variant={statusModal.ativa ? "danger" : "success"} onClick={alterarStatus}>
              {statusModal.ativa ? "Confirmar inativação" : "Confirmar ativação"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Filiais ──────────────────────────────────────────────────────────────────

function FiliaisPage() {
  const [filiais, setFiliais] = useState<Filial[]>(FILIAIS_MOCK);
  const [pesquisa, setPesquisa] = useState("");
  const [situacao, setSituacao] = useState("todas");
  const [tipo, setTipo] = useState("todas");
  const [modal, setModal] = useState<null|"novo"|Filial>(null);
  const [statusModal, setStatusModal] = useState<Filial|null>(null);
  const [motivo, setMotivo] = useState("");
  const [erroStatus, setErroStatus] = useState<string|null>(null);
  const [toast, setToast] = useState<string|null>(null);
  const [form, setForm] = useState({ razaoSocial:"", nomeFantasia:"", cnpj:"", municipio:"", uf:"SC", empresaId:"1", tipoEstabelecimento:"FILIAL", matriz:false });

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); }, [toast]);

  const lista = filiais.filter(f => {
    const q = pesquisa.toLowerCase();
    const ok = !q || f.razaoSocial.toLowerCase().includes(q) || (f.nomeFantasia??'').toLowerCase().includes(q) || f.cnpj.includes(q.replace(/\D/g,""));
    const s = situacao === "todas" || (situacao === "ativas" && f.ativa) || (situacao === "inativas" && !f.ativa);
    const tp = tipo === "todas" || (tipo === "matrizes" && f.matriz) || (tipo === "filiais" && !f.matriz);
    return ok && s && tp;
  });

  function salvar() {
    if (!form.razaoSocial.trim() || !form.cnpj.trim()) return;
    const emp = EMPRESAS_MOCK.find(e => e.id === form.empresaId);
    if (modal === "novo") {
      const nova: Filial = { id:String(Date.now()), codigo:String(filiais.length+1).padStart(3,"0"), razaoSocial:form.razaoSocial, nomeFantasia:form.nomeFantasia||undefined, cnpj:form.cnpj.replace(/\D/g,""), municipio:form.municipio||undefined, uf:form.uf, ativa:true, matriz:form.matriz, tipoEstabelecimento:form.tipoEstabelecimento, empresa:emp ? { id:emp.id, codigo:emp.codigo, razaoSocial:emp.razaoSocial, nomeFantasia:emp.nomeFantasia } : undefined };
      setFiliais(p => [...p, nova]); setToast("Filial cadastrada com sucesso!");
    } else if (modal && modal !== "novo") {
      setFiliais(p => p.map(f => f.id === (modal as Filial).id ? { ...f, ...form, cnpj:form.cnpj.replace(/\D/g,"") } : f));
      setToast("Filial atualizada.");
    }
    setModal(null);
  }

  function alterarStatus() {
    if (!statusModal) return;
    if (statusModal.ativa && motivo.trim().length < 3) { setErroStatus("Informe o motivo."); return; }
    setFiliais(p => p.map(f => f.id === statusModal.id ? { ...f, ativa:!f.ativa } : f));
    setToast(statusModal.ativa ? "Filial inativada." : "Filial reativada.");
    setStatusModal(null); setMotivo(""); setErroStatus(null);
  }

  function abrirNovo() { setForm({ razaoSocial:"", nomeFantasia:"", cnpj:"", municipio:"", uf:"SC", empresaId:"1", tipoEstabelecimento:"FILIAL", matriz:false }); setModal("novo"); }
  function abrirEditar(f: Filial) { setForm({ razaoSocial:f.razaoSocial, nomeFantasia:f.nomeFantasia??'', cnpj:f.cnpj, municipio:f.municipio??'', uf:f.uf??'SC', empresaId:f.empresa?.id??'1', tipoEstabelecimento:f.tipoEstabelecimento, matriz:f.matriz }); setModal(f); }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Parâmetros gerais</p>
          <h1 className="text-2xl font-bold text-slate-800">Filiais</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gerencie matrizes e unidades das empresas.</p>
        </div>
        <Btn onClick={abrirNovo}>＋ Nova filial</Btn>
      </div>

      {toast && <Alert type="success">{toast}</Alert>}

      <div className="grid grid-cols-3 gap-4">
        {[{label:"Total",val:lista.length,sub:"no filtro"},{label:"Ativas",val:lista.filter(f=>f.ativa).length,sub:""},{label:"Matrizes",val:lista.filter(f=>f.matriz).length,sub:""}].map(s=>(
          <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className="text-2xl font-bold text-slate-800">{s.val}</p>
            {s.sub && <p className="text-xs text-slate-400">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-wrap gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-1 min-w-52 bg-slate-50 border border-slate-200 rounded-lg px-3">
            <span className="text-slate-400">⌕</span>
            <input value={pesquisa} onChange={e=>setPesquisa(e.target.value)} placeholder="Pesquisar filial..."
              className="flex-1 py-2 bg-transparent text-sm focus:outline-none" />
          </div>
          <select value={situacao} onChange={e=>setSituacao(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50">
            <option value="todas">Todas situações</option><option value="ativas">Ativas</option><option value="inativas">Inativas</option>
          </select>
          <select value={tipo} onChange={e=>setTipo(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50">
            <option value="todas">Matrizes e filiais</option><option value="matrizes">Só matrizes</option><option value="filiais">Só filiais</option>
          </select>
          <Btn variant="ghost" onClick={()=>{setPesquisa("");setSituacao("todas");setTipo("todas");}}>Limpar</Btn>
        </div>

        {lista.length === 0 ? <TableState icon="◇" title="Nenhuma filial encontrada" sub="Cadastre ou ajuste os filtros." action={<Btn onClick={abrirNovo}>Cadastrar filial</Btn>} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{["Filial","Empresa","CNPJ","Tipo","Localização","Status","Ações"].map(h=>(
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lista.map(f=>(
                  <tr key={f.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm shrink-0">{(f.nomeFantasia||f.razaoSocial).charAt(0)}</div>
                        <div><p className="font-semibold text-slate-800">{f.nomeFantasia||f.razaoSocial}</p><p className="text-xs text-slate-400">{f.codigo}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{f.empresa ? (f.empresa.nomeFantasia||f.empresa.razaoSocial) : "—"}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{fmtCnpj(f.cnpj)}</td>
                    <td className="px-5 py-3.5"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${f.matriz?"bg-blue-100 text-blue-700":"bg-slate-100 text-slate-500"}`}>{f.matriz?"Matriz":"Filial"}</span></td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{[f.municipio,f.uf].filter(Boolean).join(" / ")||"—"}</td>
                    <td className="px-5 py-3.5"><Badge ativa={f.ativa} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Btn size="sm" variant="ghost" onClick={()=>abrirEditar(f)}>✎ Editar</Btn>
                        <Btn size="sm" variant="ghost" onClick={()=>{setStatusModal(f);setMotivo("");setErroStatus(null);}} className={f.ativa?"text-red-500 hover:bg-red-50":"text-emerald-600 hover:bg-emerald-50"}>{f.ativa?"⊘":"✓"}</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal==="novo"?"Nova filial":"Editar filial"} eyebrow="Cadastro" onClose={()=>setModal(null)} width="max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Field label="Empresa vinculada"><Select value={form.empresaId} onChange={v=>setForm(p=>({...p,empresaId:v}))}>{EMPRESAS_MOCK.filter(e=>e.ativa).map(e=><option key={e.id} value={e.id}>{e.codigo} — {e.nomeFantasia??e.razaoSocial}</option>)}</Select></Field></div>
            <div className="col-span-2"><Field label="Razão Social *"><Input value={form.razaoSocial} onChange={v=>setForm(p=>({...p,razaoSocial:v}))} /></Field></div>
            <Field label="Nome Fantasia"><Input value={form.nomeFantasia} onChange={v=>setForm(p=>({...p,nomeFantasia:v}))} /></Field>
            <Field label="CNPJ *"><Input value={form.cnpj} onChange={v=>setForm(p=>({...p,cnpj:v}))} /></Field>
            <Field label="Tipo"><Select value={form.tipoEstabelecimento} onChange={v=>setForm(p=>({...p,tipoEstabelecimento:v,matriz:v==="MATRIZ"}))}><option value="MATRIZ">Matriz</option><option value="FILIAL">Filial</option><option value="LOJA">Loja</option><option value="DEPOSITO">Depósito</option></Select></Field>
            <Field label="Município"><Input value={form.municipio} onChange={v=>setForm(p=>({...p,municipio:v}))} /></Field>
            <Field label="UF"><Select value={form.uf} onChange={v=>setForm(p=>({...p,uf:v}))}>{["SC","PR","SP","RS","RJ","MG"].map(u=><option key={u} value={u}>{u}</option>)}</Select></Field>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
            <Btn variant="ghost" onClick={()=>setModal(null)}>Cancelar</Btn>
            <Btn onClick={salvar} disabled={!form.razaoSocial.trim()||!form.cnpj.trim()}>Salvar filial</Btn>
          </div>
        </Modal>
      )}

      {statusModal && (
        <Modal title={statusModal.ativa?"Inativar filial":"Ativar filial"} eyebrow="Alterar situação" onClose={()=>setStatusModal(null)}>
          <p className="text-sm text-slate-600 mb-4">Alterando situação de <strong>{statusModal.nomeFantasia||statusModal.razaoSocial}</strong>.</p>
          {erroStatus && <div className="mb-3"><Alert type="error">{erroStatus}</Alert></div>}
          {statusModal.ativa ? <Field label="Motivo"><textarea value={motivo} onChange={e=>setMotivo(e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></Field>
            : <Alert type="info">A filial voltará a ficar disponível.</Alert>}
          <div className="flex justify-end gap-2 mt-5">
            <Btn variant="ghost" onClick={()=>setStatusModal(null)}>Cancelar</Btn>
            <Btn variant={statusModal.ativa?"danger":"success"} onClick={alterarStatus}>{statusModal.ativa?"Confirmar inativação":"Confirmar ativação"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Usuários ─────────────────────────────────────────────────────────────────

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioCad[]>(USUARIOS_MOCK);
  const [pesquisa, setPesquisa] = useState("");
  const [modal, setModal] = useState<null|"novo"|UsuarioCad>(null);
  const [toast, setToast] = useState<string|null>(null);
  const [form, setForm] = useState({ nomeExibicao:"", login:"", tipoUsuario:"OPERADOR", administradorSistema:false });

  useEffect(() => { if (!toast) return; const t = setTimeout(()=>setToast(null),3500); return ()=>clearTimeout(t); }, [toast]);

  const lista = usuarios.filter(u => {
    const q = pesquisa.toLowerCase();
    return !q || u.login.toLowerCase().includes(q) || u.nomeExibicao.toLowerCase().includes(q);
  });

  function salvar() {
    if (!form.login.trim() || !form.nomeExibicao.trim()) return;
    if (modal === "novo") {
      setUsuarios(p => [...p, { id:String(Date.now()), ...form, cpf:undefined, ativa:true, bloqueado:false, criadoEm:new Date().toISOString().split("T")[0] }]);
      setToast("Usuário cadastrado.");
    } else if (modal && modal !== "novo") {
      setUsuarios(p => p.map(u => u.id === (modal as UsuarioCad).id ? { ...u, ...form } : u));
      setToast("Usuário atualizado.");
    }
    setModal(null);
  }

  function toggleAtivo(u: UsuarioCad) {
    setUsuarios(p => p.map(x => x.id === u.id ? { ...x, ativa:!x.ativa } : x));
    setToast(u.ativa ? "Usuário inativado." : "Usuário reativado.");
  }

  const tipoColor: Record<string,string> = { ADMINISTRADOR:"bg-violet-100 text-violet-700", GERENTE:"bg-blue-100 text-blue-700", OPERADOR:"bg-slate-100 text-slate-600", CONSULTOR:"bg-amber-100 text-amber-700" };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Controle de acesso</p>
          <h1 className="text-2xl font-bold text-slate-800">Usuários</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gerencie contas de acesso ao sistema.</p>
        </div>
        <Btn onClick={()=>{ setForm({nomeExibicao:"",login:"",tipoUsuario:"OPERADOR",administradorSistema:false}); setModal("novo"); }}>＋ Novo usuário</Btn>
      </div>

      {toast && <Alert type="success">{toast}</Alert>}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-wrap gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-1 min-w-52 bg-slate-50 border border-slate-200 rounded-lg px-3">
            <span className="text-slate-400">⌕</span>
            <input value={pesquisa} onChange={e=>setPesquisa(e.target.value)} placeholder="Pesquisar usuário..."
              className="flex-1 py-2 bg-transparent text-sm focus:outline-none" />
          </div>
          <Btn variant="ghost" onClick={()=>setPesquisa("")}>Limpar</Btn>
        </div>

        {lista.length === 0 ? <TableState icon="♙" title="Nenhum usuário encontrado" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{["Usuário","Login","Tipo","Empresa","Cadastro","Status","Ações"].map(h=>(
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lista.map(u=>(
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">{u.nomeExibicao.charAt(0)}</div>
                        <div>
                          <p className="font-semibold text-slate-800">{u.nomeExibicao}</p>
                          {u.administradorSistema && <span className="text-xs text-violet-600 font-semibold">Admin sistema</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{u.login}</td>
                    <td className="px-5 py-3.5"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${tipoColor[u.tipoUsuario]||"bg-slate-100 text-slate-600"}`}>{u.tipoUsuario}</span></td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{u.empresa?.razaoSocial||"—"}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{fmtData(u.criadoEm)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <Badge ativa={u.ativa} />
                        {u.bloqueado && <span className="text-xs text-red-500 font-semibold">Bloqueado</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Btn size="sm" variant="ghost" onClick={()=>{ setForm({nomeExibicao:u.nomeExibicao,login:u.login,tipoUsuario:u.tipoUsuario,administradorSistema:u.administradorSistema}); setModal(u); }}>✎</Btn>
                        <Btn size="sm" variant="ghost" onClick={()=>toggleAtivo(u)} className={u.ativa?"text-red-500 hover:bg-red-50":"text-emerald-600 hover:bg-emerald-50"}>{u.ativa?"⊘":"✓"}</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal==="novo"?"Novo usuário":"Editar usuário"} eyebrow="Controle de acesso" onClose={()=>setModal(null)}>
          <div className="flex flex-col gap-4">
            <Field label="Nome de exibição *"><Input value={form.nomeExibicao} onChange={v=>setForm(p=>({...p,nomeExibicao:v}))} placeholder="Nome completo" /></Field>
            <Field label="Login *"><Input value={form.login} onChange={v=>setForm(p=>({...p,login:v}))} placeholder="login do usuário" /></Field>
            <Field label="Tipo de usuário">
              <Select value={form.tipoUsuario} onChange={v=>setForm(p=>({...p,tipoUsuario:v}))}>
                <option value="ADMINISTRADOR">Administrador</option><option value="GERENTE">Gerente</option>
                <option value="OPERADOR">Operador</option><option value="CONSULTOR">Consultor</option>
              </Select>
            </Field>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.administradorSistema} onChange={e=>setForm(p=>({...p,administradorSistema:e.target.checked}))}
                className="w-4 h-4 rounded accent-blue-600" />
              <span className="text-sm text-slate-700">Administrador do sistema</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
            <Btn variant="ghost" onClick={()=>setModal(null)}>Cancelar</Btn>
            <Btn onClick={salvar} disabled={!form.login.trim()||!form.nomeExibicao.trim()}>Salvar usuário</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Regras Fiscais ───────────────────────────────────────────────────────────

function RegrasFiscaisPage() {
  const [regras, setRegras] = useState<RegraFiscal[]>(REGRAS_MOCK);
  const [pesquisa, setPesquisa] = useState("");
  const [situacao, setSituacao] = useState("todas");
  const [toast, setToast] = useState<string|null>(null);
  const [modal, setModal] = useState<null|"novo"|RegraFiscal>(null);
  const [form, setForm] = useState({ descricao:"", cfop:"", cst:"", tipoOperacao:"SAÍDA", vigenciaInicio:"" });

  useEffect(() => { if (!toast) return; const t = setTimeout(()=>setToast(null),3500); return ()=>clearTimeout(t); }, [toast]);

  const lista = regras.filter(r => {
    const q = pesquisa.toLowerCase();
    const ok = !q || r.descricao.toLowerCase().includes(q) || r.cfop.includes(q) || r.cst.includes(q);
    const s = situacao==="todas" || (situacao==="ativas"&&r.ativa) || (situacao==="inativas"&&!r.ativa);
    return ok && s;
  });

  function salvar() {
    if (!form.descricao.trim()) return;
    if (modal === "novo") {
      setRegras(p => [...p, { id:String(Date.now()), ...form, ativa:true }]);
      setToast("Regra fiscal cadastrada.");
    } else if (modal && modal !== "novo") {
      setRegras(p => p.map(r => r.id === (modal as RegraFiscal).id ? { ...r, ...form } : r));
      setToast("Regra fiscal atualizada.");
    }
    setModal(null);
  }

  function toggleAtivo(r: RegraFiscal) {
    setRegras(p => p.map(x => x.id === r.id ? { ...x, ativa:!x.ativa } : x));
    setToast(r.ativa ? "Regra inativada." : "Regra reativada.");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Tributação</p>
          <h1 className="text-2xl font-bold text-slate-800">Regras fiscais</h1>
          <p className="text-slate-400 text-sm mt-0.5">Configure as regras tributárias por operação e CFOP.</p>
        </div>
        <Btn onClick={()=>{ setForm({descricao:"",cfop:"",cst:"",tipoOperacao:"SAÍDA",vigenciaInicio:""}); setModal("novo"); }}>＋ Nova regra</Btn>
      </div>

      {toast && <Alert type="success">{toast}</Alert>}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-wrap gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-1 min-w-52 bg-slate-50 border border-slate-200 rounded-lg px-3">
            <span className="text-slate-400">⌕</span>
            <input value={pesquisa} onChange={e=>setPesquisa(e.target.value)} placeholder="Pesquisar por descrição, CFOP ou CST..."
              className="flex-1 py-2 bg-transparent text-sm focus:outline-none" />
          </div>
          <select value={situacao} onChange={e=>setSituacao(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50">
            <option value="todas">Todas situações</option><option value="ativas">Ativas</option><option value="inativas">Inativas</option>
          </select>
          <Btn variant="ghost" onClick={()=>{setPesquisa("");setSituacao("todas");}}>Limpar</Btn>
        </div>

        {lista.length === 0 ? <TableState icon="§" title="Nenhuma regra encontrada" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{["Descrição","CFOP","CST","Tipo","Empresa","Vigência","Status","Ações"].map(h=>(
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lista.map(r=>(
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-800 max-w-xs truncate">{r.descricao}</td>
                    <td className="px-5 py-3.5 font-mono text-sm font-bold text-blue-700">{r.cfop}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{r.cst}</td>
                    <td className="px-5 py-3.5"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${r.tipoOperacao==="SAÍDA"?"bg-orange-100 text-orange-700":"bg-teal-100 text-teal-700"}`}>{r.tipoOperacao}</span></td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{r.empresa?.razaoSocial||"—"}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{r.vigenciaInicio ? fmtData(r.vigenciaInicio) : "—"}</td>
                    <td className="px-5 py-3.5"><Badge ativa={r.ativa} label={r.ativa?"Vigente":"Inativa"} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Btn size="sm" variant="ghost" onClick={()=>{ setForm({descricao:r.descricao,cfop:r.cfop,cst:r.cst,tipoOperacao:r.tipoOperacao,vigenciaInicio:r.vigenciaInicio}); setModal(r); }}>✎</Btn>
                        <Btn size="sm" variant="ghost" onClick={()=>toggleAtivo(r)} className={r.ativa?"text-red-500 hover:bg-red-50":"text-emerald-600 hover:bg-emerald-50"}>{r.ativa?"⊘":"✓"}</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal==="novo"?"Nova regra fiscal":"Editar regra fiscal"} eyebrow="Tributação" onClose={()=>setModal(null)} width="max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Field label="Descrição *"><Input value={form.descricao} onChange={v=>setForm(p=>({...p,descricao:v}))} placeholder="Descrição da regra" /></Field></div>
            <Field label="CFOP"><Input value={form.cfop} onChange={v=>setForm(p=>({...p,cfop:v}))} placeholder="5102" /></Field>
            <Field label="CST / CSOSN"><Input value={form.cst} onChange={v=>setForm(p=>({...p,cst:v}))} placeholder="00" /></Field>
            <Field label="Tipo de operação">
              <Select value={form.tipoOperacao} onChange={v=>setForm(p=>({...p,tipoOperacao:v}))}>
                <option value="SAÍDA">Saída</option><option value="ENTRADA">Entrada</option>
              </Select>
            </Field>
            <Field label="Vigência a partir de"><Input type="date" value={form.vigenciaInicio} onChange={v=>setForm(p=>({...p,vigenciaInicio:v}))} /></Field>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
            <Btn variant="ghost" onClick={()=>setModal(null)}>Cancelar</Btn>
            <Btn onClick={salvar} disabled={!form.descricao.trim()}>Salvar regra</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Resolvedor Fiscal ────────────────────────────────────────────────────────

function ResolvedorFiscalPage() {
  const [form, setForm] = useState({
    empresa:"1", filial:"1", tipoOperacao:"SAÍDA", dataOperacao:new Date().toISOString().split("T")[0],
    tipoItem:"MERCADORIA", ufOrigem:"SC", ufDestino:"SC",
    contribuinteIcms:true, consumidorFinal:false,
    ncm:"", cfopEntrada:"",
  });
  const [resultado, setResultado] = useState<null | { cfop:string; cst:string; aliquota:string; fundamentacao:string; tributos:Array<{nome:string;base:string;aliq:string;valor:string}> }>(null);
  const [resolvendo, setResolvendo] = useState(false);

  const empresasFiltradas = EMPRESAS_MOCK.filter(e => e.ativa);
  const filiaisFiltradas = FILIAIS_MOCK.filter(f => f.ativa && f.empresa?.id === form.empresa);

  async function resolver() {
    setResolvendo(true);
    await new Promise(r => setTimeout(r, 900));
    const interstate = form.ufOrigem !== form.ufDestino;
    const cfop = form.tipoOperacao === "SAÍDA"
      ? (interstate ? "6102" : "5102")
      : (interstate ? "2102" : "1102");
    const aliq = interstate ? (["SP","MG","PR","RS"].includes(form.ufDestino) ? "12%" : "7%") : "17%";
    setResultado({
      cfop, cst: form.contribuinteIcms ? "00" : "40",
      aliquota: form.contribuinteIcms ? aliq : "0%",
      fundamentacao: `RICMS/SC Decreto 2.870/2001 — operação ${form.tipoOperacao.toLowerCase()} de mercadoria ${interstate?"interestadual":"interna"}.`,
      tributos: [
        { nome:"ICMS", base:"R$ 1.000,00", aliq, valor: form.contribuinteIcms ? `R$ ${aliq.replace("%","")} ` + (parseFloat(aliq)*10).toFixed(2) : "R$ 0,00" },
        { nome:"PIS", base:"R$ 1.000,00", aliq:"0,65%", valor:"R$ 6,50" },
        { nome:"COFINS", base:"R$ 1.000,00", aliq:"3,00%", valor:"R$ 30,00" },
      ],
    });
    setResolvendo(false);
  }

  const f = (field: keyof typeof form, v: string | boolean) => setForm(p => ({ ...p, [field]:v }));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Tributação</p>
        <h1 className="text-2xl font-bold text-slate-800">Resolvedor fiscal</h1>
        <p className="text-slate-400 text-sm mt-0.5">Simule a aplicação das regras fiscais para uma operação.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-sm font-bold text-slate-700 mb-4">Parâmetros da operação</p>
          <div className="flex flex-col gap-4">
            <Field label="Empresa">
              <Select value={form.empresa} onChange={v=>{ f("empresa",v); f("filial",""); }}>
                {empresasFiltradas.map(e=><option key={e.id} value={e.id}>{e.nomeFantasia??e.razaoSocial}</option>)}
              </Select>
            </Field>
            <Field label="Filial">
              <Select value={form.filial} onChange={v=>f("filial",v)}>
                <option value="">Selecione...</option>
                {filiaisFiltradas.map(fl=><option key={fl.id} value={fl.id}>{fl.nomeFantasia??fl.razaoSocial}</option>)}
              </Select>
            </Field>
            <Field label="Tipo de operação">
              <Select value={form.tipoOperacao} onChange={v=>f("tipoOperacao",v)}>
                <option value="SAÍDA">Saída</option><option value="ENTRADA">Entrada</option>
              </Select>
            </Field>
            <Field label="Data da operação">
              <Input type="date" value={form.dataOperacao} onChange={v=>f("dataOperacao",v)} />
            </Field>
            <Field label="Tipo de item">
              <Select value={form.tipoItem} onChange={v=>f("tipoItem",v)}>
                <option value="MERCADORIA">Mercadoria</option><option value="PRODUTO">Produto industrial</option>
                <option value="SERVICO">Serviço</option><option value="ATIVO">Ativo imobilizado</option>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="UF Origem"><Select value={form.ufOrigem} onChange={v=>f("ufOrigem",v)}>{["SC","PR","SP","RS","RJ","MG","GO","MS"].map(u=><option key={u} value={u}>{u}</option>)}</Select></Field>
              <Field label="UF Destino"><Select value={form.ufDestino} onChange={v=>f("ufDestino",v)}>{["SC","PR","SP","RS","RJ","MG","GO","MS","BA","PE"].map(u=><option key={u} value={u}>{u}</option>)}</Select></Field>
            </div>
            {form.tipoItem !== "SERVICO" && (
              <Field label="NCM"><Input value={form.ncm} onChange={v=>f("ncm",v)} placeholder="0000.00.00" /></Field>
            )}
            <div className="flex flex-col gap-2 pt-1">
              {[
                { key:"contribuinteIcms", label:"Destinatário contribuinte ICMS" },
                { key:"consumidorFinal", label:"Operação para consumidor final" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                    onChange={e=>f(key as keyof typeof form, e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-600" />
                  <span className="text-sm text-slate-700">{label}</span>
                </label>
              ))}
            </div>
            <Btn onClick={resolver} disabled={resolvendo || !form.empresa} className="mt-2 w-full justify-center">
              {resolvendo ? "Resolvendo..." : "⌘ Resolver tributação"}
            </Btn>
          </div>
        </div>

        {/* Result */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {!resultado && !resolvendo && (
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center py-20">
              <div className="text-center text-slate-300">
                <p className="text-6xl mb-4">⌘</p>
                <p className="text-base font-medium text-slate-400">Preencha os parâmetros e clique em Resolver</p>
              </div>
            </div>
          )}
          {resolvendo && (
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Spinner /><p className="text-sm">Aplicando regras fiscais...</p>
              </div>
            </div>
          )}
          {resultado && !resolvendo && (
            <>
              <div className="bg-blue-600 rounded-2xl p-5 text-white">
                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-3">Resultado</p>
                <div className="grid grid-cols-3 gap-4">
                  {[{l:"CFOP",v:resultado.cfop},{l:"CST",v:resultado.cst},{l:"Alíquota ICMS",v:resultado.aliquota}].map(it=>(
                    <div key={it.l}>
                      <p className="text-blue-200 text-xs mb-1">{it.l}</p>
                      <p className="text-2xl font-black">{it.v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tributos aplicados</p>
                <table className="w-full text-sm">
                  <thead><tr>{["Tributo","Base de cálculo","Alíquota","Valor"].map(h=><th key={h} className="text-left text-xs text-slate-400 font-semibold pb-2">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {resultado.tributos.map(t=>(
                      <tr key={t.nome}>
                        <td className="py-2 font-bold text-slate-700">{t.nome}</td>
                        <td className="py-2 font-mono text-xs text-slate-500">{t.base}</td>
                        <td className="py-2 font-mono text-xs text-blue-600">{t.aliq}</td>
                        <td className="py-2 font-mono text-xs font-bold text-slate-800">{t.valor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fundamentação legal</p>
                <p className="text-sm text-slate-600 leading-relaxed">{resultado.fundamentacao}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Módulo Genérico (placeholder compartilhado) ─────────────────────────────

type ModuloItem = { id:string; [k:string]: string|boolean|number };

function ModuloPage({ titulo, modulo, eyebrow, colunas, mock, cor }: {
  titulo: string; modulo: string; eyebrow: string;
  colunas: Array<{ key:string; label:string; mono?:boolean; badge?:boolean }>;
  mock: ModuloItem[]; cor: string;
}) {
  const [itens, setItens] = useState<ModuloItem[]>(mock);
  const [pesquisa, setPesquisa] = useState("");
  const [modal, setModal] = useState<null|"novo"|ModuloItem>(null);
  const [formFields, setFormFields] = useState<Record<string,string>>({});
  const [toast, setToast] = useState<string|null>(null);

  useEffect(() => { if (!toast) return; const t = setTimeout(()=>setToast(null),3500); return ()=>clearTimeout(t); }, [toast]);

  const lista = itens.filter(item =>
    !pesquisa || Object.values(item).some(v => String(v).toLowerCase().includes(pesquisa.toLowerCase()))
  );

  function abrirNovo() {
    const blank: Record<string,string> = {};
    colunas.forEach(c => { blank[c.key] = ""; });
    setFormFields(blank); setModal("novo");
  }
  function abrirEditar(item: ModuloItem) {
    const f: Record<string,string> = {};
    colunas.forEach(c => { f[c.key] = String(item[c.key] ?? ""); });
    setFormFields(f); setModal(item);
  }
  function salvar() {
    if (!Object.values(formFields).some(v => v.trim())) return;
    if (modal === "novo") {
      setItens(p => [...p, { id:String(Date.now()), ...formFields, ativo:true }]);
      setToast(`${modulo} cadastrado(a) com sucesso!`);
    } else if (modal && modal !== "novo") {
      setItens(p => p.map(x => x.id === (modal as ModuloItem).id ? { ...x, ...formFields } : x));
      setToast(`${modulo} atualizado(a).`);
    }
    setModal(null);
  }
  function excluir(item: ModuloItem) {
    setItens(p => p.filter(x => x.id !== item.id));
    setToast(`${modulo} removido(a).`);
  }

  const corBtn: Record<string,string> = {
    amber:"bg-amber-600 hover:bg-amber-700", violet:"bg-violet-600 hover:bg-violet-700",
    emerald:"bg-emerald-600 hover:bg-emerald-700", slate:"bg-slate-600 hover:bg-slate-700",
  };
  const corIcon: Record<string,string> = {
    amber:"bg-amber-100 text-amber-600", violet:"bg-violet-100 text-violet-600",
    emerald:"bg-emerald-100 text-emerald-600", slate:"bg-slate-100 text-slate-500",
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${{amber:"text-amber-600",violet:"text-violet-600",emerald:"text-emerald-600",slate:"text-slate-500"}[cor]}`}>{eyebrow}</p>
          <h1 className="text-2xl font-bold text-slate-800">{titulo}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{lista.length} registro{lista.length!==1?"s":""}</p>
        </div>
        <button onClick={abrirNovo} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition ${corBtn[cor]}`}>
          ＋ Novo(a) {modulo}
        </button>
      </div>

      {toast && <Alert type="success">{toast}</Alert>}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3">
            <span className="text-slate-400">⌕</span>
            <input value={pesquisa} onChange={e=>setPesquisa(e.target.value)} placeholder={`Pesquisar ${titulo.toLowerCase()}...`}
              className="flex-1 py-2 bg-transparent text-sm focus:outline-none" />
          </div>
          <Btn variant="ghost" onClick={()=>setPesquisa("")}>Limpar</Btn>
        </div>

        {lista.length === 0 ? (
          <TableState icon="📋" title={`Nenhum(a) ${titulo.toLowerCase()} encontrado(a)`} action={<button onClick={abrirNovo} className={`px-4 py-2 text-sm font-semibold text-white rounded-lg ${corBtn[cor]}`}>Cadastrar</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {colunas.map(c=><th key={c.key} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{c.label}</th>)}
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lista.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    {colunas.map((c,ci) => (
                      <td key={c.key} className="px-5 py-3.5">
                        {ci === 0 ? (
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${corIcon[cor]}`}>{String(item[c.key]).charAt(0).toUpperCase()}</div>
                            <span className="font-semibold text-slate-800">{String(item[c.key])}</span>
                          </div>
                        ) : c.badge ? (
                          <Badge ativa={item[c.key] !== false && item[c.key] !== "false"} />
                        ) : (
                          <span className={c.mono ? "font-mono text-xs text-slate-600" : "text-sm text-slate-600"}>{String(item[c.key] ?? "—")}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Btn size="sm" variant="ghost" onClick={()=>abrirEditar(item)}>✎</Btn>
                        <Btn size="sm" variant="ghost" onClick={()=>excluir(item)} className="text-red-400 hover:bg-red-50">🗑</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal==="novo"?`Novo(a) ${modulo}`:`Editar ${modulo}`} eyebrow={eyebrow} onClose={()=>setModal(null)} width="max-w-xl">
          <div className="flex flex-col gap-4">
            {colunas.map(c => (
              <Field key={c.key} label={c.label}>
                <Input value={formFields[c.key]??""} onChange={v=>setFormFields(p=>({...p,[c.key]:v}))} placeholder={c.label} />
              </Field>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
            <Btn variant="ghost" onClick={()=>setModal(null)}>Cancelar</Btn>
            <button onClick={salvar} className={`px-4 py-2 text-sm font-semibold text-white rounded-lg ${corBtn[cor]}`}>Salvar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Módulo Administrativo ────────────────────────────────────────────────────

const FUNCIONARIOS_MOCK: ModuloItem[] = [
  { id:"1", nome:"Carlos Eduardo Lima", cpf:"111.222.333-44", cargo:"Analista de TI", departamento:"Tecnologia", admissao:"2022-03-01", ativo:true },
  { id:"2", nome:"Fernanda Oliveira", cpf:"222.333.444-55", cargo:"Gerente Financeiro", departamento:"Financeiro", admissao:"2020-07-15", ativo:true },
  { id:"3", nome:"Ricardo Santos", cpf:"333.444.555-66", cargo:"Operador de Produção", departamento:"Manufatura", admissao:"2021-11-20", ativo:false },
];
const CARGOS_MOCK: ModuloItem[] = [
  { id:"1", cargo:"Analista de TI", departamento:"Tecnologia", nivel:"Pleno", cbo:"2124-05", ativo:true },
  { id:"2", cargo:"Gerente Financeiro", departamento:"Financeiro", nivel:"Sênior", cbo:"1236-05", ativo:true },
  { id:"3", cargo:"Operador de Produção", departamento:"Manufatura", nivel:"Júnior", cbo:"7171-10", ativo:true },
];
const PONTO_MOCK: ModuloItem[] = [
  { id:"1", funcionario:"Carlos Eduardo Lima", data:"2025-08-01", entrada:"08:02", saida:"17:58", horas:"9h 56m", status:"Normal" },
  { id:"2", funcionario:"Fernanda Oliveira", data:"2025-08-01", entrada:"07:55", saida:"18:10", horas:"10h 15m", status:"HE" },
  { id:"3", funcionario:"Carlos Eduardo Lima", data:"2025-08-02", entrada:"—", saida:"—", horas:"0h", status:"Falta" },
];
const FOLHA_MOCK: ModuloItem[] = [
  { id:"1", funcionario:"Carlos Eduardo Lima", competencia:"07/2025", salarioBruto:"R$ 6.500,00", descontos:"R$ 1.282,50", liquido:"R$ 5.217,50", status:"Pago" },
  { id:"2", funcionario:"Fernanda Oliveira", competencia:"07/2025", salarioBruto:"R$ 12.000,00", descontos:"R$ 3.150,00", liquido:"R$ 8.850,00", status:"Pago" },
];

// ─── Módulo Manufatura ────────────────────────────────────────────────────────

const ORDENS_MOCK: ModuloItem[] = [
  { id:"1", numero:"OP-2025-001", produto:"Parafuso Sextavado M8", quantidade:"5.000 un", inicio:"2025-08-01", fim:"2025-08-05", status:"Em produção" },
  { id:"2", numero:"OP-2025-002", produto:"Porca Sextavada M8", quantidade:"5.000 un", inicio:"2025-08-06", fim:"2025-08-08", status:"Aguardando" },
  { id:"3", numero:"OP-2025-003", produto:"Arruela Lisa M8", quantidade:"10.000 un", inicio:"2025-07-20", fim:"2025-07-28", status:"Concluída" },
];
const ESTRUTURA_MOCK: ModuloItem[] = [
  { id:"1", codigo:"PAR-M8", descricao:"Parafuso Sextavado M8", componentes:"3", niveis:"2", unidade:"UN", status:"Ativo" },
  { id:"2", codigo:"POR-M8", descricao:"Porca Sextavada M8", componentes:"2", niveis:"1", unidade:"UN", status:"Ativo" },
];
const CENTROS_MOCK: ModuloItem[] = [
  { id:"1", codigo:"CT-01", descricao:"Tornos CNC", turno:"2 turnos", capacidade:"480 h/mês", eficiencia:"87%", status:"Ativo" },
  { id:"2", codigo:"CT-02", descricao:"Fresadoras", turno:"1 turno", capacidade:"240 h/mês", eficiencia:"92%", status:"Ativo" },
  { id:"3", codigo:"CT-03", descricao:"Montagem Final", turno:"1 turno", capacidade:"240 h/mês", eficiencia:"95%", status:"Manutenção" },
];
const ROTEIROS_MOCK: ModuloItem[] = [
  { id:"1", codigo:"ROT-001", descricao:"Usinagem Parafuso M8", operacoes:"4", tempoTotal:"12 min/un", centroTrabalho:"CT-01", status:"Ativo" },
  { id:"2", codigo:"ROT-002", descricao:"Usinagem Porca M8", operacoes:"3", tempoTotal:"8 min/un", centroTrabalho:"CT-01", status:"Ativo" },
];

// ─── Módulo Suprimentos ───────────────────────────────────────────────────────

const FORNECEDORES_MOCK: ModuloItem[] = [
  { id:"1", razaoSocial:"Aço Brasil Ltda", cnpj:"12.345.678/0001-99", cidade:"São Paulo / SP", contato:"comercial@acobrasil.com.br", status:"Ativo" },
  { id:"2", razaoSocial:"Metais do Sul S.A.", cnpj:"98.765.432/0001-11", cidade:"Porto Alegre / RS", contato:"vendas@metaisdosul.com.br", status:"Ativo" },
  { id:"3", razaoSocial:"Distribuição Norte Eireli", cnpj:"55.444.333/0001-22", cidade:"Manaus / AM", contato:"comercial@distnorte.com.br", status:"Inativo" },
];
const COTACOES_MOCK: ModuloItem[] = [
  { id:"1", numero:"COT-2025-001", descricao:"Aço 1020 barra chata", fornecedores:"3", prazo:"2025-08-10", melhorPreco:"R$ 8,50/kg", status:"Aberta" },
  { id:"2", numero:"COT-2025-002", descricao:"Óleo de corte industrial 20L", fornecedores:"2", prazo:"2025-08-05", melhorPreco:"R$ 145,00/un", status:"Encerrada" },
];
const PEDIDOS_MOCK: ModuloItem[] = [
  { id:"1", numero:"PC-2025-0032", fornecedor:"Aço Brasil Ltda", valor:"R$ 42.500,00", emissao:"2025-07-28", entrega:"2025-08-12", status:"Aprovado" },
  { id:"2", numero:"PC-2025-0033", fornecedor:"Metais do Sul S.A.", valor:"R$ 18.200,00", emissao:"2025-08-01", entrega:"2025-08-20", status:"Pendente" },
  { id:"3", numero:"PC-2025-0031", fornecedor:"Distribuição Norte Eireli", valor:"R$ 5.670,00", emissao:"2025-07-15", entrega:"2025-07-30", status:"Recebido" },
];
const ESTOQUE_MOCK: ModuloItem[] = [
  { id:"1", codigo:"MAT-001", descricao:"Aço 1020 barra chata 2\"", saldo:"2.450 kg", minimo:"500 kg", maximo:"5.000 kg", localizacao:"Almox A-12", status:"OK" },
  { id:"2", codigo:"MAT-002", descricao:"Aço inox 316 chapa 3mm", saldo:"320 kg", minimo:"400 kg", maximo:"2.000 kg", localizacao:"Almox A-15", status:"Abaixo mín." },
  { id:"3", codigo:"MAT-003", descricao:"Óleo de corte industrial", saldo:"85 L", minimo:"50 L", maximo:"500 L", localizacao:"Almox B-02", status:"OK" },
];

// ─── Configurações ────────────────────────────────────────────────────────────

const PARAMETROS_MOCK: ModuloItem[] = [
  { id:"1", parametro:"MOEDA_PADRAO", valor:"BRL", descricao:"Moeda padrão do sistema", grupo:"Geral" },
  { id:"2", parametro:"DECIMAIS_QTD", valor:"3", descricao:"Casas decimais para quantidades", grupo:"Geral" },
  { id:"3", parametro:"REGIME_ICMS", valor:"NORMAL", descricao:"Regime de apuração de ICMS", grupo:"Fiscal" },
  { id:"4", parametro:"ALIQUOTA_ISS", valor:"5%", descricao:"Alíquota padrão de ISS municipal", grupo:"Fiscal" },
];
const NUMERACOES_MOCK: ModuloItem[] = [
  { id:"1", documento:"Pedido de Compra", prefixo:"PC", serie:"01", proximo:"34", ativo:true },
  { id:"2", documento:"Ordem de Produção", prefixo:"OP", serie:"01", proximo:"4", ativo:true },
  { id:"3", documento:"Cotação", prefixo:"COT", serie:"01", proximo:"3", ativo:true },
  { id:"4", documento:"NF-e Saída", prefixo:"", serie:"001", proximo:"1250", ativo:true },
];
const CERTIFICADOS_MOCK: ModuloItem[] = [
  { id:"1", cnpj:"11.222.333/0001-81", empresa:"Comércio Geral Ltda", tipo:"A1", validade:"2026-03-15", status:"Válido" },
  { id:"2", cnpj:"22.333.444/0001-95", empresa:"Indústria Norte S.A.", tipo:"A3", validade:"2025-10-01", status:"A vencer" },
];
const BACKUP_MOCK: ModuloItem[] = [
  { id:"1", data:"2025-08-01 03:00", tipo:"Automático", tamanho:"2,4 GB", duracao:"4m 12s", status:"Sucesso" },
  { id:"2", data:"2025-07-31 03:00", tipo:"Automático", tamanho:"2,3 GB", duracao:"3m 58s", status:"Sucesso" },
  { id:"3", data:"2025-07-30 14:22", tipo:"Manual", tamanho:"2,3 GB", duracao:"4m 05s", status:"Sucesso" },
];

// ─── 404 ──────────────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 gap-4 text-slate-400">
      <p className="text-8xl font-black text-slate-200">404</p>
      <p className="text-base font-medium text-slate-500">Página não encontrada.</p>
      <a href="/" className="text-blue-600 text-sm font-medium hover:underline">Voltar ao início</a>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export function MasterERPApp({ onBack }: { onBack: () => void }) {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage onBack={onBack} />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell onBack={onBack} />}>
              <Route index element={<DashboardPage />} />
              <Route path="empresas" element={<EmpresasPage />} />
              <Route path="filiais" element={<FiliaisPage />} />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="regras-fiscais" element={<RegrasFiscaisPage />} />
              <Route path="resolver-fiscal" element={<ResolvedorFiscalPage />} />
              {/* Administrativo */}
              <Route path="adm/funcionarios" element={<ModuloPage titulo="Funcionários" modulo="Funcionário" eyebrow="Administrativo" cor="amber" mock={FUNCIONARIOS_MOCK} colunas={[{key:"nome",label:"Nome"},{key:"cpf",label:"CPF",mono:true},{key:"cargo",label:"Cargo"},{key:"departamento",label:"Departamento"},{key:"admissao",label:"Admissão"}]} />} />
              <Route path="adm/cargos" element={<ModuloPage titulo="Cargos e Departamentos" modulo="Cargo" eyebrow="Administrativo" cor="amber" mock={CARGOS_MOCK} colunas={[{key:"cargo",label:"Cargo"},{key:"departamento",label:"Departamento"},{key:"nivel",label:"Nível"},{key:"cbo",label:"CBO",mono:true}]} />} />
              <Route path="adm/ponto" element={<ModuloPage titulo="Controle de Ponto" modulo="Registro" eyebrow="Administrativo" cor="amber" mock={PONTO_MOCK} colunas={[{key:"funcionario",label:"Funcionário"},{key:"data",label:"Data"},{key:"entrada",label:"Entrada",mono:true},{key:"saida",label:"Saída",mono:true},{key:"horas",label:"Total"},{key:"status",label:"Status"}]} />} />
              <Route path="adm/folha" element={<ModuloPage titulo="Folha de Pagamento" modulo="Folha" eyebrow="Administrativo" cor="amber" mock={FOLHA_MOCK} colunas={[{key:"funcionario",label:"Funcionário"},{key:"competencia",label:"Competência"},{key:"salarioBruto",label:"Bruto",mono:true},{key:"descontos",label:"Descontos",mono:true},{key:"liquido",label:"Líquido",mono:true},{key:"status",label:"Status"}]} />} />
              {/* Manufatura */}
              <Route path="mfg/ordens" element={<ModuloPage titulo="Ordens de Produção" modulo="Ordem" eyebrow="Manufatura" cor="violet" mock={ORDENS_MOCK} colunas={[{key:"numero",label:"Número",mono:true},{key:"produto",label:"Produto"},{key:"quantidade",label:"Qtd."},{key:"inicio",label:"Início"},{key:"fim",label:"Fim"},{key:"status",label:"Status"}]} />} />
              <Route path="mfg/estrutura" element={<ModuloPage titulo="Estrutura de Produto" modulo="Estrutura" eyebrow="Manufatura" cor="violet" mock={ESTRUTURA_MOCK} colunas={[{key:"codigo",label:"Código",mono:true},{key:"descricao",label:"Descrição"},{key:"componentes",label:"Componentes"},{key:"niveis",label:"Níveis"},{key:"unidade",label:"UM"}]} />} />
              <Route path="mfg/centros" element={<ModuloPage titulo="Centros de Trabalho" modulo="Centro" eyebrow="Manufatura" cor="violet" mock={CENTROS_MOCK} colunas={[{key:"codigo",label:"Código",mono:true},{key:"descricao",label:"Descrição"},{key:"turno",label:"Turno"},{key:"capacidade",label:"Capacidade"},{key:"eficiencia",label:"Eficiência"}]} />} />
              <Route path="mfg/roteiros" element={<ModuloPage titulo="Roteiros de Produção" modulo="Roteiro" eyebrow="Manufatura" cor="violet" mock={ROTEIROS_MOCK} colunas={[{key:"codigo",label:"Código",mono:true},{key:"descricao",label:"Descrição"},{key:"operacoes",label:"Operações"},{key:"tempoTotal",label:"Tempo total"},{key:"centroTrabalho",label:"Centro"}]} />} />
              {/* Suprimentos */}
              <Route path="sup/fornecedores" element={<ModuloPage titulo="Fornecedores" modulo="Fornecedor" eyebrow="Suprimentos" cor="emerald" mock={FORNECEDORES_MOCK} colunas={[{key:"razaoSocial",label:"Razão Social"},{key:"cnpj",label:"CNPJ",mono:true},{key:"cidade",label:"Cidade"},{key:"contato",label:"Contato"}]} />} />
              <Route path="sup/cotacoes" element={<ModuloPage titulo="Cotações" modulo="Cotação" eyebrow="Suprimentos" cor="emerald" mock={COTACOES_MOCK} colunas={[{key:"numero",label:"Número",mono:true},{key:"descricao",label:"Descrição"},{key:"fornecedores",label:"Fornecedores"},{key:"prazo",label:"Prazo"},{key:"melhorPreco",label:"Melhor preço",mono:true},{key:"status",label:"Status"}]} />} />
              <Route path="sup/pedidos" element={<ModuloPage titulo="Pedidos de Compra" modulo="Pedido" eyebrow="Suprimentos" cor="emerald" mock={PEDIDOS_MOCK} colunas={[{key:"numero",label:"Número",mono:true},{key:"fornecedor",label:"Fornecedor"},{key:"valor",label:"Valor",mono:true},{key:"emissao",label:"Emissão"},{key:"entrega",label:"Entrega"},{key:"status",label:"Status"}]} />} />
              <Route path="sup/estoque" element={<ModuloPage titulo="Estoque" modulo="Item" eyebrow="Suprimentos" cor="emerald" mock={ESTOQUE_MOCK} colunas={[{key:"codigo",label:"Código",mono:true},{key:"descricao",label:"Descrição"},{key:"saldo",label:"Saldo"},{key:"minimo",label:"Mínimo"},{key:"localizacao",label:"Localização"},{key:"status",label:"Status"}]} />} />
              {/* Configurações */}
              <Route path="config/parametros" element={<ModuloPage titulo="Parâmetros do Sistema" modulo="Parâmetro" eyebrow="Configurações" cor="slate" mock={PARAMETROS_MOCK} colunas={[{key:"parametro",label:"Parâmetro",mono:true},{key:"valor",label:"Valor"},{key:"descricao",label:"Descrição"},{key:"grupo",label:"Grupo"}]} />} />
              <Route path="config/numeracoes" element={<ModuloPage titulo="Numerações e Séries" modulo="Numeração" eyebrow="Configurações" cor="slate" mock={NUMERACOES_MOCK} colunas={[{key:"documento",label:"Documento"},{key:"prefixo",label:"Prefixo",mono:true},{key:"serie",label:"Série",mono:true},{key:"proximo",label:"Próximo",mono:true}]} />} />
              <Route path="config/certificado" element={<ModuloPage titulo="Certificados Digitais" modulo="Certificado" eyebrow="Configurações" cor="slate" mock={CERTIFICADOS_MOCK} colunas={[{key:"empresa",label:"Empresa"},{key:"cnpj",label:"CNPJ",mono:true},{key:"tipo",label:"Tipo"},{key:"validade",label:"Validade"},{key:"status",label:"Status"}]} />} />
              <Route path="config/backup" element={<ModuloPage titulo="Backup do Sistema" modulo="Backup" eyebrow="Configurações" cor="slate" mock={BACKUP_MOCK} colunas={[{key:"data",label:"Data/Hora",mono:true},{key:"tipo",label:"Tipo"},{key:"tamanho",label:"Tamanho"},{key:"duracao",label:"Duração"},{key:"status",label:"Status"}]} />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
