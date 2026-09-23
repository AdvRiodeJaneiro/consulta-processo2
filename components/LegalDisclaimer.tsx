import React from 'react';

export const LegalDisclaimer: React.FC = () => {
  return (
    <div className="text-xs text-slate-400 text-center mt-4 px-4">
      <p>
        A JurisClaro utiliza Inteligência Artificial para fins informativos. 
        As explicações não substituem a consulta com um advogado registrado na OAB.
        Dados obtidos via API Pública do Datajud (CNJ).
      </p>
    </div>
  );
};
