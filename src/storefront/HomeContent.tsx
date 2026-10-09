import styled from 'styled-components';
import IconBeauty from '../images/icons/IconBeauty';
import { Button } from '../design-system/components/Button';
import { designTokens as t } from '../design-system/tokens/designTokens';
import { getCatalogue } from './api/publicApi';
import { usePublicRead } from './usePublicRead';
import { Grid, ProductImage } from './CataloguePage';
import { FavoriteButton, FavoritesFeedback } from './favorites/FavoriteButton';
import { Actions, Copy, RouteLink } from './storefrontStyles';
import { productPath, routes } from '../navigation/routes';
import { RentalSteps } from './RentalSteps';
const Content = styled.div`color:${t.color.text.primary};font-family:${t.font.family.ui};`;
const Section = styled.section`max-width:1200px;margin:0 auto;padding:clamp(40px,7vw,88px) 24px;display:grid;gap:32px;min-width:0;`;
const Intro = styled(Section)`text-align:center;justify-items:center;gap:20px;max-width:850px;svg{width:86px;height:86px;}`;
const Heading = styled.h2`font:500 clamp(28px,4vw,44px)/1.2 'Cormorant SC',serif;margin:0;text-transform:uppercase;`;
const Eyebrow = styled.p`font-size:12px;letter-spacing:.18em;text-transform:uppercase;margin:0;color:${t.color.text.secondary};`;
const Band = styled.div`background:${t.color.bg.subtle};`;
const Choices = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:24px;@media(max-width:600px){grid-template-columns:minmax(0,1fr);}`;
const Choice = styled.div`padding:32px;display:grid;gap:16px;border:1px solid ${t.color.border.subtle};background:${t.color.bg.canvas};h3{font:500 28px/1.2 'Cormorant SC',serif;margin:0;}a{justify-self:start;}`;
const ProductLink = styled(RouteLink)`display:block;padding:0;border:0;background:none;text-align:left;font-weight:400;&:hover{background:none;}h3{font-size:17px;line-height:1.5;margin:12px 0 0;}`;
const ProductFooter = styled.div`display:flex;justify-content:space-between;gap:12px;align-items:center;`;
export function HomeContent(){
 const catalogue=usePublicRead('home-catalogue',signal=>getCatalogue({sort:'newest',page:1,limit:3},signal));
 return <Content>
 <Intro><IconBeauty className="home-emblem" aria-hidden="true"/><Eyebrow>ANIRAK · chvíle, na kterých záleží</Eyebrow><Heading>Velké vzpomínky.<br/>Malé slavnostní detaily.</Heading><Copy>Pro narozeniny, svatby i první společné fotografie. Vyberte si oblečení pro výjimečný den a dopřejte mu další příběh.</Copy><Actions><RouteLink to={routes.dresses}>Dívčí šaty</RouteLink><RouteLink to={routes.suits}>Chlapecké obleky</RouteLink></Actions></Intro>
 <Band><Section aria-labelledby="home-collection"><Eyebrow>Vyberte si podle příležitosti</Eyebrow><Heading id="home-collection">Slavnostní šatník</Heading><Choices><Choice><h3>Šaty pro malé slečny</h3><Copy>Jemné barvy, slavnostní střihy a kousky pro nezapomenutelné okamžiky.</Copy><RouteLink to={routes.dresses}>Prohlédnout šaty</RouteLink></Choice><Choice><h3>Obleky pro malé gentlemany</h3><Copy>Pro rodinné oslavy, svatby a fotografie, ke kterým se budete rádi vracet.</Copy><RouteLink to={routes.suits}>Prohlédnout obleky</RouteLink></Choice></Choices></Section></Band>
 <Section aria-labelledby="home-new"><Eyebrow>Z naší aktuální nabídky</Eyebrow><Heading id="home-new">Objevte své favority</Heading><FavoritesFeedback/>
 {catalogue.loading?<Copy role="status">Načítání nabídky…</Copy>:catalogue.error?<><Copy role="alert">Nabídku se nepodařilo načíst.</Copy><Actions><Button variant="secondary" onClick={catalogue.reload}>Zkusit znovu</Button></Actions></>:catalogue.data?.items.length?<Grid>{catalogue.data.items.map(p=><li key={p.id}><ProductLink to={productPath(p.slug)}><ProductImage product={p}/><h3>{p.name}</h3></ProductLink><ProductFooter><Copy>Zobrazit velikosti a cenu</Copy><FavoriteButton id={p.id} name={p.name}/></ProductFooter></li>)}</Grid>:<Copy>Nabídku právě připravujeme. Napište nám, s výběrem vám rádi pomůžeme.</Copy>}
 <Actions><RouteLink to={routes.newArrivals}>Celá nabídka</RouteLink></Actions></Section>
 <Band><Section aria-labelledby="home-how"><Eyebrow>Jednoduše, krok za krokem</Eyebrow><Heading id="home-how">Jak funguje pronájem</Heading><RentalSteps/><Actions><RouteLink to={routes.rentalHowItWorks}>Podrobnosti o pronájmu a platbách</RouteLink></Actions></Section></Band>
 <Intro><Eyebrow>Jsme tu pro vás</Eyebrow><Heading>Potřebujete poradit s výběrem?</Heading><Copy>Napište nám, pro jakou příležitost a termín oblečení hledáte. Společně vybereme další krok.</Copy><RouteLink to={routes.contact}>Kontaktujte nás</RouteLink></Intro>
 </Content>;
}
