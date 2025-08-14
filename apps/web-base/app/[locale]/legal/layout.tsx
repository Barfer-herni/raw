import type { ReactNode } from 'react';

type LegalLayoutProperties = {
  readonly children: ReactNode;
};

const LegalLayout = ({ children }: LegalLayoutProperties) => {
  return <>{children}</>;
};

export default LegalLayout;
