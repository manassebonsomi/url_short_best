/**
 * generateSlug.ts
 *
 * Fonctions utilitaires pour générer des slugs courts.
 * Ce fichier exporte une fonction par défaut `generateSlug(length)` simple
 * et documente d'autres approches (hash tronqué, timestamp+random).
 */

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Génère un slug aléatoire en base62.
 * - length : longueur souhaitée (par défaut 6)
 * - Utilisation recommandée pour l'Exercie : `generateSlug(6)` -> 'a1B2c3'
 */
export default function generateSlug(length = 6): string {
  let result = ''
  const charsLen = BASE62.length
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * charsLen)
    result += BASE62[idx]
  }
  return result
}

/**
 * Autres stratégies (expliquées, non exportées) :
 * - hash tronqué : créer un hash (sha256/md5) de l'URL et tronquer les premiers N caractères.
 * - timestamp + random : `${Date.now().toString(36)}${randomPart}` donne des slugs avec un ordre temporel.
 * Choix pédagogique : base62 aléatoire est simple et compréhensible pour débutants.
 */
