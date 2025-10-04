const Stripe = require('stripe')
const stripe = Stripe(process.env.STRIPE_SECRET_KEY) //test jenkins2

async function paymentProcessor(length, premiumType, paymentId, returnUrl) {
  const plansAmount = {
    'Yourself-only': 1599,
    'Family-set': 3899,
    'Two-people': 2499,
    'Student-plan': 999
  }
  const amount = plansAmount[premiumType] * length
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,            
      currency: 'usd',           
      payment_method: paymentId, 
      confirm: true,
      return_url: returnUrl
    })
    return paymentIntent
  }
  catch(err) {console.log('premium payment process error:', err)}
}

module.exports = {
  paymentProcessor
}