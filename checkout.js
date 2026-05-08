const FedaPay = require('fedapay');

// ⚠️ Remplacer par votre vraie clé secrète FedaPay
// Disponible sur : https://app.fedapay.com/settings/api-keys
FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);

// 'sandbox' pour les tests, 'live' pour la production
FedaPay.setEnvironment(process.env.FEDAPAY_ENV || 'sandbox');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { amount, description, items } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Montant invalide' });
  }

  try {
    // Créer la transaction FedaPay
    const transaction = await FedaPay.Transaction.create({
      description: description || 'Commande BLOCK REPUBLIC 13',
      amount: Math.round(amount * 655.957), // Convertir EUR → XOF (FCFA)
      currency: { iso: 'XOF' },
      callback_url: `${req.headers.origin}/success.html`,
      custom_metadata: JSON.stringify({
        brand: 'BLOCK REPUBLIC 13',
        items: items
      })
    });

    // Générer le token de paiement
    const token = await transaction.generateToken();

    // Retourner l'URL de paiement FedaPay
    res.status(200).json({ url: token.url });

  } catch (err) {
    console.error('FedaPay error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
