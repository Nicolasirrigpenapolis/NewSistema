export const tipoRodadoMap: { [key: string]: string } = {
  '01': 'Truck',
  '02': 'Toco',
  '03': 'Cavalo Mecânico',
  '04': 'VAN',
  '05': 'Utilitário',
  '06': 'Outros',
};

export const tipoCarroceriaMap: { [key: string]: string } = {
  '00': 'Não aplicável',
  '01': 'Aberta',
  '02': 'Fechada/Baú',
  '03': 'Graneleira',
  '04': 'Porta Container',
  '05': 'Sider',
};

export const getTipoRodadoNome = (codigo: string): string => {
  return tipoRodadoMap[codigo] || `Tipo ${codigo}`;
};

export const getTipoCarroceriaNome = (codigo: string): string => {
  return tipoCarroceriaMap[codigo] || `Tipo ${codigo}`;
};
