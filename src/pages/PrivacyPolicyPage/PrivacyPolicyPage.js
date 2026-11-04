import { Container } from 'components/Container/Container';
import { Item, List, Text, Title } from './PrivacyPolicyPage.styled';
import { Title as PageHeading } from 'components/PageTitle/PageTitle.styled';
import Border from 'components/Border/Border';
import styled from 'styled-components';

const PrivacyContainer = styled(Container)`
  padding: 30px 20px 80px;
  max-width: 960px;
  overflow-wrap: anywhere;
  @media (min-width: 768px) { padding: 40px 48px 100px; }
`;

const PrivacyPolicyPage = () => {
  return (
    <PrivacyContainer>
      <PageHeading as="h1">Zásady ochrany osobních údajů</PageHeading>
      <Border />
      <Text style={{ textAlign: 'right' }}>
        Poslední aktualizace: 04.11.2026
      </Text>

      <Text style={{ marginTop: 20 }}>
        Děkujeme vám za používání našich služeb. V těchto zásadách ochrany
        osobních údajů je popsáno, jak shromažďujeme, používáme a chráníme
        osobní údaje, které nám poskytnete.
      </Text>

      <Title>1. Identita a kontaktní údaje správce osobních údajů</Title>
      <Text>
        <span>Název:</span> GlamGarb Rentals s.r.o.
        <br />
        <span>IČO:</span> 19970561
        <br />
        <span>Adresa:</span> Bílkova 855/19, Staré Město, 110 00 Praha
      </Text>
      <Text>
        Pro jakékoliv otázky ohledně ochrany osobních údajů můžete kontaktovat
        společnost na e-mailu glamgarbrentals@seznam.cz
      </Text>

      <Title>2. Jaké osobní údaje shromažďujeme</Title>
      <Text>Můžeme shromažďovat následující osobní údaje:</Text>
      <List>
        <Item>Jméno a příjmení</Item>
        <Item>Kontaktní údaje (e-mailová adresa, telefonní číslo)</Item>
        <Item>Adresa bydliště nebo sídla</Item>
        <Item>
          Další údaje, které nám poskytnete při registraci nebo používání našich
          služeb
        </Item>
      </List>

      <Title>3. Účely a právní důvody zpracování</Title>
      <Text>Kontaktní, rezervační a doručovací údaje používáme k vyřízení vaší žádosti a plnění smlouvy. Bez nezbytných údajů nemůžeme rezervaci nebo doručení zajistit. Údaje o platbách a dokladech zpracováváme také kvůli zákonným účetním povinnostem. Pro ochranu právních nároků a bezpečnost služby využíváme oprávněný zájem.</Text>
      <Title>4. Příjemci a uchování údajů</Title>
      <Text>V nezbytném rozsahu údaje zpřístupňujeme poskytovatelům provozu webu a komunikace, účetních a platebních služeb a při zvoleném doručení dopravci. Předání potřebné pro smlouvu nebo zákonnou povinnost nevyžaduje samostatný souhlas.</Text>
      <Text>Údaje uchováváme po dobu vyřízení rezervace a trvání souvisejících nároků; účetní doklady po dobu vyžadovanou příslušnými předpisy. Údaje zpracovávané pouze na základě souhlasu uchováváme do jeho odvolání nebo skončení příslušného účelu.</Text>

      <Title>Analytika návštěvnosti</Title>
      <Text>
        S vaším souhlasem používáme Google Analytics k měření návštěvnosti a
        používání veřejných stránek, produktů a rezervačního procesu. Google
        zpracovává online identifikátory, údaje o zařízení a událostech na webu.
        Analytiku nespouštíme před udělením souhlasu. Nepředáváme jí jména,
        e-mailové adresy, telefonní čísla ani soukromé odkazy k rezervacím.
        Souhlas můžete kdykoli změnit nebo odvolat na stránce <a href="/cookies">Cookies</a>.
        Další informace o zpracování dat společností Google jsou v jejích{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">zásadách ochrany soukromí</a>.
      </Text>
      <Title>5. Ochrana osobních údajů</Title>
      <Text>Přístup k údajům omezujeme na osoby, které je potřebují pro vyřízení služby. Soukromý odkaz k rezervaci nesdílejte s dalšími osobami.</Text>

      <Title>6. Vaše práva ohledně osobních údajů</Title>
      <Text>Máte právo:</Text>
      <List>
        <Item>Žádat o přístup k vašim osobním údajům</Item>
        <Item>Opravit nebo doplnit vaše osobní údaje</Item>
        <Item>Omezit zpracování vašich osobních údajů</Item>
        <Item>Odvolat souhlas se zpracováním osobních údajů</Item>
        <Item>Požadovat vymazání vašich osobních údajů, jsou-li splněny zákonné podmínky</Item>
        <Item>Požadovat přenositelnost údajů a vznést námitku proti zpracování založenému na oprávněném zájmu</Item>
      </List>

      <Text>Se žádostí nás kontaktujte na glamgarbrentals@seznam.cz. Můžete podat stížnost u <a href="https://uoou.gov.cz/" target="_blank" rel="noreferrer">Úřadu pro ochranu osobních údajů</a>.</Text>
      <Title>7. Změny těchto zásad ochrany osobních údajů</Title>
      <Text>
        Tato zásada ochrany osobních údajů může být pravidelně aktualizována.
        Nové verze budou zveřejněny na našem webovém místě s uvedením data
        účinnosti.
      </Text>
    </PrivacyContainer>
  );
};

export default PrivacyPolicyPage;
