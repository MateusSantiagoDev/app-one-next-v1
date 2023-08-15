import Stripe from 'stripe'

const stripe_secret_key = process.env.STRIPE_SECRET_KEY

if (!stripe_secret_key) {
  throw new Error('Stripe secret key not found')
}

export const stripe = new Stripe(stripe_secret_key, {
  apiVersion: '2022-11-15',
  appInfo: {
    name: 'shop',
  },
})
