import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'

import Head from 'next/head'
import { GetStaticProps } from 'next'

import { stripe } from '../lib/stripe'

import Image from 'next/image'
import Link from 'next/link'

import * as S from '../styles/pages/home'
import Stripe from 'stripe'

interface HomeProps {
  products: {
    id: string
    name: string
    imageUrl: string
    price: string
  }[]
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 30,
    },
  })
  return (
    <>
      <Head>
        <title>Home | commerce app</title>
      </Head>

      <S.Container ref={sliderRef} className="keen-slider">
        {products.map((product, index) => (
          <Link href={`/products/${product.id}`} prefetch={false} key={index}>
            <S.Product className="keen-slider__slide">
              <Image src={product.imageUrl} width={420} height={280} alt="" />
              <footer>
                <strong>{product.name}</strong>
                <span>{product.price}</span>
              </footer>
            </S.Product>
          </Link>
        ))}
      </S.Container>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price'],
  })

  const products = response.data.map((product) => {
    const price = product.default_price as Stripe.Price
    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price.unit_amount ? price.unit_amount / 100 : 0),
    }
  })

  return {
    props: {
      products,
    },
    revalidate: 60 * 60 * 2, // a cada 2 horas que a pagina for acessada o next cria uma nova versão estatica
  }
}
