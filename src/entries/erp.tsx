import { MasterERPApp } from "../app/MasterERPApp";
import { LicenseGate } from "../app/components/LicenseGate";
import { OwnerGate } from "../app/components/OwnerGate";
import { AuthProvider } from "../app/services/auth";
import { renderApp, returnToPortal } from "./renderApp";

renderApp(
  <AuthProvider>
    <OwnerGate onBack={returnToPortal}>
      <LicenseGate product="erp">
        <MasterERPApp onBack={returnToPortal} />
      </LicenseGate>
    </OwnerGate>
  </AuthProvider>,
);
