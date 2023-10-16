import {IconInfo} from '@aragon/ods-old';
import React from 'react';
import styled from 'styled-components';

import {GridLayout} from 'components/layout';
import {StyledLink} from 'components/styledLink';
import useScreen from 'hooks/useScreen';
import Green from 'public/greenGradient.svg';
import IconLogo from 'public/iconLogo.svg';
import Purple from 'public/purpleGradient.svg';
import {EXPLORE_NAV_LINKS, PRIVACY_NAV_LINKS} from 'utils/constants';

const Footer: React.FC = () => {
  const {isDesktop} = useScreen();

  const ExploreNavLinks = EXPLORE_NAV_LINKS.map(item => (
    <li key={item.label}>
      <StyledLink href={item.path} label={item.label} />
    </li>
  ));

  const PrivacyNavLinks = PRIVACY_NAV_LINKS.map(item => (
    <li key={item.label}>
      <StyledLink label={item.label} href={item.path} />
    </li>
  ));

  return (
    <Section data-testid="footer">
      <GridLayout>
        <FullSpan>
          <div className="relative">
            <GradientGreen src={Green} />
            <GradientPurple src={Purple} />
          </div>
          <ActionContainer>
            {isDesktop ? (
              <>
                <FlexDiv>
                  <LogoContainer src={IconLogo} />
                  <StyledNavList>{ExploreNavLinks}</StyledNavList>
                </FlexDiv>
                <FlexDiv>
                  <StyledNavList>{PrivacyNavLinks}</StyledNavList>
                  <Copyright>
                    &copy;{`  ${new Date().getFullYear()}  `}Aragon
                  </Copyright>
                </FlexDiv>
              </>
            ) : (
              <>
                <LogoContainer src={IconLogo} />
                <StyledNavList>{ExploreNavLinks}</StyledNavList>
                <StyledNavList>{PrivacyNavLinks}</StyledNavList>
                <Copyright>
                  &copy;{`  ${new Date().getFullYear()}  `}Aragon
                </Copyright>
              </>
            )}
          </ActionContainer>
        </FullSpan>
      </GridLayout>
      <div className="z-10 flex items-center justify-center space-x-1 bg-primary-400 py-0.5 text-sm text-neutral-0">
        <IconInfo />
        <span>Aragon App Public Beta</span>
      </div>
    </Section>
  );
};

const FullSpan = styled.div.attrs({
  className: 'col-span-full',
})`
  overflow-y: clip;
`;

const Section = styled.section.attrs({
  className: 'w-full bg-primary-400 overflow-hidden',
})``;

const ActionContainer = styled.div.attrs({
  className:
    'relative flex flex-col xl:flex-row xl:justify-between items-center space-y-4 xl:space-y-0 pt-5 xl:pt-3 pb-8 xl:pb-3',
})``;

const FlexDiv = styled.div.attrs({
  className: 'flex space-x-4 items-center',
})``;

const LogoContainer = styled.img.attrs({
  className: 'h-5',
})``;

const StyledNavList = styled.ul.attrs({
  className: 'flex space-x-4',
})``;

const Copyright = styled.span.attrs({
  className: 'text-neutral-0 font-normal',
})``;

const GradientGreen = styled.img.attrs({
  className: 'h-[400px] absolute -top-32 -left-32',
})``;

const GradientPurple = styled.img.attrs({
  className: 'xl:h-80 h-60 absolute -right-5 xl:-top-[88px] top-32',
})``;

export default Footer;
