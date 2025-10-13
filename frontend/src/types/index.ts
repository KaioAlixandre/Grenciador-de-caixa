export interface User {
  id: string;
  nome: string;
  email: string;
  papel: 'ADMIN' | 'USER';
}

export interface LoginResponse {
  success: boolean;
  token: string;
  data: User;
}

export interface Product {
  id: string;
  nome: string;
  descricao?: string;
  codigo_barras?: string;
  categoria_id: string;
  fornecedor_id?: string;
  unidade_medida: string;
  preco_compra: number;
  preco_venda: number;
  margem_lucro?: number;
  estoque_minimo: number;
  estoque_atual: number;
  ativo: boolean;
  tem_peso: boolean;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
  categoria?: {
    nome: string;
  };
  fornecedor?: {
    nome: string;
  };
}

export interface Category {
  id: string;
  nome: string;
  descricao?: string;
  tipo: string;
  cor: string;
  icone: string;
  ativa: boolean;
  usuario_id: string;
  criado_em: string;
  atualizado_em: string;
  produtos?: Product[];
}

export interface Customer {
  id: string;
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  ativo: boolean;
  limite_credito: number;
  saldo_devedor: number;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Supplier {
  id: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  ativo: boolean;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface SaleItem {
  id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  produto?: {
    nome: string;
    unidade_medida: string;
  };
}

export interface Sale {
  id: string;
  numero_venda: number;
  cliente_id?: string;
  vendedor_id: string;
  data_venda: string;
  valor_total: number;
  valor_desconto: number;
  valor_final: number;
  metodo_pagamento: string;
  tipo_pagamento: string;
  status: 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA';
  observacoes?: string;
  cliente?: {
    nome: string;
    telefone?: string;
  };
  itens: SaleItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  message?: string;
  error?: string;
}