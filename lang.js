// ─────────────────────────────────────────────
//  lang.js — Luminous multilingual system
//  Covers: index, login, dashboard, admin, blog
//  Languages: EN · FR · ES · ZH
// ─────────────────────────────────────────────

const LANG = {

// ══════════════════════════════════════════════
//  ENGLISH
// ══════════════════════════════════════════════
en: {
  // NAV
  'nav.back':            'Back to site',
  'nav.logout':          'Logout',
  'nav.get.started':     'Get Started',

  // LOGIN PAGE
  'login.eyebrow':            'Get started',
  'login.title':              'Create your account',
  'login.sub':                'Register to access your client dashboard and proceed with your Hong Kong company.',
  'login.tab.register':       'Create account',
  'login.tab.login':          'Sign in',
  'login.fname':              'First name',
  'login.lname':              'Last name',
  'login.email':              'Email address',
  'login.whatsapp':           'WhatsApp number',
  'login.whatsapp.hint':      "We'll contact you on WhatsApp to follow up on your file",
  'login.password':           'Password',
  'login.password.hint':      'Min. 8 characters',
  'login.btn.register':       'Create my account →',
  'login.btn.login':          'Sign in →',
  'login.err.name':           'Please enter your first and last name.',
  'login.err.email':          'Please enter a valid email address.',
  'login.err.whatsapp':       'Please enter your WhatsApp number.',
  'login.err.password':       'Password must be at least 8 characters.',
  'login.err.fields':         'Please fill in all fields.',
  'login.err.invalid':        'Invalid email or password.',

  // DASHBOARD — NAV / SIDEBAR
  'dash.my.file':         'My file',
  'dash.progress':        'Progress',
  'dash.upload':          'Upload files',
  'dash.documents':       'Documents',
  'dash.affiliate':       'Affiliate',
  'dash.main.site':       'Main site',

  // DASHBOARD — PROGRESS PANEL
  'dash.progress.title':      'Company Formation Progress',
  'dash.no.order':            'No active order yet.',
  'dash.order.now':           'Order now →',
  'dash.payment.ready':       'Ready to proceed',
  'dash.payment.choose':      'Choose your service',
  'dash.payment.sub':         'Secure payment via Stripe',
  'dash.create.btn':          'Create my company — $1,490 →',
  'dash.renew.btn':           'Annual renewal — $990 →',
  'dash.payment.confirmed':   'Payment confirmed',
  'dash.processing':          'Your file is being processed.',

  // DASHBOARD — STEPS
  'step.pending':             'Awaiting order',
  'step.pending.desc':        'Place your order to start your file.',
  'step.payment':             'Payment confirmed',
  'step.payment.desc':        'Payment received — we have started your file.',
  'step.docs':                'Documents verified',
  'step.docs.desc':           'Your documents have been verified by our team.',
  'step.filing':              'Filing in progress',
  'step.filing.desc':         'Your application is submitted to the Hong Kong authorities.',
  'step.certificate':         'Certificate issued',
  'step.certificate.desc':    'Your Certificate of Incorporation has been issued.',
  'step.completed':           'Completed',
  'step.completed.desc':      'Your company is fully operational.',
  'step.done':                'Done',
  'step.inprogress':          'In progress',
  'step.waiting':             'Pending',

  // DASHBOARD — COMPANY DETAILS
  'dash.company.name.label':  'Company name',
  'dash.jurisdiction':        'Jurisdiction',
  'dash.type':                'Type',
  'dash.account.created':     'Account created',

  // DASHBOARD — UPLOAD PANEL
  'dash.docs.required':       'Required documents',
  'dash.docs.prompt':         'Please upload your documents to proceed.',
  'dash.doc.passport':        'Passport photo',
  'dash.doc.passport.sub':    'Full passport visible — no cropping',
  'dash.doc.selfie':          'Selfie holding passport',
  'dash.doc.selfie.sub':      'Face clearly visible, passport open',
  'dash.doc.address':         'Proof of address',
  'dash.doc.address.sub':     'Utility bill, bank statement, national ID...',
  'dash.upload.btn':          'Upload →',
  'dash.upload.done':         'Received ✓',
  'dash.name1':               'Company name option 1',
  'dash.name2':               'Company name option 2',
  'dash.name3':               'Company name option 3',
  'dash.activity':            'Business activity',
  'dash.activity.ph':         'Describe your main business activity',
  'dash.submit.btn':          'Submit my file →',
  'dash.submit.success':      '✓ Your file has been submitted. Our team will review it within 24 hours.',

  // DASHBOARD — DOCUMENTS PANEL
  'dash.docs.title':          'Official Company Documents',
  'dash.docs.sub':            'Your documents — available as your file progresses. Click to download.',
  'dash.bank.title':          'Open your Airwallex account',
  'dash.bank.sub':            'Airwallex is our recommended banking partner.',
  'dash.bank.btn':            'Create account →',
  'dash.bank.hint':           'You can open your Airwallex account as soon as your Certificate of Incorporation is issued.',

  // DASHBOARD — AFFILIATE PANEL
  'dash.aff.title':           'My Referral Link',
  'dash.aff.sub':             'Share your unique link — earn $150 to $250 per confirmed referral',
  'dash.aff.clicks':          'Link clicks',
  'dash.aff.conv':            'Conversions',
  'dash.aff.earned':          'Total earned',
  'dash.aff.pending':         'Pending payout',
  'dash.aff.link.label':      'Your unique referral link',
  'dash.aff.copy':            'Copy',
  'dash.aff.copied':          'Copied ✓',
  'dash.aff.commission':      'Commission structure',
  'dash.aff.tier1':           '1–3 / month',
  'dash.aff.tier2':           '4–9 / month',
  'dash.aff.tier3':           '10+ / month',
  'dash.aff.renewal.note':    '+ $80 per annual renewal referred · Monthly payments by wire or crypto',
  'dash.aff.my.referrals':    'My referrals',
  'dash.aff.email.col':       'Email',
  'dash.aff.date.col':        'Date',
  'dash.aff.status.col':      'Status',
  'dash.aff.commission.col':  'Commission',
  'dash.aff.no.referrals':    'No referrals yet — share your link to start earning',


  // DASHBOARD — extra keys
  'dash.company.details':     'Company details',
  'dash.submit.docs':         'Now submit your documents',
  'dash.submit.docs.sub':     'Upload your passport, selfie and proof of address to proceed',
  'dash.submit.docs.btn':     'Submit documents →',
  'dash.upload.title':        'Submit your documents',
  'dash.upload.sub':          'We need the following information to start your incorporation.',
  'dash.names.title':         'Desired company names',
  'dash.names.sub':           'Provide 3 options in order of preference',
  'dash.name1':               '1st choice',
  'dash.name2':               '2nd choice',
  'dash.name3':               '3rd choice',
  'dash.name1.ph':            'e.g. Acme International Ltd.',
  'dash.name2.ph':            'e.g. Acme Global Ltd.',
  'dash.name3.ph':            'e.g. Acme Holdings Ltd.',
  'dash.names.hint':          'If your first choice is already taken, we will automatically try the next one. All names must end in Limited or Ltd.',
  'dash.activity.title':      'Business activity',
  'dash.activity.sub':        'Describe what your company will do',
  'dash.activity.ph':         'e.g. International trade, consulting...',
  'dash.bank.label':          'Bank account',
  'dash.bank.feat1':          'Account in 5 minutes',
  'dash.bank.feat2':          'Multi-currency',
  'dash.bank.feat3':          'Stripe & processors',
  'dash.bank.feat4':          '100% remote',

  // BLOG
  'blog.eyebrow':             'Guides & Analysis',
  'blog.title':               'The blog for international entrepreneurs',
  'blog.sub':                 'Practical guides, tax analysis and expert advice to structure your international business from Hong Kong.',
  'blog.read':                'Read article →',
  'blog.footer.copy':         '© 2025 Luminous · Hong Kong Corporate Services',
},

// ══════════════════════════════════════════════
//  FRANÇAIS
// ══════════════════════════════════════════════
fr: {
  // NAV
  'nav.back':            'Retour au site',
  'nav.logout':          'Déconnexion',
  'nav.get.started':     'Commencer',

  // LOGIN
  'login.eyebrow':            'Commencer',
  'login.title':              'Créer votre compte',
  'login.sub':                'Inscrivez-vous pour accéder à votre espace client et procéder à la création de votre société.',
  'login.tab.register':       'Créer un compte',
  'login.tab.login':          'Déjà inscrit',
  'login.fname':              'Prénom',
  'login.lname':              'Nom',
  'login.email':              'Adresse e-mail',
  'login.whatsapp':           'Numéro WhatsApp',
  'login.whatsapp.hint':      'Nous vous contacterons sur WhatsApp pour le suivi de votre dossier',
  'login.password':           'Mot de passe',
  'login.password.hint':      'Min. 8 caractères',
  'login.btn.register':       'Créer mon compte →',
  'login.btn.login':          'Se connecter →',
  'login.err.name':           'Veuillez entrer votre prénom et nom.',
  'login.err.email':          'Veuillez entrer une adresse e-mail valide.',
  'login.err.whatsapp':       'Veuillez entrer votre numéro WhatsApp.',
  'login.err.password':       'Le mot de passe doit contenir au moins 8 caractères.',
  'login.err.fields':         'Veuillez remplir tous les champs.',
  'login.err.invalid':        'E-mail ou mot de passe incorrect.',

  // DASHBOARD — SIDEBAR
  'dash.my.file':         'Mon dossier',
  'dash.progress':        'Progression',
  'dash.upload':          'Envoyer des fichiers',
  'dash.documents':       'Documents',
  'dash.affiliate':       'Affiliation',
  'dash.main.site':       'Site principal',

  // DASHBOARD — PROGRESS
  'dash.progress.title':      'Avancement de la création',
  'dash.no.order':            'Aucune commande en cours.',
  'dash.order.now':           'Commander →',
  'dash.payment.ready':       'Prêt à procéder',
  'dash.payment.choose':      'Choisissez votre service',
  'dash.payment.sub':         'Paiement sécurisé via Stripe',
  'dash.create.btn':          'Créer ma société — 1 490 $ →',
  'dash.renew.btn':           'Renouvellement annuel — 990 $ →',
  'dash.payment.confirmed':   'Paiement confirmé',
  'dash.processing':          'Votre dossier est en cours de traitement.',

  // STEPS
  'step.pending':             'En attente de commande',
  'step.pending.desc':        'Passez commande pour démarrer votre dossier.',
  'step.payment':             'Paiement confirmé',
  'step.payment.desc':        'Paiement reçu — nous avons ouvert votre dossier.',
  'step.docs':                'Documents vérifiés',
  'step.docs.desc':           'Vos documents ont été vérifiés par notre équipe.',
  'step.filing':              'Dépôt en cours',
  'step.filing.desc':         'Votre demande est soumise aux autorités de Hong Kong.',
  'step.certificate':         'Certificat délivré',
  'step.certificate.desc':    "Votre certificat d'immatriculation a été délivré.",
  'step.completed':           'Terminé',
  'step.completed.desc':      'Votre société est pleinement opérationnelle.',
  'step.done':                'Fait',
  'step.inprogress':          'En cours',
  'step.waiting':             'En attente',

  // COMPANY DETAILS
  'dash.company.name.label':  'Nom de la société',
  'dash.jurisdiction':        'Juridiction',
  'dash.type':                'Type',
  'dash.account.created':     'Compte créé le',

  // UPLOAD
  'dash.docs.required':       'Documents requis',
  'dash.docs.prompt':         'Veuillez envoyer vos documents pour poursuivre.',
  'dash.doc.passport':        'Passeport',
  'dash.doc.passport.sub':    'Passeport entier visible — sans découpe',
  'dash.doc.selfie':          'Selfie avec passeport',
  'dash.doc.selfie.sub':      'Visage clairement visible, passeport ouvert',
  'dash.doc.address':         'Justificatif de domicile',
  'dash.doc.address.sub':     'Facture, relevé bancaire, pièce identité nationale...',
  'dash.upload.btn':          'Envoyer →',
  'dash.upload.done':         'Reçu ✓',
  'dash.name1':               'Nom de société option 1',
  'dash.name2':               'Nom de société option 2',
  'dash.name3':               'Nom de société option 3',
  'dash.activity':            'Activité commerciale',
  'dash.activity.ph':         'Décrivez votre activité principale',
  'dash.submit.btn':          'Soumettre mon dossier →',
  'dash.submit.success':      '✓ Votre dossier a été soumis. Notre équipe le traitera dans les 24 heures.',

  // DOCUMENTS
  'dash.docs.title':          'Documents officiels de la société',
  'dash.docs.sub':            'Vos documents — disponibles au fur et à mesure. Cliquez pour télécharger.',
  'dash.bank.title':          'Ouvrir votre compte Airwallex',
  'dash.bank.sub':            'Airwallex est notre partenaire bancaire recommandé.',
  'dash.bank.btn':            'Créer un compte →',
  'dash.bank.hint':           "Vous pouvez ouvrir votre compte Airwallex dès que votre certificat d'immatriculation est délivré.",

  // AFFILIATE
  'dash.aff.title':           'Mon lien de parrainage',
  'dash.aff.sub':             'Partagez votre lien — gagnez 150 $ à 250 $ par parrainage confirmé',
  'dash.aff.clicks':          'Clics sur le lien',
  'dash.aff.conv':            'Conversions',
  'dash.aff.earned':          'Total gagné',
  'dash.aff.pending':         'En attente de versement',
  'dash.aff.link.label':      'Votre lien de parrainage unique',
  'dash.aff.copy':            'Copier',
  'dash.aff.copied':          'Copié ✓',
  'dash.aff.commission':      'Structure des commissions',
  'dash.aff.tier1':           '1–3 / mois',
  'dash.aff.tier2':           '4–9 / mois',
  'dash.aff.tier3':           '10+ / mois',
  'dash.aff.renewal.note':    '+ 80 $ par renouvellement annuel parrainé · Paiements mensuels par virement ou crypto',
  'dash.aff.my.referrals':    'Mes parrainages',
  'dash.aff.email.col':       'E-mail',
  'dash.aff.date.col':        'Date',
  'dash.aff.status.col':      'Statut',
  'dash.aff.commission.col':  'Commission',
  'dash.aff.no.referrals':    'Aucun parrainage pour l\'instant — partagez votre lien pour commencer',


  // DASHBOARD — extra keys
  'dash.company.details':     'Détails de la société',
  'dash.submit.docs':         'Soumettez maintenant vos documents',
  'dash.submit.docs.sub':     'Envoyez votre passeport, selfie et justificatif de domicile pour continuer',
  'dash.submit.docs.btn':     'Envoyer les documents →',
  'dash.upload.title':        'Soumettre vos documents',
  'dash.upload.sub':          'Nous avons besoin des informations suivantes pour démarrer votre immatriculation.',
  'dash.names.title':         'Noms de société souhaités',
  'dash.names.sub':           'Proposez 3 options par ordre de préférence',
  'dash.name1':               '1er choix',
  'dash.name2':               '2ème choix',
  'dash.name3':               '3ème choix',
  'dash.name1.ph':            'Ex. Acme International Ltd.',
  'dash.name2.ph':            'Ex. Acme Global Ltd.',
  'dash.name3.ph':            'Ex. Acme Holdings Ltd.',
  'dash.names.hint':          'Si votre premier choix est pris, nous essaierons automatiquement le suivant. Tous les noms doivent se terminer par Limited ou Ltd.',
  'dash.activity.title':      'Activité commerciale',
  'dash.activity.sub':        'Décrivez ce que fera votre société',
  'dash.activity.ph':         'Ex. Commerce international, conseil...',
  'dash.bank.label':          'Compte bancaire',
  'dash.bank.feat1':          'Compte en 5 minutes',
  'dash.bank.feat2':          'Multi-devises',
  'dash.bank.feat3':          'Compatible Stripe',
  'dash.bank.feat4':          '100% en ligne',

  // BLOG
  'blog.eyebrow':             'Guides & Analyses',
  'blog.title':               'Le blog pour les entrepreneurs internationaux',
  'blog.sub':                 "Guides pratiques, analyses fiscales et conseils d'experts pour structurer votre activité internationale depuis Hong Kong.",
  'blog.read':                'Lire l\'article →',
  'blog.footer.copy':         '© 2025 Luminous · Services aux entreprises à Hong Kong',
},

// ══════════════════════════════════════════════
//  ESPAÑOL
// ══════════════════════════════════════════════
es: {
  // NAV
  'nav.back':            'Volver al sitio',
  'nav.logout':          'Cerrar sesión',
  'nav.get.started':     'Empezar',

  // LOGIN
  'login.eyebrow':            'Empezar',
  'login.title':              'Crear su cuenta',
  'login.sub':                'Regístrese para acceder a su panel de cliente y proceder con la creación de su sociedad.',
  'login.tab.register':       'Crear cuenta',
  'login.tab.login':          'Ya tengo cuenta',
  'login.fname':              'Nombre',
  'login.lname':              'Apellidos',
  'login.email':              'Correo electrónico',
  'login.whatsapp':           'Número de WhatsApp',
  'login.whatsapp.hint':      'Le contactaremos por WhatsApp para el seguimiento de su expediente',
  'login.password':           'Contraseña',
  'login.password.hint':      'Mín. 8 caracteres',
  'login.btn.register':       'Crear mi cuenta →',
  'login.btn.login':          'Iniciar sesión →',
  'login.err.name':           'Por favor, introduzca su nombre y apellidos.',
  'login.err.email':          'Por favor, introduzca un correo electrónico válido.',
  'login.err.whatsapp':       'Por favor, introduzca su número de WhatsApp.',
  'login.err.password':       'La contraseña debe tener al menos 8 caracteres.',
  'login.err.fields':         'Por favor, rellene todos los campos.',
  'login.err.invalid':        'Correo electrónico o contraseña incorrectos.',

  // DASHBOARD — SIDEBAR
  'dash.my.file':         'Mi expediente',
  'dash.progress':        'Progreso',
  'dash.upload':          'Subir archivos',
  'dash.documents':       'Documentos',
  'dash.affiliate':       'Afiliados',
  'dash.main.site':       'Sitio principal',

  // DASHBOARD — PROGRESS
  'dash.progress.title':      'Progreso de la constitución',
  'dash.no.order':            'Ningún pedido activo aún.',
  'dash.order.now':           'Hacer pedido →',
  'dash.payment.ready':       'Listo para proceder',
  'dash.payment.choose':      'Elija su servicio',
  'dash.payment.sub':         'Pago seguro mediante Stripe',
  'dash.create.btn':          'Crear mi empresa — 1.490 $ →',
  'dash.renew.btn':           'Renovación anual — 990 $ →',
  'dash.payment.confirmed':   'Pago confirmado',
  'dash.processing':          'Su expediente está siendo procesado.',

  // STEPS
  'step.pending':             'En espera de pedido',
  'step.pending.desc':        'Realice su pedido para iniciar su expediente.',
  'step.payment':             'Pago confirmado',
  'step.payment.desc':        'Pago recibido — hemos iniciado su expediente.',
  'step.docs':                'Documentos verificados',
  'step.docs.desc':           'Sus documentos han sido verificados por nuestro equipo.',
  'step.filing':              'Registro en curso',
  'step.filing.desc':         'Su solicitud ha sido presentada ante las autoridades de Hong Kong.',
  'step.certificate':         'Certificado emitido',
  'step.certificate.desc':    'Su certificado de constitución ha sido emitido.',
  'step.completed':           'Completado',
  'step.completed.desc':      'Su empresa está completamente operativa.',
  'step.done':                'Hecho',
  'step.inprogress':          'En curso',
  'step.waiting':             'Pendiente',

  // COMPANY DETAILS
  'dash.company.name.label':  'Nombre de la empresa',
  'dash.jurisdiction':        'Jurisdicción',
  'dash.type':                'Tipo',
  'dash.account.created':     'Cuenta creada el',

  // UPLOAD
  'dash.docs.required':       'Documentos requeridos',
  'dash.docs.prompt':         'Por favor, suba sus documentos para continuar.',
  'dash.doc.passport':        'Foto del pasaporte',
  'dash.doc.passport.sub':    'Pasaporte completo visible — sin recortar',
  'dash.doc.selfie':          'Selfi con pasaporte',
  'dash.doc.selfie.sub':      'Cara claramente visible, pasaporte abierto',
  'dash.doc.address':         'Justificante de domicilio',
  'dash.doc.address.sub':     'Factura, extracto bancario, DNI...',
  'dash.upload.btn':          'Subir →',
  'dash.upload.done':         'Recibido ✓',
  'dash.name1':               'Opción de nombre 1',
  'dash.name2':               'Opción de nombre 2',
  'dash.name3':               'Opción de nombre 3',
  'dash.activity':            'Actividad comercial',
  'dash.activity.ph':         'Describa su actividad principal',
  'dash.submit.btn':          'Enviar mi expediente →',
  'dash.submit.success':      '✓ Su expediente ha sido enviado. Nuestro equipo lo revisará en 24 horas.',

  // DOCUMENTS
  'dash.docs.title':          'Documentos oficiales de la empresa',
  'dash.docs.sub':            'Sus documentos — disponibles según avanza su expediente. Clic para descargar.',
  'dash.bank.title':          'Abrir su cuenta Airwallex',
  'dash.bank.sub':            'Airwallex es nuestro socio bancario recomendado.',
  'dash.bank.btn':            'Crear cuenta →',
  'dash.bank.hint':           'Puede abrir su cuenta Airwallex en cuanto se emita su certificado de constitución.',

  // AFFILIATE
  'dash.aff.title':           'Mi enlace de referido',
  'dash.aff.sub':             'Comparta su enlace — gane entre 150 $ y 250 $ por cada referido confirmado',
  'dash.aff.clicks':          'Clics en el enlace',
  'dash.aff.conv':            'Conversiones',
  'dash.aff.earned':          'Total ganado',
  'dash.aff.pending':         'Pago pendiente',
  'dash.aff.link.label':      'Su enlace de referido único',
  'dash.aff.copy':            'Copiar',
  'dash.aff.copied':          'Copiado ✓',
  'dash.aff.commission':      'Estructura de comisiones',
  'dash.aff.tier1':           '1–3 / mes',
  'dash.aff.tier2':           '4–9 / mes',
  'dash.aff.tier3':           '10+ / mes',
  'dash.aff.renewal.note':    '+ 80 $ por renovación anual referida · Pagos mensuales por transferencia o cripto',
  'dash.aff.my.referrals':    'Mis referidos',
  'dash.aff.email.col':       'Correo',
  'dash.aff.date.col':        'Fecha',
  'dash.aff.status.col':      'Estado',
  'dash.aff.commission.col':  'Comisión',
  'dash.aff.no.referrals':    'Sin referidos aún — comparte tu enlace para empezar a ganar',


  // DASHBOARD — extra keys
  'dash.company.details':     'Detalles de la empresa',
  'dash.submit.docs':         'Ahora envíe sus documentos',
  'dash.submit.docs.sub':     'Suba su pasaporte, selfie y justificante de domicilio para continuar',
  'dash.submit.docs.btn':     'Enviar documentos →',
  'dash.upload.title':        'Enviar sus documentos',
  'dash.upload.sub':          'Necesitamos la siguiente información para iniciar su constitución.',
  'dash.names.title':         'Nombres de empresa deseados',
  'dash.names.sub':           'Proporcione 3 opciones por orden de preferencia',
  'dash.name1':               '1ª opción',
  'dash.name2':               '2ª opción',
  'dash.name3':               '3ª opción',
  'dash.name1.ph':            'Ej. Acme International Ltd.',
  'dash.name2.ph':            'Ej. Acme Global Ltd.',
  'dash.name3.ph':            'Ej. Acme Holdings Ltd.',
  'dash.names.hint':          'Si su primera opción ya está tomada, probaremos automáticamente la siguiente. Todos los nombres deben terminar en Limited o Ltd.',
  'dash.activity.title':      'Actividad comercial',
  'dash.activity.sub':        'Describa qué hará su empresa',
  'dash.activity.ph':         'Ej. Comercio internacional, consultoría...',
  'dash.bank.label':          'Cuenta bancaria',
  'dash.bank.feat1':          'Cuenta en 5 minutos',
  'dash.bank.feat2':          'Multidivisa',
  'dash.bank.feat3':          'Compatible con Stripe',
  'dash.bank.feat4':          '100% remoto',

  // BLOG
  'blog.eyebrow':             'Guías & Análisis',
  'blog.title':               'El blog para emprendedores internacionales',
  'blog.sub':                 'Guías prácticas, análisis fiscales y asesoramiento experto para estructurar su actividad internacional desde Hong Kong.',
  'blog.read':                'Leer artículo →',
  'blog.footer.copy':         '© 2025 Luminous · Servicios corporativos en Hong Kong',
},

// ══════════════════════════════════════════════
//  中文
// ══════════════════════════════════════════════
zh: {
  // NAV
  'nav.back':            '返回网站',
  'nav.logout':          '退出登录',
  'nav.get.started':     '立即开始',

  // LOGIN
  'login.eyebrow':            '立即开始',
  'login.title':              '创建您的账户',
  'login.sub':                '注册后即可访问您的客户控制台，并开始香港公司注册流程。',
  'login.tab.register':       '创建账户',
  'login.tab.login':          '已有账户',
  'login.fname':              '名字',
  'login.lname':              '姓氏',
  'login.email':              '电子邮箱',
  'login.whatsapp':           'WhatsApp号码',
  'login.whatsapp.hint':      '我们将通过WhatsApp联系您，跟进您的档案进度',
  'login.password':           '密码',
  'login.password.hint':      '至少8位字符',
  'login.btn.register':       '创建我的账户 →',
  'login.btn.login':          '登录 →',
  'login.err.name':           '请输入您的姓名。',
  'login.err.email':          '请输入有效的电子邮箱地址。',
  'login.err.whatsapp':       '请输入您的WhatsApp号码。',
  'login.err.password':       '密码至少需要8位字符。',
  'login.err.fields':         '请填写所有字段。',
  'login.err.invalid':        '电子邮箱或密码错误。',

  // DASHBOARD — SIDEBAR
  'dash.my.file':         '我的档案',
  'dash.progress':        '进度',
  'dash.upload':          '上传文件',
  'dash.documents':       '文件',
  'dash.affiliate':       '联盟计划',
  'dash.main.site':       '主网站',

  // DASHBOARD — PROGRESS
  'dash.progress.title':      '公司注册进度',
  'dash.no.order':            '暂无活跃订单。',
  'dash.order.now':           '立即下单 →',
  'dash.payment.ready':       '准备好继续了',
  'dash.payment.choose':      '选择您的服务',
  'dash.payment.sub':         '通过Stripe安全付款',
  'dash.create.btn':          '注册我的公司 — $1,490 →',
  'dash.renew.btn':           '年度续期 — $990 →',
  'dash.payment.confirmed':   '付款已确认',
  'dash.processing':          '您的档案正在处理中。',

  // STEPS
  'step.pending':             '等待下单',
  'step.pending.desc':        '请下单以开始您的档案。',
  'step.payment':             '付款已确认',
  'step.payment.desc':        '已收到付款——我们已开始处理您的档案。',
  'step.docs':                '文件已核实',
  'step.docs.desc':           '您的文件已由我们的团队核实。',
  'step.filing':              '注册中',
  'step.filing.desc':         '您的申请已提交至香港当局。',
  'step.certificate':         '证书已签发',
  'step.certificate.desc':    '您的公司注册证书已签发。',
  'step.completed':           '已完成',
  'step.completed.desc':      '您的公司已全面投入运营。',
  'step.done':                '已完成',
  'step.inprogress':          '进行中',
  'step.waiting':             '待处理',

  // COMPANY DETAILS
  'dash.company.name.label':  '公司名称',
  'dash.jurisdiction':        '管辖地',
  'dash.type':                '类型',
  'dash.account.created':     '账户创建时间',

  // UPLOAD
  'dash.docs.required':       '所需文件',
  'dash.docs.prompt':         '请上传您的文件以继续流程。',
  'dash.doc.passport':        '护照照片',
  'dash.doc.passport.sub':    '护照完整可见——不可裁剪',
  'dash.doc.selfie':          '手持护照自拍',
  'dash.doc.selfie.sub':      '面部清晰可见，护照翻开',
  'dash.doc.address':         '住址证明',
  'dash.doc.address.sub':     '水电单、银行账单、身份证...',
  'dash.upload.btn':          '上传 →',
  'dash.upload.done':         '已收到 ✓',
  'dash.name1':               '公司名称选项1',
  'dash.name2':               '公司名称选项2',
  'dash.name3':               '公司名称选项3',
  'dash.activity':            '经营活动',
  'dash.activity.ph':         '请描述您的主要经营活动',
  'dash.submit.btn':          '提交我的档案 →',
  'dash.submit.success':      '✓ 您的档案已提交。我们的团队将在24小时内审核。',

  // DOCUMENTS
  'dash.docs.title':          '公司官方文件',
  'dash.docs.sub':            '您的文件——随档案进度逐步开放。点击下载。',
  'dash.bank.title':          '开立您的Airwallex账户',
  'dash.bank.sub':            'Airwallex是我们推荐的银行合作伙伴。',
  'dash.bank.btn':            '创建账户 →',
  'dash.bank.hint':           '公司注册证书签发后，您即可开立Airwallex账户。',

  // AFFILIATE
  'dash.aff.title':           '我的推荐链接',
  'dash.aff.sub':             '分享您的专属链接——每成功推荐一位客户可获得150至250美元佣金',
  'dash.aff.clicks':          '链接点击数',
  'dash.aff.conv':            '转化数',
  'dash.aff.earned':          '已赚取总额',
  'dash.aff.pending':         '待支付金额',
  'dash.aff.link.label':      '您的专属推荐链接',
  'dash.aff.copy':            '复制',
  'dash.aff.copied':          '已复制 ✓',
  'dash.aff.commission':      '佣金结构',
  'dash.aff.tier1':           '每月1–3位',
  'dash.aff.tier2':           '每月4–9位',
  'dash.aff.tier3':           '每月10位以上',
  'dash.aff.renewal.note':    '+ 每成功推荐年度续期可获$80 · 每月通过电汇或加密货币支付',
  'dash.aff.my.referrals':    '我的推荐记录',
  'dash.aff.email.col':       '邮箱',
  'dash.aff.date.col':        '日期',
  'dash.aff.status.col':      '状态',
  'dash.aff.commission.col':  '佣金',
  'dash.aff.no.referrals':    '暂无推荐记录——分享您的链接开始赚取佣金',


  // DASHBOARD — extra keys
  'dash.company.details':     '公司详情',
  'dash.submit.docs':         '现在提交您的文件',
  'dash.submit.docs.sub':     '请上传护照、自拍和住址证明以继续流程',
  'dash.submit.docs.btn':     '提交文件 →',
  'dash.upload.title':        '提交您的文件',
  'dash.upload.sub':          '我们需要以下信息来启动您的注册流程。',
  'dash.names.title':         '期望公司名称',
  'dash.names.sub':           '按优先顺序提供3个选项',
  'dash.name1':               '第一选择',
  'dash.name2':               '第二选择',
  'dash.name3':               '第三选择',
  'dash.name1.ph':            '例：Acme International Ltd.',
  'dash.name2.ph':            '例：Acme Global Ltd.',
  'dash.name3.ph':            '例：Acme Holdings Ltd.',
  'dash.names.hint':          '如果您的第一选择已被注册，我们将自动尝试下一个。所有名称必须以Limited或Ltd结尾。',
  'dash.activity.title':      '经营活动',
  'dash.activity.sub':        '描述您的公司将从事的业务',
  'dash.activity.ph':         '例：国际贸易、咨询服务...',
  'dash.bank.label':          '银行账户',
  'dash.bank.feat1':          '5分钟开户',
  'dash.bank.feat2':          '多币种',
  'dash.bank.feat3':          '支持Stripe',
  'dash.bank.feat4':          '全程在线',

  // BLOG
  'blog.eyebrow':             '指南与分析',
  'blog.title':               '国际创业者博客',
  'blog.sub':                 '实用指南、税务分析及专家建议，助您从香港构建国际业务架构。',
  'blog.read':                '阅读文章 →',
  'blog.footer.copy':         '© 2025 徕米诺 · 香港企业服务',
},

}; // end LANG

