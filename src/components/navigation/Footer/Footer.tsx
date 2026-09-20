import { Instagram } from 'lucide-react';
import { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { Container } from '../../../design-system/components/Container';
import { Divider } from '../../../design-system/components/Divider';
import { NavigationLink } from '../../../design-system/components/NavigationLink';
import { designTokens as t } from '../../../design-system/tokens/designTokens';
import { routes } from '../../../navigation/routes';

const Shell = styled.footer`
  border-block-start: 1px solid ${t.color.border.subtle};
  background: ${t.color.bg.subtle};
  color: ${t.color.text.primary};
  font-family: ${t.font.family.ui};
`;

const Inner = styled(Container)`
  padding-block: ${t.space[12]} ${t.space[6]};

  @media (min-width: ${t.breakpoint.lg}) {
    padding-block: ${t.space[16]} ${t.space[8]};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${t.space[8]};

  @media (min-width: ${t.breakpoint.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${t.space[8]} ${t.space[6]};
  }

  @media (min-width: ${t.breakpoint.lg}) {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: ${t.grid.gutter.lg};
  }
`;

const Group = styled.section<{ $span: number }>`
  min-inline-size: 0;

  @media (min-width: ${t.breakpoint.lg}) {
    grid-column: span ${({ $span }) => $span};
  }
`;

const Heading = styled.h2`
  margin: 0 0 ${t.space[4]};
  color: ${t.color.text.primary};
  font-size: ${t.type.label.size};
  line-height: ${t.type.label.lineHeight};
  font-weight: ${t.type.label.weight};
  letter-spacing: ${t.type.label.letterSpacing};
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const footerText = css`
  min-block-size: ${t.control.height.compact};
  font-family: ${t.font.family.ui};
  font-size: ${t.type.bodySm.size};
  line-height: ${t.type.bodySm.lineHeight};
`;

const FooterLink = styled(NavigationLink)`
  ${footerText}
`;

const ExternalLink = styled.a`
  ${footerText}
  display: inline-flex;
  align-items: center;
  gap: ${t.space[2]};
  color: ${t.color.text.secondary};
  text-decoration: none;

  &:hover { color: ${t.color.action.ghost.fg}; }
  &:active { color: ${t.color.action.primary.bgActive}; }
  &:focus-visible {
    outline: ${t.focus.ring.width} solid ${t.color.focus.ring};
    outline-offset: ${t.focus.ring.offset};
    border-radius: ${t.radius[1]};
  }

  svg {
    inline-size: ${t.icon.size.md};
    block-size: ${t.icon.size.md};
    stroke-width: ${t.icon.strokeWidth};
  }
`;

const BottomDivider = styled(Divider)`margin-block-start: ${t.space[12]};`;

const Copyright = styled.p`
  margin: ${t.space[6]} 0 0;
  color: ${t.color.text.secondary};
  font-size: ${t.type.caption.size};
  line-height: ${t.type.caption.lineHeight};
  letter-spacing: ${t.type.caption.letterSpacing};
`;

interface LinkItem {
  label: string;
  to: string;
}

const groups: ReadonlyArray<{ title: string; span: number; links: readonly LinkItem[] }> = [
  {
    title: 'Sortiment',
    span: 2,
    links: [
      { label: 'Dívčí šaty', to: routes.dresses },
      { label: 'Chlapecké obleky', to: routes.suits },
      { label: 'Novinky', to: routes.newArrivals },
    ],
  },
  {
    title: 'Pronájem',
    span: 3,
    links: [
      { label: 'Pronájem', to: routes.rental },
      { label: 'Jak funguje pronájem', to: routes.rentalHowItWorks },
      { label: 'Podmínky pronájmu', to: routes.rentalTerms },
    ],
  },
  {
    title: 'Pomoc',
    span: 2,
    links: [
      { label: 'FAQ', to: routes.faq },
      { label: 'Kontakt', to: routes.contact },
    ],
  },
];

export const Footer = forwardRef<HTMLElement>(function Footer(_, ref) {
  return (
    <Shell ref={ref}>
      <Inner>
        <Grid>
          {groups.map(group => (
            <Group key={group.title} $span={group.span}>
              <Heading>{group.title}</Heading>
              <List>
                {group.links.map(item => (
                  <li key={item.to}>
                    <FooterLink variant="plain" to={item.to}>{item.label}</FooterLink>
                  </li>
                ))}
              </List>
            </Group>
          ))}

          <Group $span={3}>
            <Heading>AniraKids</Heading>
            <List>
              <li>
                <ExternalLink
                  href="https://www.instagram.com/anirakids_cz/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram aria-hidden="true" />
                  Instagram
                </ExternalLink>
              </li>
            </List>
          </Group>

          <Group $span={2}>
            <Heading>Právní</Heading>
            <List>
              <li><FooterLink variant="plain" to={routes.terms}>Obchodní podmínky</FooterLink></li>
              <li><FooterLink variant="plain" to={routes.privacy}>Ochrana osobních údajů</FooterLink></li>
              <li><FooterLink variant="plain" to={routes.cookies}>Cookies</FooterLink></li>
            </List>
          </Group>
        </Grid>

        <BottomDivider />
        <Copyright>© AniraKids</Copyright>
      </Inner>
    </Shell>
  );
});
