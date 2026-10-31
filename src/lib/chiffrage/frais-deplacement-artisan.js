/** Distance incluse par trajet aller depuis l’adresse de l’artisan. */
export const ZONE_INCLUSE_ARTISAN_KM = 30;
export const TARIF_DEPASSEMENT_ARTISAN_HT_PAR_KM = 2;

/**
 * @param {number | null | undefined} distanceAllerKm
 * @param {number | null | undefined} joursDePose
 * @returns {{ distanceHorsZoneKm: number, trajetsAR: number, fraisDeplacementHt: number } | null}
 */
export function calculerFraisDeplacementArtisanHt(distanceAllerKm, joursDePose) {
  if (distanceAllerKm == null || !Number.isFinite(distanceAllerKm) || distanceAllerKm < 0) {
    return null;
  }
  const jours = Math.max(0, Number(joursDePose) || 1);
  const trajetsAR = 1 + jours;
  const distanceHorsZoneKm = Math.max(0, distanceAllerKm - ZONE_INCLUSE_ARTISAN_KM);
  const fraisDeplacementHt = Math.round(
    (distanceHorsZoneKm * 2 * TARIF_DEPASSEMENT_ARTISAN_HT_PAR_KM * trajetsAR + Number.EPSILON) * 100,
  ) / 100;
  return { distanceHorsZoneKm, trajetsAR, fraisDeplacementHt };
}
