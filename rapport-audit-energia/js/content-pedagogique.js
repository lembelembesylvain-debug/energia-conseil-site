/**
 * Contenus pédagogiques généraux ENERGIA CONSEIL IA®
 * Aucun montant d'aide officiel inventé — textes explicatifs uniquement.
 * Enrichissables lorsque les articles DOCX sources (01–09) seront fournis.
 */
export const PEDAGO = {
  audit_intro: `
    <p>Un audit énergétique vise à comprendre comment un logement consomme, où se situent les déperditions et quels travaux permettent d’atteindre un objectif de performance réaliste. Le présent rapport accompagne le client dans cette lecture ; il <strong>ne remplace pas</strong> un audit réglementaire ni l’accompagnement d’un MAR (Mon Accompagnateur Rénov’).</p>
    <p>La rénovation d’ampleur s’appuie en général sur une vision d’ensemble : enveloppe (toiture, murs, planchers, menuiseries), ventilation, puis systèmes (chauffage, eau chaude), éventuellement production d’électricité. L’ordre des travaux conditionne la performance finale et le dimensionnement des équipements.</p>
  `,
  isolation: `
    <h3>Isolation thermique — principes</h3>
    <p>La toiture concentre souvent une part importante des déperditions. Isoler les rampants ou réaliser une isolation par l’extérieur de type SARKING permet de réduire les besoins de chauffage avant d’installer une pompe à chaleur. Les performances annoncées (résistance R, épaisseur, matériau) doivent être confirmées par fiches techniques et contrôle de pose.</p>
    <p>Sur un bâti ancien en pierre, la gestion de l’humidité et la respiration des parois sont des points de vigilance : les solutions doivent être adaptées au support. Toute performance chiffrée absente du dossier apparaît comme « À confirmer / sous réserve de validation ».</p>
  `,
  ite_iti: `
    <h3>ITE et ITI — repères</h3>
    <p><strong>ITE</strong> (isolation thermique par l’extérieur) traite la façade côté dehors et limite certains ponts thermiques. <strong>ITI</strong> (par l’intérieur) est parfois plus simple à mettre en œuvre mais réduit le volume habitable et demande une attention particulière à l’étanchéité à l’air et à l’humidité.</p>
    <p>Dans le présent dossier, si les murs ou planchers ne figurent pas au programme retenu, ils restent des postes potentiels pour une phase ultérieure — hors devis actuel sauf avenant.</p>
  `,
  pac: `
    <h3>Pompe à chaleur — repères</h3>
    <p>Une PAC air/air multisplit chauffe (et souvent rafraîchit) pièce par pièce. Elle doit être dimensionnée <strong>après</strong> l’amélioration de l’enveloppe : isoler d’abord évite le surdimensionnement et les surcoûts. Les COP et classes énergétiques cités sont des annonces fabricant ; la performance réelle dépend de la pose, des réglages et de l’usage.</p>
    <p>La mise en service, les notices et les essais de fonctionnement font partie des contrôles de réception.</p>
  `,
  cet: `
    <h3>Chauffe-eau thermodynamique</h3>
    <p>Le ballon thermodynamique produit l’eau chaude en récupérant les calories de l’air. Il remplace souvent un ballon électrique classique et contribue à baisser la facture d’ECS. Capacité, COP annoncé et emplacement technique doivent être validés sur site.</p>
  `,
  menuiseries: `
    <h3>Menuiseries</h3>
    <p>Le remplacement des fenêtres et portes améliore le confort près des baies, limite les infiltrations d’air et complète l’enveloppe. Les coefficients Uw / Ud retenus doivent figurer sur les fiches produits. La qualité de pose (étanchéité périphérique, réglages) est aussi importante que le produit.</p>
  `,
  couverture_zinguerie: `
    <h3>Couverture et zinguerie</h3>
    <p>Lorsque l’isolation de toiture s’accompagne d’un détuilage / retuilage, la couverture et la zinguerie sécurisent l’étanchéité et l’évacuation des eaux pluviales. Ces lots protègent durablement l’investissement isolation.</p>
  `,
  photovoltaique: `
    <h3>Photovoltaïque</h3>
    <p>Le photovoltaïque intervient en général <strong>en dernier</strong>, une fois les besoins réduits. Production, orientation, ombrages et mode d’autoconsommation nécessitent une étude technique dédiée. S’il n’est pas inclus au devis, toute option PV reste hors périmètre tant qu’elle n’est pas chiffrée et acceptée.</p>
  `,
  renovation_globale: `
    <h3>Rénovation globale / d’ampleur</h3>
    <p>Une rénovation d’ampleur vise un gain significatif de performance (souvent plusieurs classes DPE) via un bouquet de travaux cohérent. Elle s’articule avec un parcours d’accompagnement (MAR) et des dispositifs d’aides conditionnés à des règles d’éligibilité. Le rapport ENERGIA présente le scénario retenu ; la conformité réglementaire des aides relève des organismes instructeurs.</p>
  `,
  aides: `
    <h3>Aides financières — lecture pédagogique</h3>
    <p><strong>MaPrimeRénov'</strong> : aide publique conditionnée aux revenus, au type de parcours, au gain de performance et aux entreprises RGE. Montants définitifs après instruction ANAH.</p>
    <p><strong>CEE</strong> : certificats d’économies d’énergie via les obligés ; montants variables selon fiches et acteurs.</p>
    <p><strong>Éco-PTZ</strong> : prêt à taux zéro sous conditions (résidence principale, etc.) — montage bancaire possible via courtier.</p>
    <p><strong>Aides locales</strong> : variables selon collectivités.</p>
    <div class="encadre encadre-orange">
      <p><strong>Rappel obligatoire :</strong> les aides sont présentées à titre indicatif. Elles ne sont pas déduites du devis sauf mention contractuelle explicite. Elles sont versées au client selon les conditions des organismes compétents. Aucun chiffre officiel n’est affiché sans donnée validée dans le fichier client.</p>
    </div>
  `,
  coordination: `
    <h3>Coordination générale et réception</h3>
    <p>La coordination assure la sélection et le suivi des sous-traitants, le respect de l’ordre des lots, le planning et la réception. Les échéances de mi-chantier et de réception sont liées à une validation écrite du coordinateur. La réception formalise l’état des ouvrages et les éventuelles réserves.</p>
  `,
  glossaire: [
    { t: "DPE", d: "Diagnostic de Performance Énergétique — classes A à G." },
    { t: "kWhEP/m².an", d: "Consommation d’énergie primaire par m² et par an." },
    { t: "R (m².K/W)", d: "Résistance thermique d’un isolant — plus R est élevé, meilleure est l’isolation." },
    { t: "Uw / Ud", d: "Coefficients de transmission thermique des fenêtres / portes." },
    { t: "PAC", d: "Pompe à chaleur." },
    { t: "CET", d: "Chauffe-eau thermodynamique." },
    { t: "RGE", d: "Reconnu Garant de l’Environnement — qualification entreprise." },
    { t: "MAR", d: "Mon Accompagnateur Rénov’ — accompagnement du parcours aides." },
    { t: "ANAH", d: "Agence nationale de l’habitat — instruction MaPrimeRénov’." },
    { t: "CEE", d: "Certificats d’Économies d’Énergie." },
    { t: "Éco-PTZ", d: "Éco-prêt à taux zéro." },
    { t: "SARKING", d: "Isolation de toiture par l’extérieur, au-dessus des chevrons." },
    { t: "ITE / ITI", d: "Isolation thermique par l’extérieur / par l’intérieur." },
    { t: "PV", d: "Photovoltaïque." },
    { t: "TTC / HT", d: "Toutes taxes comprises / Hors taxes." },
  ],
  faq: [
    {
      q: "Ce rapport remplace-t-il un audit réglementaire ?",
      a: "Non. Il s’agit d’un document d’accompagnement pédagogique et commercial. L’audit réglementaire et le MAR restent distincts.",
    },
    {
      q: "Les aides affichées sont-elles garanties ?",
      a: "Non. Toute aide est indicative et conditionnée à l’instruction des organismes compétents.",
    },
    {
      q: "Pourquoi les aides ne sont-elles pas déduites du devis ?",
      a: "Sauf mention contractuelle explicite, le devis porte sur le prix des travaux. Les aides sont versées au client selon les règles applicables.",
    },
    {
      q: "Pourquoi isoler avant d’installer la PAC ?",
      a: "Pour dimensionner correctement le système et éviter surcoûts et inefficacité.",
    },
    {
      q: "Que signifie le statut EN COURS de l’acompte ?",
      a: "L’acompte est en cours de traitement. Il ne doit pas être présenté comme payé ou encaissé tant que le statut n’est pas mis à jour dans les données.",
    },
    {
      q: "La prestation MAR est-elle dans le devis ENERGIA ?",
      a: "Non dans le modèle retenu : la prestation MAR est séparée, non comprise dans le devis principal.",
    },
    {
      q: "Que faire si une donnée manque ?",
      a: "Le rapport affiche « À confirmer / sous réserve de validation ». Complétez le JSON client puis régénérez.",
    },
    {
      q: "Comment exporter en PDF ?",
      a: "Utilisez le bouton Imprimer / Exporter PDF puis choisissez « Enregistrer au format PDF » dans la boîte de dialogue d’impression.",
    },
  ],
};