// ─────────────────────────────────────────────
//  LANG SWITCHER UI — CSS
// ─────────────────────────────────────────────
const LK_CSS = `
.lk-wrap{position:relative;display:inline-block;}
.lk-btn{display:flex;align-items:center;gap:5px;background:transparent;border:1px solid var(--gr,#2E2E2E);color:var(--lt,#D4D4D4);padding:5px 9px;border-radius:2px;cursor:pointer;font-size:.78rem;font-family:inherit;transition:all .3s;line-height:1;}
.lk-btn:hover{border-color:rgba(200,16,46,0.5);}
.lk-flag{font-size:.95rem;line-height:1;}
.lk-code{font-size:.72rem;letter-spacing:.05em;opacity:.8;}
.lk-arrow{font-size:.45rem;opacity:.5;transition:transform .3s;}
.lk-wrap.open .lk-arrow{transform:rotate(180deg);}
.lk-drop{position:absolute;top:calc(100% + 6px);right:0;background:var(--d2,#181818);border:1px solid var(--gr,#2E2E2E);border-radius:4px;min-width:148px;overflow:hidden;opacity:0;transform:translateY(-6px);pointer-events:none;transition:all .22s;z-index:9999;}
.lk-wrap.open .lk-drop{opacity:1;transform:translateY(0);pointer-events:auto;}
.lk-opt{display:flex;align-items:center;gap:9px;padding:9px 12px;cursor:pointer;font-size:.74rem;color:var(--sv,#8A8A8A);transition:all .18s;border-bottom:1px solid rgba(255,255,255,0.04);}
.lk-opt:last-child{border:none;}
.lk-opt:hover{background:rgba(200,16,46,0.08);color:var(--wh,#F5F5F5);}
.lk-opt.active{color:#C8102E;}
.lk-opt-name{font-weight:500;}
.lk-opt-lbl{font-size:.6rem;opacity:.55;margin-left:auto;}
`;

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const LANG_META = {
  en: { flag:'🇬🇧', code:'EN', name:'English' },
  fr: { flag:'🇫🇷', code:'FR', name:'Français' },
  es: { flag:'🇪🇸', code:'ES', name:'Español' },
  zh: { flag:'🇨🇳', code:'ZH', name:'中文' },
};

