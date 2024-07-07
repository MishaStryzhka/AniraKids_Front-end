import { Container } from 'components/Container/Container';
import { Item, List, Text, Title } from './PrivacyPolicyPage.styled';
import PageTitle from 'components/PageTitle/PageTitle';
import Border from 'components/Border/Border';

const PrivacyPolicyPage = () => {
  return (
    <Container style={{ padding: '30px 70px 100px' }}>
      <PageTitle>Zásady ochrany osobních údajů</PageTitle>
      <Border />
      <Text style={{ textAlign: 'right' }}>
        Poslední aktualizace: 28.02.2024
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
        našeho zástupce pro ochranu osobních údajů:
        mykhailo.stryzhka@anirakids.cz
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

      <Title>3. Jak používáme shromážděné osobní údaje</Title>
      <Text>Vaše osobní údaje používáme pro následující účely:</Text>
      <List>
        <Item>Zajištění a správu našich služeb</Item>
        <Item>
          Komunikaci s vámi ohledně našich služeb a aktuálních nabídek
        </Item>
        <Item>
          Vylepšení našich služeb a nabídek na základě vašich preferencí
        </Item>
        <Item>Splnění našich právních povinností</Item>
      </List>

      <Title>4. Předávání osobních údajů třetím stranám</Title>
      <Text>
        Vaše osobní údaje nepředáváme žádným třetím stranám bez vašeho souhlasu,
        s výjimkou případů, kdy to vyžaduje zákon nebo jsme k tomu oprávněni na
        základě našich oprávněných zájmů.
      </Text>

      <Title>5. Ochrana osobních údajů</Title>
      <Text>
        Podnikáme veškerá opatření k ochraně vašich osobních údajů před
        neoprávněným přístupem, ztrátou, zneužitím nebo zničením. Vaše údaje
        jsou chráněny proti neoprávněnému přístupu šifrováním a dalšími
        bezpečnostními opatřeními.
      </Text>

      <Title>6. Vaše práva ohledně osobních údajů</Title>
      <Text>Máte právo:</Text>
      <List>
        <Item>Žádat o přístup k vašim osobním údajům</Item>
        <Item>Opravit nebo doplnit vaše osobní údaje</Item>
        <Item>Omezit zpracování vašich osobních údajů</Item>
        <Item>Odvolat souhlas se zpracováním osobních údajů</Item>
        <Item>Požadovat vymazání vašich osobních údajů</Item>
      </List>

      <Title>7. Změny těchto zásad ochrany osobních údajů</Title>
      <Text>
        Tato zásada ochrany osobních údajů může být pravidelně aktualizována.
        Nové verze budou zveřejněny na našem webovém místě s uvedením data
        účinnosti.
      </Text>
    </Container>
  );
};

export default PrivacyPolicyPage;
