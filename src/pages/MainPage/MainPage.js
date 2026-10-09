import SectionHero from 'components/SectionHero/SectionHero';
import { useTitle } from 'hooks';
import SeznamCallback from '../../auth/SeznamCallback';
import { HomeContent } from '../../storefront/HomeContent';
const MainPage = () => {
  useTitle('ANIRAK — šaty a obleky k pronájmu');
  return <><SeznamCallback /><SectionHero description="Výjimečné oblečení pro vaše společné chvíle. Šaty a obleky na oslavy, svatby i rodinné focení." cta="Prohlédnout nabídku" to="/saty" /><HomeContent /></>;
};
export default MainPage;
