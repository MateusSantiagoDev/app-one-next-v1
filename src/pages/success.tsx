import Link from 'next/link'
import * as S from '../styles/pages/success'
import { GetServerSideProps } from 'next'
import { stripe } from '../lib/stripe'
import Stripe from 'stripe'
import Image from 'next/image'
import Head from 'next/head'

interface successProps {
  customerName: string
  product: {
    name: string
    imageUrl: string
  }
}

export default function Success({ customerName, product }: successProps) {
  return (
    <>
      <Head>
        <title>compra efetuada | commerce app</title>
        // impede q a pagina seja indexada
        <meta name="robots" content="noindex"></meta>
      </Head>

      <S.Container>
        <h1>Compra efetuada!</h1>

        <S.ImageContainer>
          <Image src={product.imageUrl} width={150} height={100} alt="img" />
        </S.ImageContainer>

        <p>
          Uhuul <strong>{customerName}</strong>, sua{' '}
          <strong>{product.name}</strong> já esta a caminho da sua casa.
        </p>

        <Link href="/">Voltar ao catálogo</Link>
      </S.Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const sessionId = String(query.session_id)

  if (!sessionId) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product'],
  })

  const customerName = session.customer_details?.name
  const product = session.line_items?.data[0].price?.product as Stripe.Product

  return {
    props: {
      customerName,
      product: {
        name: product.name,
        imageUrl: product.images[0],
      },
    },
  }
}
