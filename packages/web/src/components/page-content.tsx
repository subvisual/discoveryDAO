/**
 * Module dependencies.
 */

import { media } from 'src/styles/breakpoints';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

/**
 * `Props` type.
 */

type Props = {
  children: JSX.Element;
  className?: string;
  id?: string;
};

/**
 * `Wrapper` styled component.
 */

const Wrapper = styled.div`
  min-height: 100vh;
  position: relative;
`;

/**
 * `Content` styled component.
 */

const Content = styled.div`
  margin: 0 auto;

  ${media.min.ms`
    max-width: 88%;
  `}
`;

/**
 * `ImageWrapper` styled component.
 */

const ImageWrapper = styled.div`
  position: absolute;
  inset: 0;

  &::after {
    background-color: var(--color-blue600);
    content: '';
    inset: 0;
    mix-blend-mode: multiply;
    position: absolute;
  }
`;

/**
 * Export `PageContent` component.
 */

export function PageContent({ children, ...rest }: Props) {
  return (
    <Wrapper {...rest}>
      <ImageWrapper>
        <Image
          aria-hidden
          layout={'fill'}
          objectFit={'cover'}
          quality={100}
          src={'/images/shapes.jpg'}
        />
      </ImageWrapper>

      <Content>{children}</Content>
    </Wrapper>
  );
}