let _lang = 'en';

function getLang() { return _lang; }

function getPreferredTheme() {
  const saved = localStorage.getItem('lum_theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
  if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
  localStorage.setItem('lum_theme', theme);
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
  if (!localStorage.getItem('lum_theme')) applyTheme(e.matches ? 'light' : 'dark');
});

function setLang(l) {
  _lang = l;
  const t = LANG[l] || LANG['en'];
  document.documentElement.lang = l;
  document.body.classList.toggle('lang-zh', l === 'zh');

  // Apply data-lk text
  document.querySelectorAll('[data-lk]').forEach(el => {
    const k = el.getAttribute('data-lk');
    if (t[k] !== undefined) el.textContent = t[k];
  });

  // Apply data-lk-ph placeholders
  document.querySelectorAll('[data-lk-ph]').forEach(el => {
    const k = el.getAttribute('data-lk-ph');
    if (t[k] !== undefined) el.placeholder = t[k];
  });

  // Update switcher UI
  document.querySelectorAll('.lk-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === l);
  });
  const flagEl = document.querySelector('.lk-flag');
  const codeEl = document.querySelector('.lk-code');
  if (flagEl) flagEl.textContent = LANG_META[l].flag;
  if (codeEl) codeEl.textContent = LANG_META[l].code;

  // Close dropdown
  document.querySelectorAll('.lk-wrap').forEach(w => w.classList.remove('open'));

  try { localStorage.setItem('lum_lang', l); } catch(e) {}
}

