import {
  Search,
  LayoutDashboard,
  Gavel,
  Zap,
  Settings,
  ShieldCheck,
  Smartphone,
  Users,
  UserCircle,
  Mail,
  Globe
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  maintenance?: boolean;
  adminOnly?: boolean;
}

export const MAIN_MENU: MenuItem[] = [
  {
    id: 'search-number',
    label: 'Consulta Processo',
    icon: Search,
    path: '/'
  },
  {
    id: 'monitor-new',
    label: 'Consulta CPF e CNPJ',
    icon: LayoutDashboard,
    path: '/monitoramento'
  },
  {
    id: 'my-processes',
    label: 'Processos Monitorados',
    icon: Gavel,
    path: '/meus-processos'
  },
  {
    id: 'my-account',
    label: 'Minha Conta',
    icon: UserCircle,
    path: '/minha-conta'
  },
  {
    id: 'pricing',
    label: 'Assinar Plano',
    icon: Zap,
    path: '/planos'
  },
];

export const ADMIN_MENU: MenuItem[] = [
  {
    id: 'users',
    label: 'Usuários',
    icon: Users,
    path: '/usuarios',
    adminOnly: true
  },
  {
    id: 'settings',
    label: 'Gestão de Planos',
    icon: Settings,
    path: '/configuracoes',
    adminOnly: true
  },
  {
    id: 'usage-limits',
    label: 'Limites de Uso',
    icon: ShieldCheck,
    path: '/limites-de-uso',
    adminOnly: true
  },
  {
    id: 'email-templates',
    label: 'Modelos de E-mail',
    icon: Mail,
    path: '/email-templates',
    adminOnly: true
  },
  {
    id: 'seo-management',
    label: 'SEO Google',
    icon: Globe,
    path: '/adm/seo',
    adminOnly: true
  },
  {
    id: 'resend-test',
    label: 'Teste E-mail',
    icon: Zap,
    path: '/resend-test',
    adminOnly: true
  },
  {
    id: 'z-api',
    label: 'Integração WhatsApp',
    icon: Smartphone,
    path: '/z-api',
    adminOnly: true
  }
];