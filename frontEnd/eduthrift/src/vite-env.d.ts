/// <reference types="vite/client" />

declare module 'swiper/react' {
  import { FunctionComponent, ReactNode } from 'react';
  import { SwiperOptions } from 'swiper/types';
  
  export interface SwiperProps extends SwiperOptions {
    children?: ReactNode;
    [key: string]: any;
  }
  
  export interface SwiperSlideProps {
    children?: ReactNode;
    [key: string]: any;
  }

  export const Swiper: FunctionComponent<SwiperProps>;
  export const SwiperSlide: FunctionComponent<SwiperSlideProps>;
}
