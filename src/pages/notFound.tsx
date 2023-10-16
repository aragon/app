import React from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ButtonText} from '@aragon/ods-old';

import {Container, GridLayout} from 'components/layout';
import Logo from 'public/logoBlue.svg';
import Logo404 from 'public/illu-custom.svg';
import Green from 'public/circleGreenGradient.svg';
import Purple from 'public/purpleGradient.svg';
import {Landing} from 'utils/paths';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  return (
    <>
      <Container>
        <Menu>
          <GridLayout>
            <img
              className="col-span-2 col-start-2 mx-auto h-4 md:col-start-4 xl:col-start-auto xl:mx-0"
              src={Logo}
            />
          </GridLayout>
        </Menu>
      </Container>

      <div className="overflow-x-hidden xl:overflow-x-visible">
        <GridLayout>
          <Wrapper>
            <div className="mt-3 xl:mt-0 xl:w-1/2">
              <Title>
                {t('cta.404.titleLine1')}
                <br />
                {t('cta.404.titleLine2')}
              </Title>
              <ButtonText
                label={t('cta.404.backToExplore')}
                size="large"
                className="mt-5 hidden xl:block"
                onClick={() => navigate(Landing)}
              />
            </div>

            <div className="relative mt-2 xl:mt-0 xl:w-1/2">
              <GradientGreen src={Green} />
              <GradientPurple src={Purple} />
              <img src={Logo404} className="w-full" />
            </div>
          </Wrapper>
        </GridLayout>

        <GridLayout>
          <div className="col-span-full">
            <ButtonText
              label={t('cta.404.backToExplore')}
              size="large"
              className="mt-14 block w-full xl:mt-0 xl:hidden"
              onClick={() => navigate(Landing)}
            />
          </div>
        </GridLayout>
      </div>
    </>
  );
};

const Menu = styled.nav.attrs({
  className: 'py-2 xl:py-4',
})`
  background: linear-gradient(
    180deg,
    rgba(245, 247, 250, 1) 0%,
    rgba(245, 247, 250, 0) 100%
  );
  backdrop-filter: blur(24px);
`;

const Wrapper = styled.div.attrs({
  className:
    'xl:flex justify-center items-end xl:justify-between col-span-full xl:col-start-2 xl:col-end-12 relative',
})``;

const Title = styled.h1.attrs({
  className: 'font-bold text-primary-500 text-center xl:text-left',
})`
  font-family: Syne;
  line-height: 120%;
  font-size: 34px;

  @media (min-width: 1024px) {
    font-size: 61px;
  }
`;

const GradientGreen = styled.img.attrs({
  className: 'h-25 xl:h-40 absolute -left-10 xl:-left-14 top-8',
})``;

const GradientPurple = styled.img.attrs({
  className: 'h-25 xl:h-40 absolute -bottom-8 -right-12',
})``;