function toggleLangDropdown(el) {
  el.closest('.lk-wrap').classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.lk-wrap')) {
    document.querySelectorAll('.lk-wrap').forEach(w => w.classList.remove('open'));
  }
});

function langSwitcherHTML() {
  const opts = Object.entries(LANG_META).map(([code, m]) =>
    `<div class="lk-opt${code === _lang ? ' active' : ''}" data-lang="${code}" onclick="setLang('${code}')">`+
    `<span>${m.flag}</span><span class="lk-opt-name">${m.name}</span><span class="lk-opt-lbl">${m.code}</span></div>`
  ).join('');
  const cur = LANG_META[_lang];
  return `<div class="lk-wrap" id="lkSwitcher">`+
    `<button class="lk-btn" onclick="toggleLangDropdown(this)">`+
    `<span class="lk-flag">${cur.flag}</span>`+
    `<span class="lk-code">${cur.code}</span>`+
    `<span class="lk-arrow">▼</span>`+
    `</button>`+
    `<div class="lk-drop">${opts}</div>`+
    `</div>`;
}

function initLang() {
  let saved = 'en';
  try { saved = localStorage.getItem('lum_lang') || 'en'; } catch(e) {}
  // Detect browser language if no saved preference
  if (!localStorage.getItem('lum_lang')) {
    const browser = navigator.language?.slice(0,2).toLowerCase();
    if (LANG[browser]) saved = browser;
  }
  if (saved !== 'en') setLang(saved);
  else setLang('en');
}
