import React from 'react';
import styled from 'styled-components';
import Logo from 'public/coloredLogo.svg';
import Green from 'public/circleGreenGradient.svg';
import Purple from 'public/purpleGradient.svg';
import {useTranslation} from 'react-i18next';
import {Layout} from '../../app';

function Hero() {
  const {t} = useTranslation();
  return (
    <Container>
      <Layout>
        <Wrapper>
          <ContentWrapper>
            <Title>{t('explore.hero.title')}</Title>
            <Subtitle>
              {t('explore.hero.subtitle1')} <br /> {t('explore.hero.subtitle2')}
            </Subtitle>
          </ContentWrapper>
          <ImageWrapper>
            <StyledImage src={Logo} />
          </ImageWrapper>
          <GradientContainer>
            <GradientWrapper>
              <GradientGreen src={Green} />
              <GradientPurple src={Purple} />
            </GradientWrapper>
          </GradientContainer>
        </Wrapper>
      </Layout>
    </Container>
  );
}

const Container = styled.div.attrs({
  className: 'bg-primary-400 desktop:h-55 h-56 overflow-hidden',
})``;

const Wrapper = styled.div.attrs({
  className:
    'flex justify-between col-span-full desktop:col-start-2 desktop:col-end-12 relative',
})``;

const ContentWrapper = styled.div.attrs({
  className: 'desktop:space-y-0.75 space-y-1 max-w-lg pt-4.5 desktop:pt-10',
})``;

const Title = styled.h1.attrs({
  className:
    'text-ui-0 font-bold desktop:text-6xl text-3xl desktop:text-left text-center desktop:leading-7.5 leading-4.5',
})`
  font-family: Syne;
`;

const Subtitle = styled.h3.attrs({
  className:
    'text-ui-0 desktop:text-lg text-base font-normal text-center desktop:text-left text-center leading-3 desktop:leading-3.75',
})``;

const ImageWrapper = styled.div.attrs({
  className: 'h-full',
})``;

const StyledImage = styled.img.attrs({
  className: 'w-71 hidden desktop:block',
})``;

const GradientContainer = styled.div.attrs({
  className: 'absolute top-64 desktop:top-20 right-0 w-71',
})``;

const GradientWrapper = styled.div.attrs({
  className: 'relative w-full h-full',
})``;

const GradientGreen = styled.img.attrs({
  className: 'h-40 absolute desktop:-left-14 desktop:-top-20 -top-19 left-14',
})``;

const GradientPurple = styled.img.attrs({
  className:
    'desktop:h-40 h-30 absolute desktop:-right-20 desktop:top-5 -right-5 -top-6',
})``;

export default Hero;
