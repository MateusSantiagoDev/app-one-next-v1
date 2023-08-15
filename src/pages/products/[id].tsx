import { useState } from 'react'

import Image from 'next/image'
import { GetStaticPaths, GetStaticProps } from 'next'

import { stripe } from '@/src/lib/stripe'
import Stripe from 'stripe'

import * as S from '../../styles/pages/product'
import { useRouter } from 'next/router'
import axios from 'axios'
import Head from 'next/head'

interface ProductProps {
  product: {
    id: string
    name: string
    imageUrl: string
    price: string
    description: string
    defaultPriceId: string
  }
}

export default function Product({ product }: ProductProps) {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] =
    useState(false)
  const { isFallback } = useRouter()

  if (isFallback) {
    return <p>Loading...</p>
  }

  async function handleByProduct() {
    try {
      setIsCreatingCheckoutSession(true)
      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId,
      })
      const { checkoutUrl } = response.data

      // como vou acessar uma rota externa (stripe) então usso dessa forma
      window.location.href = checkoutUrl

      /*
      // exemplo se fosse direcionar para uma rota interna
      const router = userRouter()
      router.push('/checkout)
      */
    } catch (err) {
      setIsCreatingCheckoutSession(false)
      // conectar com alguma ferramenta de observabilidade (datadog / sentry)
      alert('Falha ao redirecionar ao checkout!')
    }
  }

  return (
    <>
      <Head>
        <title>{product.name} | commerce app</title>
      </Head>

      <S.Container>
        <S.ImageContainer>
          <Image src={product.imageUrl} width={420} height={280} alt="" />
        </S.ImageContainer>
        <S.ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>{product.description}</p>

          <button
            disabled={isCreatingCheckoutSession}
            onClick={handleByProduct}
          >
            Comprar Agora
          </button>
        </S.ProductDetails>
      </S.Container>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { id: 'prod_OQsbwoDjQtYpEQ' } }],
    fallback: true,
  }
}

// GetStaticProps<any, { id: string }: estou dizendo q a função retorna
// qualquer dado e que o id que recebe por parâmetro é string
export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params,
}) => {
  const productId = params ? params.id : ''

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'], // sem o data pois não é uma lista de preços
  })

  const price = product.default_price as Stripe.Price
  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price.unit_amount ? price.unit_amount / 100 : 0),
        description: product.description,
        defaultPriceId: price.id,
      },
    },
    revalidate: 60 * 60 * 1, // cache salvo a cada 1 hora
  }
}
