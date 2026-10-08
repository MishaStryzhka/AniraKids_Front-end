import { Button } from '../../design-system/components/Button';
import { getBookingPolicy } from '../api/publicApi';
import { usePublicRead } from '../usePublicRead';
import { Page, Panel, Title, Copy, Actions } from '../storefrontStyles';
import {
  BookingPaymentExplanation,
  CompanyInformation,
} from './PaymentInformation';
export function BookingInformationPage() {
  const policy = usePublicRead('booking-policy', getBookingPolicy);
  return (
    <Page>
      <Title>Informace o pronájmu a platbách</Title>
      <Panel>
        <Copy>
          Základní informace o provozovateli, rezervační záloze a vratné kauci.
        </Copy>
        {policy.loading ? (
          <Copy role="status">Načítání informací…</Copy>
        ) : policy.error ? (
          <>
            <Copy role="alert">
              Informace se nepodařilo načíst. Zkuste to prosím znovu.
            </Copy>
            <Actions>
              <Button onClick={policy.reload}>Zkusit znovu</Button>
            </Actions>
          </>
        ) : policy.data ? (
          <>
            <BookingPaymentExplanation policy={policy.data} />
            <CompanyInformation company={policy.data.company} />
          </>
        ) : null}
      </Panel>
    </Page>
  );
}
