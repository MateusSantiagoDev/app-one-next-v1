import type { AppProps } from 'next/app'
import Image from 'next/image'

import { globalStyles } from '../styles/global'
import * as S from '../styles/pages/app'

import foguere from '../assets/foguete.png'

globalStyles()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <S.Container>
      <S.Header>
        <Image src={foguere} width={80} height={80} alt='img'/>
      </S.Header>
      <Component {...pageProps} />
    </S.Container>
  )
}
